import { z } from "zod";

const baseUsuario = {
  nombreUsuario: z.string().min(1),
  correoUsuario: z.string().email(),
  contrasenaUsuario: z.string().min(6),
  rolUsuario: z.string().min(1),
  estadoUsuario: z.boolean().optional(),
};

export const createUsuarioSchema = z.object({
  body: z.discriminatedUnion("tipoUsuario", [
    z.object({
      ...baseUsuario,
      tipoUsuario: z.literal("admin"),
      nivelConfidencialidad: z.string(),
      permisosAdmin: z.string(),
    }),
    z.object({
      ...baseUsuario,
      tipoUsuario: z.literal("cont"),
      areaContable: z.string(),
      fechaIngreso: z.coerce.date(),
      estadoUsuarioCont: z.boolean().optional(),
    }),
    z.object({
      ...baseUsuario,
      tipoUsuario: z.literal("aux"),
      areaContable: z.string(),
      fechaIngreso: z.coerce.date(),
      tarjetaUsuarioAux: z.number(),
      estadoUsuarioAux: z.boolean().optional(),
    }),
  ]),
});

export const updateUsuarioSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
  body: z.object({
    nombreUsuario: z.string().min(1).optional(),
    correoUsuario: z.string().email().optional(),
    contrasenaUsuario: z.string().min(6).optional(),
    rolUsuario: z.string().optional(),
    estadoUsuario: z.boolean().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
});
