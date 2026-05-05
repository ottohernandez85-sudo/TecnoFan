import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { attachPrincipal, requireStaff, requireRole } from '../../middleware/auth.js';

const router = Router();

router.use(attachPrincipal, requireStaff, requireRole('ADMIN'));

router.get('/', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json(users);
  } catch (e) {
    next(e);
  }
});

const roleSchema = z.object({
  role: z.enum(['ADMIN', 'STAFF']),
});

router.put('/:id/role', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const { role } = roleSchema.parse(req.body);
    if (id === req.staff.id && role !== 'ADMIN') {
      return res.status(400).json({ error: 'No puedes quitarte el rol de administrador' });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
    res.json(user);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message });
    }
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    next(e);
  }
});

export default router;
