// src/modules/auth/auth.service.ts
// Lógica de negocio de autenticación
// Decisión técnica: tokens de corta duración (15min) + refresh tokens rotativos para seguridad óptima

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './auth.schemas';
import { UnauthorizedError } from '../../utils/AppError';
import { createModuleLogger } from '../../utils/logger';

const log = createModuleLogger('auth-service');

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface UsuarioResponse {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

export class AuthService {
  constructor(private readonly authRepo: AuthRepository) {}

  async login(dto: LoginDto): Promise<{ tokens: TokenPair; usuario: UsuarioResponse }> {
    // 1. Buscar usuario
    const usuario = await this.authRepo.findUsuarioByEmail(dto.email);
    if (!usuario) {
      // Mismo mensaje para no revelar si el email existe (seguridad)
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    const passwordValida = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValida) {
      log.warn('Intento de login fallido', { email: dto.email });
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // 3. Generar tokens
    const tokens = await this.generarTokens(usuario.id, usuario.email, usuario.rolId);

    log.info('Login exitoso', { userId: usuario.id, email: usuario.email });

    return {
      tokens,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol.nombre,
      },
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    // Verificar JWT del refresh token
    let payload: { sub: string; email: string; rolId: string };
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as typeof payload;
    } catch {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }

    // Verificar que existe en BD (rotación de tokens)
    const tokenEnBD = await this.authRepo.findRefreshToken(refreshToken);
    if (!tokenEnBD || !tokenEnBD.usuario.activo) {
      throw new UnauthorizedError('Refresh token revocado');
    }

    // Rotación: eliminar el anterior y generar uno nuevo
    await this.authRepo.deleteRefreshToken(refreshToken);
    const nuevosTokens = await this.generarTokens(payload.sub, payload.email, payload.rolId);

    log.info('Tokens renovados', { userId: payload.sub });
    return nuevosTokens;
  }

  async logout(refreshToken: string, usuarioId: string): Promise<void> {
    await this.authRepo.deleteRefreshToken(refreshToken);
    log.info('Logout exitoso', { userId: usuarioId });
  }

  async logoutAll(usuarioId: string): Promise<void> {
    await this.authRepo.deleteAllUserRefreshTokens(usuarioId);
    log.info('Logout de todos los dispositivos', { userId: usuarioId });
  }

  private async generarTokens(
    usuarioId: string,
    email: string,
    rolId: string
  ): Promise<TokenPair> {
    const accessToken = jwt.sign(
      { sub: usuarioId, email, rolId },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
      { sub: usuarioId, email, rolId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    // Guardar refresh token en BD
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    await this.authRepo.saveRefreshToken(usuarioId, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_EXPIRES_IN,
    };
  }
}
