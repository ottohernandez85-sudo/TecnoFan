import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

function normalizeOrigin(url) {
  if (!url || typeof url !== 'string') return null;
  return url.trim().replace(/\/+$/, '');
}

const clientUrl = normalizeOrigin(process.env.CLIENT_URL);
const clientUrlsExtra = (process.env.CLIENT_URLS || '')
  .split(',')
  .map((s) => normalizeOrigin(s))
  .filter(Boolean);

export const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  clientUrl,
  clientUrlsExtra,
};

/** Orígenes permitidos para CORS (browser). */
export function corsAllowedOrigins() {
  const set = new Set();
  if (env.clientUrl) set.add(env.clientUrl);
  for (const u of env.clientUrlsExtra) set.add(u);
  if (env.nodeEnv !== 'production') {
    set.add('http://localhost:5173');
    set.add('http://127.0.0.1:5173');
  }
  return set;
}

if (!env.databaseUrl) {
  console.warn('Warning: DATABASE_URL is not set. Copy .env.example to .env');
}

if (env.nodeEnv === 'production' && !env.clientUrl && env.clientUrlsExtra.length === 0) {
  console.warn(
    'Warning: CLIENT_URL / CLIENT_URLS not set. Browser requests from your frontend will be blocked by CORS.',
  );
}
