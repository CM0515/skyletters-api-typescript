import { prisma } from "../config/database";
import type { Impuesto } from "@prisma/client";

export const impuestosRepository = {
  async findAll(): Promise<Impuesto[]> {
    return prisma.impuesto.findMany({ orderBy: { id: "asc" } });
  },

  async findById(id: number): Promise<Impuesto | null> {
    return prisma.impuesto.findUnique({ where: { id } });
  },

  async create(data: {
    nombre: string;
    tipo: string;
    porcentaje: number;
    fechaInicio: Date;
    fechaFin: Date;
    baseImponible: number;
  }): Promise<Impuesto> {
    return prisma.impuesto.create({ data });
  },

  async update(
    id: number,
    data: Partial<Parameters<typeof prisma.impuesto.update>[0]["data"]>
  ): Promise<Impuesto> {
    return prisma.impuesto.update({ where: { id }, data });
  },

  async delete(id: number): Promise<Impuesto> {
    return prisma.impuesto.delete({ where: { id } });
  },
};
