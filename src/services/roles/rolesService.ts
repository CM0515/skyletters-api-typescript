import { rolesRepository } from "../../repositories/rolesRepository";
import { AppError } from "../../utils/AppError";
import type { RolesYPermisos } from "@prisma/client";

export interface CreateRolInput {
  nombre: string;
  listaPermisos: string;
  listaRol: string;
  descripcion: string;
}

export const rolesService = {
  async getAll(): Promise<RolesYPermisos[]> {
    return rolesRepository.findAll();
  },

  async getById(id: number): Promise<RolesYPermisos | null> {
    return rolesRepository.findById(id);
  },

  async create(input: CreateRolInput): Promise<RolesYPermisos> {
    return rolesRepository.create(input);
  },

  async update(
    id: number,
    data: Partial<CreateRolInput>
  ): Promise<RolesYPermisos> {
    const rol = await rolesRepository.findById(id);
    if (!rol) throw AppError.notFound("Rol no encontrado");
    return rolesRepository.update(id, data);
  },

  async delete(id: number): Promise<void> {
    const rol = await rolesRepository.findById(id);
    if (!rol) throw AppError.notFound("Rol no encontrado");
    await rolesRepository.delete(id);
  },
};
