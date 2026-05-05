import { verifyToken } from '../utils/jwt.js';

/** Decodifica Bearer y asigna req.principal = { typ, sub, role? } */
export function attachPrincipal(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      req.principal = null;
      return next();
    }
    const decoded = verifyToken(header.slice(7));
    if (decoded.typ === 'staff') {
      req.principal = { typ: 'staff', sub: decoded.sub, role: decoded.role };
    } else if (decoded.typ === 'customer') {
      req.principal = { typ: 'customer', sub: decoded.sub };
    } else {
      return res.status(401).json({ error: 'Token inválido' });
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireStaff(req, res, next) {
  if (req.principal?.typ !== 'staff') {
    return res.status(401).json({ error: 'Se requiere acceso de personal (backoffice)' });
  }
  req.staff = { id: req.principal.sub, role: req.principal.role };
  next();
}

export function requireCustomer(req, res, next) {
  if (req.principal?.typ !== 'customer') {
    return res.status(401).json({ error: 'Se requiere cuenta de cliente' });
  }
  req.customer = { id: Number(req.principal.sub) };
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    if (!roles.includes(req.staff.role)) {
      return res.status(403).json({ error: 'Sin permisos' });
    }
    next();
  };
}

/** Bearer obligatorio + staff */
/** Bearer obligatorio: staff o customer (asigna req.staff o req.customer). */
export function requireBearerPrincipal(req, res, next) {
  if (!req.principal) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  if (req.principal.typ === 'staff') {
    req.staff = { id: req.principal.sub, role: req.principal.role };
    return next();
  }
  if (req.principal.typ === 'customer') {
    req.customer = { id: Number(req.principal.sub) };
    return next();
  }
  return res.status(401).json({ error: 'Token inválido' });
}

export function requireStaffAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  try {
    const decoded = verifyToken(header.slice(7));
    if (decoded.typ !== 'staff') {
      return res.status(401).json({ error: 'Se requiere acceso de personal' });
    }
    req.principal = { typ: 'staff', sub: decoded.sub, role: decoded.role };
    req.staff = { id: decoded.sub, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
