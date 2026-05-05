import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env.js';

const uploadPath = path.resolve(process.cwd(), env.uploadDir);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `logo-${Date.now()}${ext}`);
  },
});

const footerLogoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `footer-logo-${Date.now()}${ext}`);
  },
});

const heroStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `hero-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`);
  },
});

const productStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `product-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`);
  },
});

const imageFilter = (_req, file, cb) => {
  const ok = /^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.mimetype);
  if (!ok) {
    return cb(new Error('Solo imágenes permitidas'));
  }
  cb(null, true);
};

export const uploadLogo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const uploadFooterLogo = multer({
  storage: footerLogoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const uploadHero = multer({
  storage: heroStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});
