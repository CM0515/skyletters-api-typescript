import { z } from "zod";

export const createImpuestoSchema = z.object({
  body: z.object({
    nombre: z.string(),
    tipo: z.string(),
    porcentaje: z.number(),
    fechaInicio: z.coerce.date(),
    fechaFin: z.coerce.date(),
    baseImponible: z.number(),
  }),
});

export const updateImpuestoSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
  body: z.object({
    nombre: z.string().optional(),
    tipo: z.string().optional(),
    porcentaje: z.number().optional(),
    fechaInicio: z.coerce.date().optional(),
    fechaFin: z.coerce.date().optional(),
    baseImponible: z.number().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
});
