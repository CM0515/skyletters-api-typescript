import { prisma } from "../config/database";
import type { RolesYPermisos } from "@prisma/client";

export const rolesRepository = {
  async findAll(): Promise<RolesYPermisos[]> {
    return prisma.rolesYPermisos.findMany({ orderBy: { id: "asc" } });
  },

  async findById(id: number): Promise<RolesYPermisos | null> {
    return prisma.rolesYPermisos.findUnique({ where: { id } });
  },

  async create(data: {
    nombre: string;
    listaPermisos: string;
    listaRol: string;
    descripcion: string;
  }): Promise<RolesYPermisos> {
    return prisma.rolesYPermisos.create({ data });
  },

  async update(
    id: number,
    data: Partial<{ nombre: string; listaPermisos: string; listaRol: string; descripcion: string }>
  ): Promise<RolesYPermisos> {
    return prisma.rolesYPermisos.update({ where: { id }, data });
  },

  async delete(id: number): Promise<RolesYPermisos> {
    return prisma.rolesYPermisos.delete({ where: { id } });
  },
};
