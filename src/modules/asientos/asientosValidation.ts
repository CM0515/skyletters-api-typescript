import { z } from "zod";

export const createAsientoSchema = z.object({
  body: z.object({
    fechaCreacionRegistro: z.coerce.date(),
    numeroFactura: z.number(),
    descripcion: z.string(),
    usuarioCreador: z.string(),
    fechaModificacion: z.coerce.date(),
    listaMovimiContable: z.string(),
  }),
});

export const updateAsientoSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
  body: z.object({
    fechaCreacionRegistro: z.coerce.date().optional(),
    numeroFactura: z.number().optional(),
    descripcion: z.string().optional(),
    usuarioCreador: z.string().optional(),
    fechaModificacion: z.coerce.date().optional(),
    listaMovimiContable: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
});
