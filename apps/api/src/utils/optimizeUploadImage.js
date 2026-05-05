import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Convierte una imagen subida a WebP (más liviano). SVG se deja igual.
 * @param {string} absPath Ruta absoluta del archivo que dejó multer
 * @returns {Promise<{ publicPath: string }>} Ruta pública `/uploads/...`
 */
export async function optimizeUploadToWebp(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  const base = path.basename(absPath);
  const dir = path.dirname(absPath);
  const stem = path.parse(absPath).name;

  if (ext === '.svg' || base.toLowerCase().endsWith('.svg')) {
    return { publicPath: `/uploads/${base}` };
  }

  const finalName = `${stem}.webp`;
  const finalPath = path.join(dir, finalName);
  const tmpPath = path.join(dir, `.${stem}-${Date.now()}.webp.tmp`);

  try {
    await sharp(absPath).rotate().webp({ quality: 82, effort: 4 }).toFile(tmpPath);
    try {
      fs.unlinkSync(absPath);
    } catch {
      /* ignore */
    }
    if (fs.existsSync(finalPath)) {
      try {
        fs.unlinkSync(finalPath);
      } catch {
        /* ignore */
      }
    }
    fs.renameSync(tmpPath, finalPath);
    return { publicPath: `/uploads/${finalName}` };
  } catch (err) {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {
      /* ignore */
    }
    console.warn('optimizeUploadToWebp: se mantiene original', err?.message);
    return { publicPath: `/uploads/${base}` };
  }
}
