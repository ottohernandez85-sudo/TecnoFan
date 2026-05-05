import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import {
  attachPrincipal,
  requireStaff,
  requireRole,
  requireCustomer,
  requireBearerPrincipal,
} from '../../middleware/auth.js';
import { buildOrderReceiptPdf } from '../../utils/orderReceiptPdf.js';

const router = Router();

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const itemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
});

const createOrderSchema = z.object({
  items: z.array(itemSchema).min(1),
  deliveryName: z.string().min(1),
  deliveryPhone: z.string().min(1),
  deliveryAddress: z.string().min(1),
  deliveryCity: z.string().min(1),
  deliveryNit: z.string().optional().nullable(),
  paymentMethod: z.string().min(1),
});

const patchOrderSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

function isCancellable(status) {
  return ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(status);
}

async function loadSiteCompany() {
  const s = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  return {
    companyLegalName: s?.companyLegalName || 'Tecnofan Guatemala S.A.',
    companyAddress: s?.companyAddress || '',
    companyPhone: s?.companyPhone || '',
    companyEmail: s?.companyEmail || '',
    companyTaxId: s?.companyTaxId || '',
    brandName: s?.brandName || 'Tecnofan',
  };
}

async function restoreStock(tx, order) {
  for (const line of order.items) {
    await tx.product.update({
      where: { id: line.productId },
      data: { stock: { increment: line.quantity } },
    });
  }
}

const orderInclude = {
  customer: { select: { id: true, email: true, name: true, phone: true } },
  items: { include: { product: true } },
};

router.get('/', attachPrincipal, requireStaff, requireRole('ADMIN', 'STAFF'), async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: orderInclude,
    });
    res.json(orders);
  } catch (e) {
    next(e);
  }
});

router.post('/', attachPrincipal, requireCustomer, async (req, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body);
    const productIds = body.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Algún producto no existe' });
    }
    let total = new Prisma.Decimal(0);
    const lines = [];
    for (const line of body.items) {
      const p = products.find((x) => x.id === line.productId);
      if (!p) continue;
      if (p.stock < line.quantity) {
        return res.status(400).json({ error: `Stock insuficiente: ${p.name}` });
      }
      const unit = p.price;
      const sub = unit.mul(line.quantity);
      total = total.add(sub);
      lines.push({ productId: p.id, quantity: line.quantity, unitPrice: unit });
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerId: req.customer.id,
          total,
          status: 'CONFIRMED',
          deliveryName: body.deliveryName,
          deliveryPhone: body.deliveryPhone,
          deliveryAddress: body.deliveryAddress,
          deliveryCity: body.deliveryCity,
          deliveryNit: body.deliveryNit || null,
          paymentMethod: body.paymentMethod,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });
      for (const line of body.items) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stock: { decrement: line.quantity } },
        });
      }
      return created;
    });

    res.status(201).json(order);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message });
    }
    next(e);
  }
});

router.get('/mine', attachPrincipal, requireCustomer, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.customer.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
    res.json(orders);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/receipt', attachPrincipal, requireBearerPrincipal, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    if (req.staff) {
      if (req.staff.role !== 'ADMIN' && req.staff.role !== 'STAFF') {
        return res.status(403).json({ error: 'Sin permiso' });
      }
    } else if (req.customer) {
      if (order.customerId !== req.customer.id) {
        return res.status(403).json({ error: 'Sin permiso' });
      }
    } else {
      return res.status(403).json({ error: 'Sin permiso' });
    }
    const site = await loadSiteCompany();
    const pdf = await buildOrderReceiptPdf({
      order,
      company: site,
      brandName: site.brandName,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${id}.pdf"`);
    res.send(pdf);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/cancel', attachPrincipal, requireStaff, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) {
        const err = new Error('Orden no encontrada');
        err.status = 404;
        throw err;
      }
      if (order.status === 'CANCELLED') {
        return tx.order.findUnique({
          where: { id },
          include: orderInclude,
        });
      }
      if (!isCancellable(order.status)) {
        const err = new Error('No se puede cancelar en este estado');
        err.status = 400;
        throw err;
      }
      await restoreStock(tx, order);
      return tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: orderInclude,
      });
    });
    res.json(updated);
  } catch (e) {
    if (e.status) {
      return res.status(e.status).json({ error: e.message });
    }
    next(e);
  }
});

router.patch('/:id', attachPrincipal, requireStaff, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const { status } = patchOrderSchema.parse(req.body);

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) {
        const err = new Error('Orden no encontrada');
        err.status = 404;
        throw err;
      }
      if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
        const err = new Error('No se puede cambiar el estado de una orden cancelada');
        err.status = 400;
        throw err;
      }
      if (status === 'CANCELLED') {
        if (order.status === 'CANCELLED') {
          return tx.order.findUnique({
            where: { id },
            include: orderInclude,
          });
        }
        if (!isCancellable(order.status)) {
          const err = new Error('No se puede cancelar en este estado');
          err.status = 400;
          throw err;
        }
        await restoreStock(tx, order);
      }
      return tx.order.update({
        where: { id },
        data: { status },
        include: orderInclude,
      });
    });

    res.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message });
    }
    if (e.status) {
      return res.status(e.status).json({ error: e.message });
    }
    next(e);
  }
});

router.get('/:id', attachPrincipal, requireBearerPrincipal, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const order = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    if (req.staff) {
      if (req.staff.role !== 'ADMIN' && req.staff.role !== 'STAFF') {
        return res.status(403).json({ error: 'Sin permiso' });
      }
    } else if (req.customer) {
      if (order.customerId !== req.customer.id) {
        return res.status(403).json({ error: 'Sin permiso' });
      }
    } else {
      return res.status(403).json({ error: 'Sin permiso' });
    }
    res.json(order);
  } catch (e) {
    next(e);
  }
});

export default router;
