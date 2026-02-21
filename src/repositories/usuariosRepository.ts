import { prisma } from "../config/database";
import type { Usuario, UsuarioAdmin, UsuarioCont, UsuarioAux } from "@prisma/client";

export type UsuarioWithRelations = Usuario & {
  admin?: UsuarioAdmin | null;
  cont?: UsuarioCont | null;
  aux?: UsuarioAux | null;
};

export const usuariosRepository = {
  async findAll(): Promise<Usuario[]> {
    return prisma.usuario.findMany({ orderBy: { id: "asc" } });
  },

  async findById(id: number): Promise<UsuarioWithRelations | null> {
    return prisma.usuario.findUnique({
      where: { id },
      include: { admin: true, cont: true, aux: true },
    }) as Promise<UsuarioWithRelations | null>;
  },

  async findByEmail(correoUsuario: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { correoUsuario } });
  },

  async create(data: {
    nombreUsuario: string;
    correoUsuario: string;
    contrasenaUsuario: string;
    rolUsuario: string;
    estadoUsuario: boolean;
    tipoUsuario: string;
  }): Promise<Usuario> {
    return prisma.usuario.create({ data });
  },

  async update(
    id: number,
    data: Partial<{
      nombreUsuario: string;
      correoUsuario: string;
      contrasenaUsuario: string;
      rolUsuario: string;
      estadoUsuario: boolean;
    }>
  ): Promise<Usuario> {
    return prisma.usuario.update({ where: { id }, data });
  },

  async delete(id: number): Promise<Usuario> {
    return prisma.usuario.delete({ where: { id } });
  },
};
