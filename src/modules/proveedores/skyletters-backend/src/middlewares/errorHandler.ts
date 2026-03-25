// src/middlewares/errorHandler.ts
// Middleware global de manejo de errores - captura todo lo que no se maneja en las rutas
// Decisión técnica: separar errores operacionales (esperados) de errores de programación (bugs)

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError } from '../utils/AppError';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('errorHandler');

interface ErrorResponse {
  exito: boolean;
  mensaje: string;
  errores?: Record<string, string[]>;
  codigo?: string;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let response: ErrorResponse = {
    exito: false,
    mensaje: 'Error interno del servidor',
  };

  // ─── Errores de la aplicación (operacionales) ─────────────────────────────
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.mensaje = err.message;

    if (err instanceof ValidationError) {
      response.errores = err.errores;
    }

    if (err.isOperational) {
      log.warn('Error operacional', {
        url: req.url,
        method: req.method,
        statusCode,
        mensaje: err.message,
      });
    } else {
      log.error('Error de aplicación crítico', {
        url: req.url,
        method: req.method,
        error: err,
      });
    }
  }

  // ─── Errores de validación de Zod ────────────────────────────────────────
  else if (err instanceof ZodError) {
    statusCode = 400;
    const errores: Record<string, string[]> = {};

    err.errors.forEach((zodErr) => {
      const campo = zodErr.path.join('.') || 'general';
      if (!errores[campo]) errores[campo] = [];
      errores[campo].push(zodErr.message);
    });

    response = {
      exito: false,
      mensaje: 'Error de validación en los datos enviados',
      errores,
    };

    log.warn('Error de validación Zod', { url: req.url, errores });
  }

  // ─── Errores de Prisma ────────────────────────────────────────────────────
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint
        statusCode = 409;
        const campo = (err.meta?.target as string[])?.join(', ') ?? 'campo';
        response.mensaje = `Ya existe un registro con ese ${campo}`;
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        response.mensaje = 'Registro no encontrado';
        break;
      case 'P2003': // Foreign key constraint
        statusCode = 400;
        response.mensaje = 'Referencia inválida: el registro relacionado no existe';
        break;
      default:
        log.error('Error de Prisma no manejado', { code: err.code, meta: err.meta });
    }
  }

  // ─── Errores desconocidos (bugs) ──────────────────────────────────────────
  else {
    log.error('Error no controlado', {
      url: req.url,
      method: req.method,
      error: err.message,
      stack: err.stack,
    });
  }

  // En desarrollo, incluimos el stack trace
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// Wrapper para controladores async - elimina try/catch repetitivo
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
