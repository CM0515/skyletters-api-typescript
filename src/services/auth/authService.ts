import bcrypt from "bcryptjs";
import { authRepository } from "../../repositories/authRepository";
import { generateTokenPair, revokeRefreshToken, findRefreshToken } from "./jwtService";
import { AppError } from "../../utils/AppError";
import type { Usuario } from "@prisma/client";
import type { TokenPair } from "./jwtService";

export interface LoginInput {
  correoUsuario: string;
  contrasenaUsuario: string;
}

export interface AuthResult {
  usuario: Omit<Usuario, "contrasenaUsuario">;
  tokens: TokenPair;
}

export const authService = {
  async login(input: LoginInput): Promise<AuthResult> {
    const usuario = await authRepository.findByEmail(input.correoUsuario);
    if (!usuario) {
      throw AppError.unauthorized("Credenciales inválidas");
    }
    const valid = await bcrypt.compare(input.contrasenaUsuario, usuario.contrasenaUsuario);
    if (!valid) {
      throw AppError.unauthorized("Credenciales inválidas");
    }
    const tokens = await generateTokenPair(usuario);
    const { contrasenaUsuario: _, ...safe } = usuario;
    return { usuario: safe, tokens };
  },

  async refresh(refreshToken: string): Promise<TokenPair> {
    const record = await findRefreshToken(refreshToken);
    if (!record) {
      throw AppError.unauthorized("Refresh token no válido");
    }
    const usuario = await authRepository.findById(record.idUsuario);
    if (!usuario) {
      throw AppError.unauthorized("Usuario no encontrado");
    }
    await revokeRefreshToken(refreshToken);
    return generateTokenPair(usuario);
  },

  async logout(refreshToken: string | undefined): Promise<void> {
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
  },
};
