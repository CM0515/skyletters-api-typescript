import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { logger } from "../../utils/logger";
import type { Usuario } from "@prisma/client";

export interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
  tipo: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

const jwtSignOptions: jwt.SignOptions = { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] };
const jwtRefreshSignOptions: jwt.SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"] };

export function signAccessToken(usuario: Pick<Usuario, "id" | "correoUsuario" | "rolUsuario" | "tipoUsuario">): string {
  return jwt.sign(
    {
      sub: usuario.id,
      email: usuario.correoUsuario,
      rol: usuario.rolUsuario,
      tipo: usuario.tipoUsuario,
    },
    env.JWT_SECRET,
    jwtSignOptions
  );
}

export function signRefreshToken(usuarioId: number): string {
  return jwt.sign(
    { sub: usuarioId },
    env.JWT_REFRESH_SECRET,
    jwtRefreshSignOptions
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload;
    return decoded;
  } catch {
    throw AppError.unauthorized("Token inválido o expirado");
  }
}

export function verifyRefreshToken(token: string): { sub: number } {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as unknown as { sub: number };
    return decoded;
  } catch {
    throw AppError.unauthorized("Refresh token inválido o expirado");
  }
}

export async function createRefreshTokenRecord(usuarioId: number, token: string): Promise<void> {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token, idUsuario: usuarioId, expiresAt },
  });
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function findRefreshToken(token: string): Promise<{ idUsuario: number } | null> {
  const record = await prisma.refreshToken.findUnique({
    where: { token },
    select: { idUsuario: true },
  });
  if (!record) return null;
  return record;
}

export async function generateTokenPair(usuario: Usuario): Promise<TokenPair> {
  const accessToken = signAccessToken(usuario);
  const refreshToken = signRefreshToken(usuario.id);
  await createRefreshTokenRecord(usuario.id, refreshToken);
  const decoded = jwt.decode(accessToken) as { exp?: number } | null;
  const expiresIn = decoded?.exp ? `${decoded.exp - Math.floor(Date.now() / 1000)}s` : env.JWT_EXPIRES_IN;
  logger.debug(`Tokens generados para usuario ${usuario.id}`);
  return { accessToken, refreshToken, expiresIn };
}
