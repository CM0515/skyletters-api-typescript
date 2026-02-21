import { z } from "zod";

export const createParametrizacionSchema = z.object({
  body: z.object({
    nombreEmpresa: z.string().min(1),
    direccionEmpresa: z.string(),
    telefonoEmpresa: z.string(),
    anioInicialEmpresa: z.number(),
    tipoMoneda: z.string(),
    emailEmpresa: z.string().email(),
    manejaImpuesto: z.boolean(),
    impuestos: z.number().optional(),
    cuentasContables: z.number().optional(),
    documentoContable: z.string(),
  }),
});

export const updateParametrizacionSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
  body: z.object({
    nombreEmpresa: z.string().min(1).optional(),
    direccionEmpresa: z.string().optional(),
    telefonoEmpresa: z.string().optional(),
    anioInicialEmpresa: z.number().optional(),
    tipoMoneda: z.string().optional(),
    emailEmpresa: z.string().email().optional(),
    manejaImpuesto: z.boolean().optional(),
    impuestos: z.number().optional(),
    cuentasContables: z.number().optional(),
    documentoContable: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
});
