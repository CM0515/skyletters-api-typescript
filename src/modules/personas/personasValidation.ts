import { z } from "zod";

const basePersona = {
    nombrePersona: z.string().min(1),
    apellidoPersona: z.string().min(1),
    correoPersona: z.string().email(),
    direccionPersona: z.string().min(1),
    telefonoPersona: z.string().min(1),
    generoPersona: z.string().min(1),
    fechaNacimientoPersona: z.coerce.date()
}

export const createPersonaSchema = z.object({
    body: z.object({
        ...basePersona,
    })
})