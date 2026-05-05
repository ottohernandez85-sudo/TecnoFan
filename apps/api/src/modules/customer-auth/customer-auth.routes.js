import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { hashPassword, verifyPassword } from '../../utils/hash.js';
import { signCustomerToken } from '../../utils/jwt.js';
import { attachPrincipal, requireCustomer } from '../../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.customer.findUnique({ where: { email: body.email } });
    if (existing) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    const password = await hashPassword(body.password);
    const customer = await prisma.customer.create({
      data: {
        email: body.email,
        password,
        name: body.name,
        phone: body.phone || null,
      },
      select: { id: true, email: true, name: true, phone: true },
    });
    const token = signCustomerToken(customer.id);
    res.status(201).json({ customer, token });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message || 'Datos inválidos' });
    }
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const customer = await prisma.customer.findUnique({ where: { email: body.email } });
    if (!customer) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const ok = await verifyPassword(body.password, customer.password);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = signCustomerToken(customer.id);
    res.json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
      },
      token,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message || 'Datos inválidos' });
    }
    next(e);
  }
});

router.get('/me', attachPrincipal, requireCustomer, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.customer.id },
      select: { id: true, email: true, name: true, phone: true },
    });
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(customer);
  } catch (e) {
    next(e);
  }
});

export default router;
