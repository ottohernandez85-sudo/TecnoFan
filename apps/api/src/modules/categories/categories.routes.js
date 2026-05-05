import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { attachPrincipal, requireStaff, requireRole } from '../../middleware/auth.js';

const router = Router();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().max(4000).optional(),
  imageUrl: z.string().optional().nullable(),
  icon: z.string().max(32).optional().nullable(),
});

router.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json(categories);
  } catch (e) {
    next(e);
  }
});

router.post('/', attachPrincipal, requireStaff, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const body = categorySchema.parse(req.body);
    const slug = body.slug || slugify(body.name);
    const cat = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description ?? '',
        imageUrl: body.imageUrl ?? null,
        icon: body.icon ?? null,
      },
    });
    res.status(201).json(cat);
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

router.put('/:id', attachPrincipal, requireStaff, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = categorySchema.partial().parse(req.body);
    const data = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.description !== undefined) data.description = body.description;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
    if (body.icon !== undefined) data.icon = body.icon;
    if (body.name && !body.slug) {
      data.slug = slugify(body.name);
    }
    const cat = await prisma.category.update({
      where: { id },
      data,
    });
    res.json(cat);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message });
    }
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    next(e);
  }
});

router.delete('/:id', attachPrincipal, requireStaff, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    next(e);
  }
});

export default router;
