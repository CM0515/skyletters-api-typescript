import { parametrizacionRepository } from "../../repositories/parametrizacionRepository";
import { AppError } from "../../utils/AppError";
import type { ParametrizacionSistema } from "@prisma/client";

export interface CreateParametrizacionInput {
  nombreEmpresa: string;
  direccionEmpresa: string;
  telefonoEmpresa: string;
  anioInicialEmpresa: number;
  tipoMoneda: string;
  emailEmpresa: string;
  manejaImpuesto: boolean;
  impuestos?: number;
  cuentasContables?: number;
  documentoContable: string;
}

export const parametrizacionService = {
  async getAll(): Promise<ParametrizacionSistema[]> {
    return parametrizacionRepository.findAll();
  },

  async getCurrent(): Promise<ParametrizacionSistema | null> {
    return parametrizacionRepository.findFirst();
  },

  async getById(id: number): Promise<ParametrizacionSistema | null> {
    return parametrizacionRepository.findById(id);
  },

  async create(input: CreateParametrizacionInput): Promise<ParametrizacionSistema> {
    return parametrizacionRepository.create({
      ...input,
      impuestos: input.impuestos ?? 0,
      cuentasContables: input.cuentasContables ?? 0,
    });
  },

  async update(
    id: number,
    data: Partial<CreateParametrizacionInput>
  ): Promise<ParametrizacionSistema> {
    const p = await parametrizacionRepository.findById(id);
    if (!p) throw AppError.notFound("Parametrización no encontrada");
    return parametrizacionRepository.update(id, data);
  },

  async delete(id: number): Promise<void> {
    const p = await parametrizacionRepository.findById(id);
    if (!p) throw AppError.notFound("Parametrización no encontrada");
    await parametrizacionRepository.delete(id);
  },
};
