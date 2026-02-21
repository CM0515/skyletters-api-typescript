import { prisma } from "../config/database";
import type { AsientoContable } from "@prisma/client";

export const asientosRepository = {
  async findAll(): Promise<AsientoContable[]> {
    return prisma.asientoContable.findMany({ orderBy: { id: "desc" } });
  },

  async findById(id: number): Promise<AsientoContable | null> {
    return prisma.asientoContable.findUnique({ where: { id } });
  },

  async create(data: {
    fechaCreacionRegistro: Date;
    numeroFactura: number;
    descripcion: string;
    usuarioCreador: string;
    fechaModificacion: Date;
    listaMovimiContable: string;
  }): Promise<AsientoContable> {
    return prisma.asientoContable.create({ data });
  },

  async update(
    id: number,
    data: Partial<Parameters<typeof prisma.asientoContable.update>[0]["data"]>
  ): Promise<AsientoContable> {
    return prisma.asientoContable.update({ where: { id }, data });
  },

  async delete(id: number): Promise<AsientoContable> {
    return prisma.asientoContable.delete({ where: { id } });
  },
};
