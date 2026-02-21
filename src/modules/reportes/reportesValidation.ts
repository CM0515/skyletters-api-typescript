import { z } from "zod";

export const createReporteSchema = z.object({
  body: z.object({
    tipo: z.string(),
    formato: z.string(),
    movimientoContable: z.string(),
    descripcion: z.string(),
    periodoInicio: z.coerce.date(),
    periodoFin: z.coerce.date(),
  }),
});

export const updateReporteSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
  body: z.object({
    tipo: z.string().optional(),
    formato: z.string().optional(),
    movimientoContable: z.string().optional(),
    descripcion: z.string().optional(),
    periodoInicio: z.coerce.date().optional(),
    periodoFin: z.coerce.date().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
});
