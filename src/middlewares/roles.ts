import { Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import type { AuthRequest } from "./auth";

/**
 * Middleware que restringe el acceso según el rol del usuario.
 * Consulta RolesYPermisos para validar que el rol tenga el permiso indicado.
 * @param permisoRequerido - Nombre del permiso (debe estar en listaPermisos del rol)
 */
export function requireRole(permisoRequerido: string) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      next(AppError.unauthorized("Autenticación requerida"));
      return;
    }
    const rolNombre = req.user.rol;
    const rol = await prisma.rolesYPermisos.findFirst({
      where: {
        OR: [
          { nombre: rolNombre },
          { listaRol: { contains: rolNombre } },
        ],
      },
    });
    if (!rol) {
      next(AppError.forbidden(`Rol '${rolNombre}' no configurado en el sistema para este usuario`));
      return;
    }
    const permisos = rol.listaPermisos.split(",").map((p) => p.trim().toLowerCase());
    const permiso = permisoRequerido.trim().toLowerCase();
    if (!permisos.includes(permiso)) {
      next(AppError.forbidden(`No tiene permiso para: ${permisoRequerido}`));
      return;
    }
    next();
  };
}

/**
 * Restringe por tipo de usuario: admin | cont | aux
 */
export function requireTipoUsuario(...tiposPermitidos: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized("Autenticación requerida"));
      return;
    }
    const tipo = req.user.tipo?.toLowerCase();
    const permitidos = tiposPermitidos.map((t) => t.toLowerCase());
    if (!tipo || !permitidos.includes(tipo)) {
      next(AppError.forbidden("Tipo de usuario no autorizado para esta acción"));
      return;
    }
    next();
  };
}
