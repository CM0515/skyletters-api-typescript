import { reportesRepository } from "../../repositories/reportesRepository";
import { AppError } from "../../utils/AppError";
import type { ReporteFinanciero } from "@prisma/client";

export interface CreateReporteInput {
  tipo: string;
  formato: string;
  movimientoContable: string;
  descripcion: string;
  periodoInicio: Date;
  periodoFin: Date;
}

export const reportesService = {
  async getAll(): Promise<ReporteFinanciero[]> {
    return reportesRepository.findAll();
  },

  async getById(id: number): Promise<ReporteFinanciero | null> {
    return reportesRepository.findById(id);
  },

  async create(input: CreateReporteInput): Promise<ReporteFinanciero> {
    return reportesRepository.create(input);
  },

  async update(id: number, data: Partial<CreateReporteInput>): Promise<ReporteFinanciero> {
    const r = await reportesRepository.findById(id);
    if (!r) throw AppError.notFound("Reporte no encontrado");
    return reportesRepository.update(id, data);
  },

  async delete(id: number): Promise<void> {
    const r = await reportesRepository.findById(id);
    if (!r) throw AppError.notFound("Reporte no encontrado");
    await reportesRepository.delete(id);
  },
};
