import { z } from "zod";

export const createRolSchema = z.object({
  body: z.object({
    nombre: z.string().min(1),
    listaPermisos: z.string(),
    listaRol: z.string(),
    descripcion: z.string(),
  }),
});

export const updateRolSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
  body: z.object({
    nombre: z.string().min(1).optional(),
    listaPermisos: z.string().optional(),
    listaRol: z.string().optional(),
    descripcion: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
});
