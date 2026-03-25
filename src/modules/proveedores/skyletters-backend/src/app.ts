// src/app.ts
// Configuración central de Express con todos los middlewares y rutas
// Decisión técnica: separar app.ts de server.ts permite testear sin levantar el servidor

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { createModuleLogger } from './utils/logger';

// Módulos
import { authRouter } from './modules/auth/auth.controller';
import { usuariosRouter } from './modules/usuarios/usuarios.controller';
import { asientosRouter } from './modules/asientos/asientos.controller';
import { reportesRouter } from './modules/reportes/reportes.controller';
import { impuestosRouter } from './modules/impuestos/impuestos.controller';
import { parametrizacionRouter } from './modules/parametrizacion/parametrizacion.controller';
import { conciliacionRouter } from './modules/conciliacion/conciliacion.controller';

const log = createModuleLogger('app');

export const createApp = (): Application => {
  const app = express();

  // ─── Seguridad ───────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    credentials: true,
  }));

  // Rate limiting global
  app.use(rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      exito: false,
      mensaje: 'Demasiadas solicitudes. Intente nuevamente en unos minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // Rate limiting más estricto para autenticación
  app.use(`${env.API_PREFIX}/auth`, rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { exito: false, mensaje: 'Demasiados intentos de autenticación.' },
  }));

  // ─── Parsers ─────────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());

  // ─── Request logging ─────────────────────────────────────────────────────────
  app.use((req, _res, next) => {
    log.debug('Petición recibida', {
      method: req.method,
      url: req.url,
      ip: req.ip,
    });
    next();
  });

  // ─── Health check ─────────────────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      estado: 'ok',
      sistema: 'SKYLETTERS',
      empresa: env.EMPRESA_NOMBRE,
      version: process.env.npm_package_version ?? '1.0.0',
      entorno: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // ─── Rutas API ────────────────────────────────────────────────────────────────
  const api = env.API_PREFIX;

  app.use(`${api}/auth`, authRouter);
  app.use(`${api}/usuarios`, usuariosRouter);
  app.use(`${api}/asientos`, asientosRouter);
  app.use(`${api}/reportes`, reportesRouter);
  app.use(`${api}/impuestos`, impuestosRouter);
  app.use(`${api}/parametrizacion`, parametrizacionRouter);
  app.use(`${api}/conciliacion`, conciliacionRouter);

  // ─── 404 handler ──────────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      exito: false,
      mensaje: 'Ruta no encontrada',
    });
  });

  // ─── Error handler global (SIEMPRE al final) ──────────────────────────────────
  app.use(errorHandler);

  return app;
};
