import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env, corsAllowedOrigins } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import authRoutes from './modules/auth/auth.routes.js';
import customerAuthRoutes from './modules/customer-auth/customer-auth.routes.js';
import customersRoutes from './modules/customers/customers.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import settingsRoutes, { uploadsStaticPath } from './modules/settings/settings.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const allowedOrigins = corsAllowedOrigins();
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }),
);
app.use(express.json());

app.use('/uploads', express.static(uploadsStaticPath()));

app.use('/api/auth', authRoutes);
app.use('/api/customer-auth', customerAuthRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);

app.listen(env.port, '0.0.0.0', () => {
  console.log(`API listening on port ${env.port}`);
});
