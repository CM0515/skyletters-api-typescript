import { AppError } from "../../utils/AppError";
import type { Persona } from "@prisma/client";
import { personaRepository } from "../../repositories/personaRepository";

export interface CreatePersonaBase {
    idUsuario: number;
    nombrePersona: string;
    apellidoPersona: string;
    correoPersona: string;
    direccionPersona: string;
    telefonoPersona: string;
    generoPersona: string;
    fechaNacimientoPersona: Date;
}

export const personasService = {
    async create(data: CreatePersonaBase): Promise<Persona> {
        try {
            const persona = await personaRepository.create(data);
            return persona;
        } catch (error) {
            throw new AppError("Error al crear la persona", 500);
        }
    },
};
