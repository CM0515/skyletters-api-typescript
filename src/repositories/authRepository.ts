import { prisma } from "../config/database";
import type { Usuario } from "@prisma/client";

export const authRepository = {
  async findByEmail(correoUsuario: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { correoUsuario, estadoUsuario: true },
    });
  },

  async findById(id: number): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { id, estadoUsuario: true },
    });
  },
};
