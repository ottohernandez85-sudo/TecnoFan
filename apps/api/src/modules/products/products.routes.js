import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { attachPrincipal, requireStaff, requireRole } from '../../middleware/auth.js';
import { uploadProduct } from '../../middleware/upload.js';
import { optimizeUploadToWebp } from '../../utils/optimizeUploadImage.js';

const router = Router();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0).optional(),
  imageUrl: z.string().optional().nullable(),
  badge: z.string().optional().nullable(),
  attributes: z.record(z.unknown()).optional().nullable(),
  categoryId: z.coerce.number().int().positive(),
});

router.get('/', async (req, res, next) => {
  try {
    const { categoryId, search, minPrice, maxPrice } = req.query;
    const where = {};
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    if (minPrice != null || maxPrice != null) {
      where.price = {};
      if (minPrice != null) {
        where.price.gte = new Prisma.Decimal(String(minPrice));
      }
      if (maxPrice != null) {
        where.price.lte = new Prisma.Decimal(String(maxPrice));
      }
    }
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (e) {
    next(e);
  }
});

router.get('/slug/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { category: true },
    });
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (e) {
    next(e);
  }
});

router.post('/', attachPrincipal, requireStaff, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const slug = body.slug || slugify(body.name);
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        stock: body.stock ?? 0,
        imageUrl: body.imageUrl ?? null,
        badge: body.badge ?? null,
        attributes: body.attributes ?? undefined,
        categoryId: body.categoryId,
      },
      include: { category: true },
    });
    res.status(201).json(product);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message });
    }
    if (e.code === 'P2002') {
      return res.status(400).json({ error: 'Slug ya existe' });
    }
    next(e);
  }
});

router.post('/:id/image', attachPrincipal, requireStaff, requireRole('ADMIN'), (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }
  uploadProduct.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error al subir' });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Selecciona un archivo de imagen' });
      }
      const { publicPath } = await optimizeUploadToWebp(req.file.path);
      const product = await prisma.product.update({
        where: { id },
        data: { imageUrl: publicPath },
        include: { category: true },
      });
      res.json(product);
    } catch (e) {
      if (e.code === 'P2025') {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      next(e);
    }
  });
});

router.put('/:id', attachPrincipal, requireStaff, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = productSchema.partial().parse(req.body);
    const data = { ...body };
    if (body.name && !body.slug) {
      data.slug = slugify(body.name);
    }
    if (body.price != null) {
      data.price = body.price;
    }
    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
    res.json(product);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message });
    }
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    next(e);
  }
});

router.delete('/:id', attachPrincipal, requireStaff, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    next(e);
  }
});

export default router;
