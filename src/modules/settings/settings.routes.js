import path from 'path';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { attachPrincipal, requireStaff, requireRole } from '../../middleware/auth.js';
import { uploadLogo, uploadFooterLogo, uploadHero } from '../../middleware/upload.js';
import { optimizeUploadToWebp } from '../../utils/optimizeUploadImage.js';

const router = Router();

const menuItemSchema = z.object({
  label: z.string().min(1),
  path: z.string().min(1),
  icon: z.string().max(32).optional().nullable(),
});

const updateSchema = z.object({
  brandName: z.string().min(1).optional(),
  colorPrimary: z.string().min(1).optional(),
  colorAccent: z.string().min(1).optional(),
  colorBg: z.string().min(1).optional(),
  colorSurface: z.string().min(1).optional(),
  colorText: z.string().min(1).optional(),
  menuItems: z.array(menuItemSchema).optional(),
  productTemplate: z.enum(['standard', 'compact', 'detailed']).optional(),
  logoUrl: z.union([z.string().url(), z.null()]).optional(),
  footerLogoUrl: z.union([z.string().min(1), z.null()]).optional(),
  companyLegalName: z.string().min(1).optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  companyPhone: z.string().optional().nullable(),
  companyEmail: z.string().optional().nullable(),
  companyTaxId: z.string().optional().nullable(),
  heroBadge: z.string().max(160).optional(),
  heroTitle: z.string().max(240).optional(),
  heroSubtitle: z.string().max(600).optional(),
  heroSlides: z.array(z.union([z.string(), z.null()])).max(3).optional(),
});

function normalizeHeroSlides(raw) {
  const a = Array.isArray(raw) ? [...raw] : [];
  while (a.length < 3) a.push(null);
  return a.slice(0, 3).map((x) => (typeof x === 'string' && x.trim() ? x.trim() : null));
}

function respondSettings(s) {
  return {
    ...s,
    menuItems: Array.isArray(s.menuItems) ? s.menuItems : defaultMenu(),
    heroSlides: normalizeHeroSlides(s.heroSlides),
  };
}

async function ensureSettings() {
  let s = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  if (!s) {
    s = await prisma.siteSetting.create({
      data: {
        id: 1,
        menuItems: defaultMenu(),
      },
    });
  }
  return s;
}

function defaultMenu() {
  return [
    { label: 'Smart Fans', path: '/catalog?category=smart-fans', icon: 'fan' },
    { label: 'Ceiling Fans', path: '/catalog?category=ceiling-fans', icon: 'wind' },
    { label: 'Industrial', path: '/catalog?category=industrial', icon: 'building' },
    { label: 'Accesorios', path: '/catalog?category=accesorios', icon: 'package' },
    { label: 'Soporte', path: '/support', icon: 'headset' },
  ];
}

router.get('/', async (_req, res, next) => {
  try {
    const s = await ensureSettings();
    res.json(respondSettings(s));
  } catch (e) {
    next(e);
  }
});

router.put('/', attachPrincipal, requireStaff, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await ensureSettings();
    const body = updateSchema.parse(req.body);
    const data = { ...body, menuItems: body.menuItems ?? undefined };
    if (body.heroSlides !== undefined) {
      data.heroSlides = normalizeHeroSlides(body.heroSlides);
    }
    const s = await prisma.siteSetting.update({
      where: { id: 1 },
      data,
    });
    res.json(respondSettings(s));
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message });
    }
    next(e);
  }
});

router.post('/logo', attachPrincipal, requireStaff, requireRole('ADMIN'), (req, res, next) => {
  uploadLogo.single('logo')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Archivo requerido' });
      }
      const { publicPath } = await optimizeUploadToWebp(req.file.path);
      await ensureSettings();
      const s = await prisma.siteSetting.update({
        where: { id: 1 },
        data: { logoUrl: publicPath },
      });
      res.json({ logoUrl: s.logoUrl, settings: respondSettings(s) });
    } catch (e) {
      next(e);
    }
  });
});

router.post('/footer-logo', attachPrincipal, requireStaff, requireRole('ADMIN'), (req, res, next) => {
  uploadFooterLogo.single('logo')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Archivo requerido' });
      }
      const { publicPath } = await optimizeUploadToWebp(req.file.path);
      await ensureSettings();
      const s = await prisma.siteSetting.update({
        where: { id: 1 },
        data: { footerLogoUrl: publicPath },
      });
      res.json({ footerLogoUrl: s.footerLogoUrl, settings: respondSettings(s) });
    } catch (e) {
      next(e);
    }
  });
});

router.post('/hero-slide/:index', attachPrincipal, requireStaff, requireRole('ADMIN'), (req, res, next) => {
  const idx = Number(req.params.index);
  if (![0, 1, 2].includes(idx)) {
    return res.status(400).json({ error: 'Índice inválido (use 0, 1 o 2)' });
  }
  uploadHero.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Archivo requerido' });
      }
      const { publicPath } = await optimizeUploadToWebp(req.file.path);
      await ensureSettings();
      const current = await prisma.siteSetting.findUnique({ where: { id: 1 } });
      const slides = normalizeHeroSlides(current?.heroSlides);
      slides[idx] = publicPath;
      const s = await prisma.siteSetting.update({
        where: { id: 1 },
        data: { heroSlides: slides },
      });
      res.json({ url: publicPath, heroSlides: slides, settings: respondSettings(s) });
    } catch (e) {
      next(e);
    }
  });
});

router.delete('/hero-slide/:index', attachPrincipal, requireStaff, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const idx = Number(req.params.index);
    if (![0, 1, 2].includes(idx)) {
      return res.status(400).json({ error: 'Índice inválido (use 0, 1 o 2)' });
    }
    await ensureSettings();
    const current = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    const slides = normalizeHeroSlides(current?.heroSlides);
    slides[idx] = null;
    const s = await prisma.siteSetting.update({
      where: { id: 1 },
      data: { heroSlides: slides },
    });
    res.json(respondSettings(s));
  } catch (e) {
    next(e);
  }
});

export function uploadsStaticPath() {
  return path.resolve(process.cwd(), env.uploadDir);
}

export default router;
