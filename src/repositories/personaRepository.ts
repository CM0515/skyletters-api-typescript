import { prisma } from "../config/database";
import type { Persona } from "@prisma/client";
import type { CreatePersonaBase } from "../services/personas/personasService";

export const personaRepository = {
    async create(data: CreatePersonaBase): Promise<Persona> {
        return prisma.persona.create({ data });
    }
};
