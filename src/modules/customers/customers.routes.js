import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { hashPassword } from '../../utils/hash.js';
import { attachPrincipal, requireStaff, requireRole } from '../../middleware/auth.js';

const router = Router();

router.use(attachPrincipal, requireStaff, requireRole('ADMIN'));

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
});

const updateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  password: z.string().min(6).optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
    res.json(customers);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const existing = await prisma.customer.findUnique({ where: { email: body.email } });
    if (existing) {
      return res.status(400).json({ error: 'El correo ya existe' });
    }
    const password = await hashPassword(body.password);
    const customer = await prisma.customer.create({
      data: {
        email: body.email,
        password,
        name: body.name,
        phone: body.phone || null,
      },
      select: { id: true, email: true, name: true, phone: true, createdAt: true },
    });
    res.status(201).json(customer);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message });
    }
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, total: true, status: true, createdAt: true },
        },
      },
    });
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(customer);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const body = updateSchema.parse(req.body);
    const data = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.password) {
      data.password = await hashPassword(body.password);
    }
    if (body.email) {
      const clash = await prisma.customer.findFirst({
        where: { email: body.email, NOT: { id } },
      });
      if (clash) {
        return res.status(400).json({ error: 'El correo ya está en uso' });
      }
    }
    const customer = await prisma.customer.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, phone: true, createdAt: true },
    });
    res.json(customer);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message });
    }
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    if (e.code === 'P2002') {
      return res.status(400).json({ error: 'El correo ya existe' });
    }
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    await prisma.customer.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    next(e);
  }
});

export default router;
