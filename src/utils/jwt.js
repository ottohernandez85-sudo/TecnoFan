import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signStaffToken(sub, role) {
  return jwt.sign({ sub, role, typ: 'staff' }, env.jwtSecret, { expiresIn: '7d' });
}

export function signCustomerToken(sub) {
  return jwt.sign({ sub, typ: 'customer' }, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
