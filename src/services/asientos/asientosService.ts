import { asientosRepository } from "../../repositories/asientosRepository";
import { AppError } from "../../utils/AppError";
import type { AsientoContable } from "@prisma/client";

export interface CreateAsientoInput {
  fechaCreacionRegistro: Date;
  numeroFactura: number;
  descripcion: string;
  usuarioCreador: string;
  fechaModificacion: Date;
  listaMovimiContable: string;
}

export const asientosService = {
  async getAll(): Promise<AsientoContable[]> {
    return asientosRepository.findAll();
  },

  async getById(id: number): Promise<AsientoContable | null> {
    return asientosRepository.findById(id);
  },

  async create(input: CreateAsientoInput): Promise<AsientoContable> {
    return asientosRepository.create(input);
  },

  async update(
    id: number,
    data: Partial<CreateAsientoInput>
  ): Promise<AsientoContable> {
    const a = await asientosRepository.findById(id);
    if (!a) throw AppError.notFound("Asiento contable no encontrado");
    return asientosRepository.update(id, data);
  },

  async delete(id: number): Promise<void> {
    const a = await asientosRepository.findById(id);
    if (!a) throw AppError.notFound("Asiento contable no encontrado");
    await asientosRepository.delete(id);
  },
};
