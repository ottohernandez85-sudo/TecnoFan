import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { verifyPassword } from '../../utils/hash.js';
import { signStaffToken } from '../../utils/jwt.js';
import { attachPrincipal, requireStaff } from '../../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const ok = await verifyPassword(body.password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      return res.status(403).json({ error: 'Solo personal del backoffice puede acceder aquí' });
    }
    const token = signStaffToken(user.id, user.role);
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message || 'Datos inválidos' });
    }
    next(e);
  }
});

router.get('/me', attachPrincipal, requireStaff, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.staff.id },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (e) {
    next(e);
  }
});

export default router;
