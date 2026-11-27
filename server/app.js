import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getDbPool } from './config/database.js';
import { getEnvConfig } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');
const PUBLIC_IMAGES_DIR = path.resolve(PUBLIC_DIR, 'images');

/**
 * Creates and configures the Express application instance.
 */
export function createApp({ db } = {}) {
  const app = express();
  const { allowedOrigins } = getEnvConfig();

  app.locals.db = db || getDbPool();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Imágenes de productos (accesibles en /images/products/<archivo>)
  app.use('/images', express.static(PUBLIC_IMAGES_DIR, { maxAge: '7d' }));

  // API REST
  app.use('/api', apiRoutes);

  // Frontend React compilado por Vite (dist/)
  if (fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR));
  }
  app.use(express.static(PUBLIC_DIR));

  // Fallback SPA para rutas no-API
  app.get('/', (_req, res, next) => {
    const builtIndex = path.join(DIST_DIR, 'index.html');
    const devIndex = path.join(ROOT_DIR, 'index.html');
    if (fs.existsSync(builtIndex)) return res.sendFile(builtIndex);
    if (fs.existsSync(devIndex)) return res.sendFile(devIndex);
    return next();
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp();
