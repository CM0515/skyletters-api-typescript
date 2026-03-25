// src/modules/impuestos/impuestos.controller.ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { TipoImpuesto } from '@prisma/client';
import { prisma } from '../../config/database';
import { autenticar, autorizar } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/errorHandler';
import { NotFoundError, ConflictError } from '../../utils/AppError';
import { createModuleLogger } from '../../utils/logger';

const log = createModuleLogger('impuestos');

const crearImpuestoSchema = z.object({
  nombre: z.string().min(2).max(100),
  codigo: z.string().min(2).max(20).toUpperCase(),
  tipo: z.nativeEnum(TipoImpuesto),
  tarifa: z.number().min(0).max(100),
  descripcion: z.string().max(500).optional(),
});

const router = Router();
router.use(autenticar);

// Listar
router.get('/', autorizar('impuestos', 'leer'), asyncHandler(async (_req, res) => {
  const impuestos = await prisma.impuesto.findMany({
    where: { activo: true },
    orderBy: { tipo: 'asc' },
  });
  res.json({ exito: true, datos: impuestos });
}));

// Obtener por ID
router.get('/:id', autorizar('impuestos', 'leer'), asyncHandler(async (req, res) => {
  const impuesto = await prisma.impuesto.findUnique({ where: { id: req.params.id } });
  if (!impuesto) throw new NotFoundError('Impuesto', req.params.id);
  res.json({ exito: true, datos: impuesto });
}));

// Crear
router.post('/', autorizar('impuestos', 'crear'), asyncHandler(async (req, res) => {
  const dto = crearImpuestoSchema.parse(req.body);

  const existente = await prisma.impuesto.findUnique({ where: { codigo: dto.codigo } });
  if (existente) throw new ConflictError(`Ya existe un impuesto con código "${dto.codigo}"`);

  const impuesto = await prisma.impuesto.create({ data: dto });
  log.info('Impuesto creado', { id: impuesto.id, codigo: impuesto.codigo });
  res.status(201).json({ exito: true, mensaje: 'Impuesto creado', datos: impuesto });
}));

// Actualizar
router.patch('/:id', autorizar('impuestos', 'actualizar'), asyncHandler(async (req, res) => {
  const dto = crearImpuestoSchema.partial().parse(req.body);
  const impuesto = await prisma.impuesto.update({
    where: { id: req.params.id },
    data: dto,
  });
  res.json({ exito: true, mensaje: 'Impuesto actualizado', datos: impuesto });
}));

// Desactivar (soft delete)
router.delete('/:id', autorizar('impuestos', 'eliminar'), asyncHandler(async (req, res) => {
  await prisma.impuesto.update({
    where: { id: req.params.id },
    data: { activo: false },
  });
  res.json({ exito: true, mensaje: 'Impuesto desactivado' });
}));

// Calcular impuesto sobre una base
router.post('/calcular', autenticar, asyncHandler(async (req: Request, res: Response) => {
  const { impuestoId, base } = z.object({
    impuestoId: z.string().cuid(),
    base: z.number().positive(),
  }).parse(req.body);

  const impuesto = await prisma.impuesto.findUnique({ where: { id: impuestoId } });
  if (!impuesto) throw new NotFoundError('Impuesto', impuestoId);

  const valor = (base * Number(impuesto.tarifa)) / 100;

  res.json({
    exito: true,
    datos: {
      impuesto: impuesto.nombre,
      tarifa: Number(impuesto.tarifa),
      base,
      valor: Math.round(valor),
      total: base + Math.round(valor),
    },
  });
}));

export { router as impuestosRouter };
