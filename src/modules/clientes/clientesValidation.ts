import { z } from "zod";

const baseCliente = {
    nombreCliente: z.string().min(1, "El nombre del cliente es requerido"),
    razonSocial: z.string().min(1, "La razón social es requerida"),
    nitCliente: z.string().min(1, "El NIT del cliente es requerido"),
    correoCliente: z.string().email("El correo electrónico no es válido"),
    telefonoCliente: z.string().min(1, "El teléfono del cliente es requerido"),
    direccionCliente: z.string().min(1, "La dirección del cliente es requerida"),
    ciudadCliente: z.string().min(1, "La ciudad del cliente es requerida")
}

export const createClienteSchema = z.object({
    body: z.object(baseCliente)
});