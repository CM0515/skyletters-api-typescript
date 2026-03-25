// src/modules/asientos/asientos.schemas.ts
import { z } from 'zod';
import { TipoAsiento } from '@prisma/client';

const lineaAsientoSchema = z.object({
  cuentaId: z.string().cuid('ID de cuenta inválido'),
  descripcion: z.string().max(255).optional(),
  debito: z.number().min(0).default(0),
  credito: z.number().min(0).default(0),
  baseImpuesto: z.number().min(0).optional(),
  impuestoId: z.string().cuid().optional(),
}).refine(
  (linea) => !(linea.debito > 0 && linea.credito > 0),
  { message: 'Una línea no puede tener débito Y crédito simultáneamente' }
).refine(
  (linea) => linea.debito > 0 || linea.credito > 0,
  { message: 'La línea debe tener débito o crédito mayor a cero' }
);

export const crearAsientoSchema = z.object({
  fecha: z.string().datetime({ message: 'Fecha inválida, use formato ISO 8601' }),
  descripcion: z.string().min(5, 'Descripción muy corta').max(500),
  tipo: z.nativeEnum(TipoAsiento),
  periodoId: z.string().cuid('ID de período inválido'),
  terceroId: z.string().cuid().optional(),
  referencia: z.string().max(100).optional(),
  notas: z.string().max(1000).optional(),
  lineas: z
    .array(lineaAsientoSchema)
    .min(2, 'Un asiento debe tener al menos 2 líneas'),
});

export const aprobarAsientoSchema = z.object({
  notas: z.string().max(500).optional(),
});

export const filtrosAsientoSchema = z.object({
  tipo: z.nativeEnum(TipoAsiento).optional(),
  estado: z.enum(['BORRADOR', 'APROBADO', 'ANULADO']).optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  terceroId: z.string().cuid().optional(),
  periodoId: z.string().cuid().optional(),
  pagina: z.string().transform(Number).default('1'),
  porPagina: z.string().transform(Number).default('20'),
});

export type CrearAsientoDto = z.infer<typeof crearAsientoSchema>;
export type FiltrosAsientoDto = z.infer<typeof filtrosAsientoSchema>;
