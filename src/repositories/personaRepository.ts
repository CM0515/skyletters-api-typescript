import { prisma } from "../config/database";
import type { Persona } from "@prisma/client";
import type { CreatePersonaBase } from "../services/personas/personasService";

export const personaRepository = {
    async create(data: CreatePersonaBase): Promise<Persona> {
        const { idUsuario, ...rest } = data;
        const payload = {
            ...rest,
            fechaNacimientoPersona: rest.fechaNacimientoPersona.toISOString(),
            usuario: { connect: { id: idUsuario } },
        };

        return prisma.persona.create({
            data: payload,
        });
    }
};
