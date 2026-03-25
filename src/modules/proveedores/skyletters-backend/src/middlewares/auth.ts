// src/middlewares/auth.ts
// Middleware de autenticación JWT y autorización por permisos (RBAC)
// Decisión técnica: verificar permisos en middleware evita duplicar lógica en cada controlador

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('auth-middleware');

// Extendemos el tipo Request de Express para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado;
    }
  }
}

export interface UsuarioAutenticado {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rolId: string;
  rolNombre: string;
  permisos: Array<{ modulo: string; accion: string }>;
}

interface JwtPayload {
  sub: string;  // userId
  email: string;
  rolId: string;
  iat: number;
  exp: number;
}

// ─── Middleware principal de autenticación ────────────────────────────────────

export const autenticar = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token de autorización requerido');
    }

    const token = authHeader.split(' ')[1];

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expirado. Por favor inicie sesión nuevamente');
      }
      throw new UnauthorizedError('Token inválido');
    }

    // Cargar usuario con sus permisos (se cachea a nivel de request)
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.sub, activo: true },
      include: {
        rol: {
          include: {
            permisos: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new UnauthorizedError('Usuario no encontrado o inactivo');
    }

    req.usuario = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rolId: usuario.rolId,
      rolNombre: usuario.rol.nombre,
      permisos: usuario.rol.permisos.map((p) => ({
        modulo: p.modulo,
        accion: p.accion,
      })),
    };

    log.debug('Usuario autenticado', { userId: usuario.id, email: usuario.email });
    next();
  } catch (error) {
    next(error);
  }
};

// ─── Factory de middleware de autorización ────────────────────────────────────
// Uso: router.get('/ruta', autenticar, autorizar('asientos', 'leer'), handler)

export const autorizar = (modulo: string, accion: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const usuario = req.usuario;

    if (!usuario) {
      return next(new UnauthorizedError());
    }

    const tienePermiso = usuario.permisos.some(
      (p) => p.modulo === modulo && (p.accion === accion || p.accion === 'admin')
    );

    if (!tienePermiso) {
      log.warn('Acceso denegado', {
        userId: usuario.id,
        modulo,
        accion,
        rolNombre: usuario.rolNombre,
      });
      return next(
        new ForbiddenError(
          `No tiene permiso para "${accion}" en el módulo "${modulo}"`
        )
      );
    }

    next();
  };
};
