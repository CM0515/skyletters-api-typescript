import { prisma } from "../config/database";
import type { ConciliacionBancaria } from "@prisma/client";

export const conciliacionRepository = {
  async findAll(): Promise<ConciliacionBancaria[]> {
    return prisma.conciliacionBancaria.findMany({ orderBy: { id: "desc" } });
  },

  async findById(id: number): Promise<ConciliacionBancaria | null> {
    return prisma.conciliacionBancaria.findUnique({ where: { id } });
  },

  async create(data: {
    cuentaBancaria: string;
    banco: string;
    periodoInicio: Date;
    periodoFin: Date;
    movimientosConciliados?: number;
    saldoBancario: number;
    saldoContable: number;
  }): Promise<ConciliacionBancaria> {
    return prisma.conciliacionBancaria.create({ data });
  },

  async update(
    id: number,
    data: Partial<Parameters<typeof prisma.conciliacionBancaria.update>[0]["data"]>
  ): Promise<ConciliacionBancaria> {
    return prisma.conciliacionBancaria.update({ where: { id }, data });
  },

  async delete(id: number): Promise<ConciliacionBancaria> {
    return prisma.conciliacionBancaria.delete({ where: { id } });
  },
};
