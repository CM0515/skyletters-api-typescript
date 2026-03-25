// src/utils/logger.ts
// Logger centralizado con Winston - todos los módulos lo importan desde aquí
// Decisión técnica: log estructurado en JSON para facilitar ingesta en sistemas como Datadog o ELK

import winston from 'winston';
import path from 'path';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

// Formato legible para desarrollo
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
});

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    isProduction ? json() : combine(colorize(), devFormat)
  ),
  defaultMeta: { service: 'skyletters-api' },
  transports: [
    new winston.transports.Console(),
    // En producción, logs a archivos separados por nivel
    ...(isProduction
      ? [
          new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
            maxsize: 10 * 1024 * 1024,
            maxFiles: 10,
          }),
        ]
      : []),
  ],
});

// Helper para crear child loggers con contexto de módulo
export const createModuleLogger = (modulo: string) =>
  logger.child({ modulo });
