import { conciliacionRepository } from "../../repositories/conciliacionRepository";
import { AppError } from "../../utils/AppError";
import type { ConciliacionBancaria } from "@prisma/client";

export interface CreateConciliacionInput {
  cuentaBancaria: string;
  banco: string;
  periodoInicio: Date;
  periodoFin: Date;
  movimientosConciliados?: number;
  saldoBancario: number;
  saldoContable: number;
}

export const conciliacionService = {
  async getAll(): Promise<ConciliacionBancaria[]> {
    return conciliacionRepository.findAll();
  },

  async getById(id: number): Promise<ConciliacionBancaria | null> {
    return conciliacionRepository.findById(id);
  },

  async create(input: CreateConciliacionInput): Promise<ConciliacionBancaria> {
    return conciliacionRepository.create({
      ...input,
      movimientosConciliados: input.movimientosConciliados ?? 0,
    });
  },

  async update(
    id: number,
    data: Partial<CreateConciliacionInput>
  ): Promise<ConciliacionBancaria> {
    const c = await conciliacionRepository.findById(id);
    if (!c) throw AppError.notFound("Conciliación no encontrada");
    return conciliacionRepository.update(id, data);
  },

  async delete(id: number): Promise<void> {
    const c = await conciliacionRepository.findById(id);
    if (!c) throw AppError.notFound("Conciliación no encontrada");
    await conciliacionRepository.delete(id);
  },
};
