// src/modules/usuarios/usuarios.repository.ts
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

const usuarioSelect = {
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  activo: true,
  creadoEn: true,
  actualizadoEn: true,
  rol: { select: { id: true, nombre: true, descripcion: true } },
} satisfies Prisma.UsuarioSelect;

export type UsuarioPublico = Prisma.UsuarioGetPayload<{ select: typeof usuarioSelect }>;

export class UsuariosRepository {
  async crear(data: Prisma.UsuarioUncheckedCreateInput): Promise<UsuarioPublico> {
    return prisma.usuario.create({ data, select: usuarioSelect });
  }

  async findById(id: string): Promise<UsuarioPublico | null> {
    return prisma.usuario.findUnique({ where: { id }, select: usuarioSelect });
  }

  async findByEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  }

  async findAll(): Promise<UsuarioPublico[]> {
    return prisma.usuario.findMany({
      select: usuarioSelect,
      orderBy: { creadoEn: 'desc' },
    });
  }

  async actualizar(id: string, data: Prisma.UsuarioUpdateInput): Promise<UsuarioPublico> {
    return prisma.usuario.update({ where: { id }, data, select: usuarioSelect });
  }

  async actualizarPassword(id: string, passwordHash: string): Promise<void> {
    await prisma.usuario.update({ where: { id }, data: { passwordHash } });
  }
}
