import { prisma } from "../config/database";
import type { ParametrizacionSistema } from "@prisma/client";

export const parametrizacionRepository = {
  async findFirst(): Promise<ParametrizacionSistema | null> {
    return prisma.parametrizacionSistema.findFirst({ orderBy: { id: "desc" } });
  },

  async findAll(): Promise<ParametrizacionSistema[]> {
    return prisma.parametrizacionSistema.findMany({ orderBy: { id: "asc" } });
  },

  async findById(id: number): Promise<ParametrizacionSistema | null> {
    return prisma.parametrizacionSistema.findUnique({ where: { id } });
  },

  async create(data: {
    nombreEmpresa: string;
    direccionEmpresa: string;
    telefonoEmpresa: string;
    anioInicialEmpresa: number;
    tipoMoneda: string;
    emailEmpresa: string;
    manejaImpuesto: boolean;
    impuestos: number;
    cuentasContables: number;
    documentoContable: string;
  }): Promise<ParametrizacionSistema> {
    return prisma.parametrizacionSistema.create({ data });
  },

  async update(
    id: number,
    data: Partial<Parameters<typeof prisma.parametrizacionSistema.update>[0]["data"]>
  ): Promise<ParametrizacionSistema> {
    return prisma.parametrizacionSistema.update({ where: { id }, data });
  },

  async delete(id: number): Promise<ParametrizacionSistema> {
    return prisma.parametrizacionSistema.delete({ where: { id } });
  },
};
