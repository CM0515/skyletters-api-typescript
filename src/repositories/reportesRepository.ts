import { prisma } from "../config/database";
import type { ReporteFinanciero } from "@prisma/client";

export const reportesRepository = {
  async findAll(): Promise<ReporteFinanciero[]> {
    return prisma.reporteFinanciero.findMany({ orderBy: { id: "desc" } });
  },

  async findById(id: number): Promise<ReporteFinanciero | null> {
    return prisma.reporteFinanciero.findUnique({ where: { id } });
  },

  async create(data: {
    tipo: string;
    formato: string;
    movimientoContable: string;
    descripcion: string;
    periodoInicio: Date;
    periodoFin: Date;
  }): Promise<ReporteFinanciero> {
    return prisma.reporteFinanciero.create({ data });
  },

  async update(
    id: number,
    data: Partial<Parameters<typeof prisma.reporteFinanciero.update>[0]["data"]>
  ): Promise<ReporteFinanciero> {
    return prisma.reporteFinanciero.update({ where: { id }, data });
  },

  async delete(id: number): Promise<ReporteFinanciero> {
    return prisma.reporteFinanciero.delete({ where: { id } });
  },
};
