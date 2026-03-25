// src/modules/auth/auth.repository.ts
import { prisma } from '../../config/database';

export class AuthRepository {
  async findUsuarioByEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email, activo: true },
      include: {
        rol: {
          include: { permisos: true },
        },
      },
    });
  }

  async saveRefreshToken(usuarioId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { token, usuarioId, expiresAt },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: {
        usuario: {
          include: {
            rol: { include: { permisos: true } },
          },
        },
      },
    });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({ where: { token } });
  }

  async deleteAllUserRefreshTokens(usuarioId: string) {
    return prisma.refreshToken.deleteMany({ where: { usuarioId } });
  }

  async deleteExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
