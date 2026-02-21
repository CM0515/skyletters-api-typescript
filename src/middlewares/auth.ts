import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type JwtPayload } from "../services/auth/jwtService";
import { AppError } from "../utils/AppError";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next(AppError.unauthorized("Token de acceso no proporcionado"));
    return;
  }
  const token = authHeader.slice(7);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }
  const token = authHeader.slice(7);
  try {
    req.user = verifyAccessToken(token);
  } catch {
    // Ignorar token inválido en rutas opcionales
  }
  next();
}
