import { z } from "zod";

export const createConciliacionSchema = z.object({
  body: z.object({
    cuentaBancaria: z.string(),
    banco: z.string(),
    periodoInicio: z.coerce.date(),
    periodoFin: z.coerce.date(),
    movimientosConciliados: z.number().optional(),
    saldoBancario: z.number(),
    saldoContable: z.number(),
  }),
});

export const updateConciliacionSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
  body: z.object({
    cuentaBancaria: z.string().optional(),
    banco: z.string().optional(),
    periodoInicio: z.coerce.date().optional(),
    periodoFin: z.coerce.date().optional(),
    movimientosConciliados: z.number().optional(),
    saldoBancario: z.number().optional(),
    saldoContable: z.number().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
});
