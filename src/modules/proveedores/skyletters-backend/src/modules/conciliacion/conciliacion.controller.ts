// src/modules/conciliacion/conciliacion.controller.ts
// Conciliación bancaria: confrontar saldo bancario vs saldo en libros

import { Router } from 'express';
import { z } from 'zod';
import { TipoCuentaBancaria } from '@prisma/client';
import { prisma } from '../../config/database';
import { autenticar, autorizar } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/errorHandler';
import { NotFoundError } from '../../utils/AppError';
import { createModuleLogger } from '../../utils/logger';

const log = createModuleLogger('conciliacion');
const router = Router();
router.use(autenticar);

const cuentaBancariaSchema = z.object({
  banco: z.string().min(2).max(100),
  numeroCuenta: z.string().min(5).max(30),
  tipoCuenta: z.nativeEnum(TipoCuentaBancaria),
  moneda: z.string().length(3).default('COP'),
  saldoInicial: z.number().min(0),
});

const movimientoSchema = z.object({
  cuentaBancariaId: z.string().cuid(),
  fecha: z.string().datetime(),
  descripcion: z.string().min(3).max(500),
  referencia: z.string().max(100).optional(),
  debito: z.number().min(0).default(0),
  credito: z.number().min(0).default(0),
}).refine(d => d.debito > 0 || d.credito > 0, {
  message: 'El movimiento debe tener débito o crédito',
});

// ─── CUENTAS BANCARIAS ────────────────────────────────────────────────────────

router.get('/cuentas-bancarias', autorizar('conciliacion', 'leer'), asyncHandler(async (_req, res) => {
  const cuentas = await prisma.cuentaBancaria.findMany({
    where: { activo: true },
    include: { _count: { select: { movimientos: true } } },
  });
  res.json({ exito: true, datos: cuentas });
}));

router.post('/cuentas-bancarias', autorizar('conciliacion', 'crear'), asyncHandler(async (req, res) => {
  const dto = cuentaBancariaSchema.parse(req.body);
  const cuenta = await prisma.cuentaBancaria.create({ data: dto });
  log.info('Cuenta bancaria creada', { id: cuenta.id, banco: cuenta.banco });
  res.status(201).json({ exito: true, datos: cuenta });
}));

// ─── MOVIMIENTOS BANCARIOS ────────────────────────────────────────────────────

router.get('/movimientos', autorizar('conciliacion', 'leer'), asyncHandler(async (req, res) => {
  const { cuentaBancariaId, conciliado } = req.query as {
    cuentaBancariaId?: string;
    conciliado?: string;
  };

  const movimientos = await prisma.movimientoBancario.findMany({
    where: {
      ...(cuentaBancariaId && { cuentaBancariaId }),
      ...(conciliado !== undefined && { conciliado: conciliado === 'true' }),
    },
    include: { cuentaBancaria: { select: { banco: true, numeroCuenta: true } } },
    orderBy: { fecha: 'desc' },
  });

  res.json({ exito: true, datos: movimientos });
}));

router.post('/movimientos', autorizar('conciliacion', 'crear'), asyncHandler(async (req, res) => {
  const dto = movimientoSchema.parse(req.body);

  const cuenta = await prisma.cuentaBancaria.findUnique({ where: { id: dto.cuentaBancariaId } });
  if (!cuenta) throw new NotFoundError('Cuenta bancaria', dto.cuentaBancariaId);

  const movimiento = await prisma.movimientoBancario.create({
    data: { ...dto, fecha: new Date(dto.fecha) },
  });

  res.status(201).json({ exito: true, datos: movimiento });
}));

// Carga masiva de movimientos (importar extracto bancario)
router.post('/movimientos/lote', autorizar('conciliacion', 'crear'), asyncHandler(async (req, res) => {
  const loteSchema = z.object({
    movimientos: z.array(movimientoSchema).min(1).max(500),
  });

  const { movimientos } = loteSchema.parse(req.body);

  const resultado = await prisma.movimientoBancario.createMany({
    data: movimientos.map((m) => ({ ...m, fecha: new Date(m.fecha) })),
    skipDuplicates: true,
  });

  log.info('Lote de movimientos importado', { count: resultado.count });
  res.status(201).json({
    exito: true,
    mensaje: `${resultado.count} movimientos importados`,
    datos: { importados: resultado.count },
  });
}));

// ─── PROCESO DE CONCILIACIÓN ──────────────────────────────────────────────────

router.post('/iniciar', autorizar('conciliacion', 'crear'), asyncHandler(async (req, res) => {
  const dto = z.object({
    cuentaBancariaId: z.string().cuid(),
    periodoInicio: z.string().datetime(),
    periodoFin: z.string().datetime(),
    saldoBancario: z.number(), // Saldo según extracto del banco
  }).parse(req.body);

  // Calcular saldo contable (suma de movimientos aprobados en el período)
  // En un sistema real, esto se obtiene del libro mayor de la cuenta bancaria
  const movimientosPendientes = await prisma.movimientoBancario.findMany({
    where: {
      cuentaBancariaId: dto.cuentaBancariaId,
      conciliado: false,
      fecha: { gte: new Date(dto.periodoInicio), lte: new Date(dto.periodoFin) },
    },
  });

  const totalDebito = movimientosPendientes.reduce((s, m) => s + Number(m.debito), 0);
  const totalCredito = movimientosPendientes.reduce((s, m) => s + Number(m.credito), 0);
  const saldoContable = totalCredito - totalDebito; // Créditos aumentan, débitos disminuyen

  const conciliacion = await prisma.conciliacion.create({
    data: {
      cuentaBancariaId: dto.cuentaBancariaId,
      periodoInicio: new Date(dto.periodoInicio),
      periodoFin: new Date(dto.periodoFin),
      saldoBancario: dto.saldoBancario,
      saldoContable,
      diferencia: dto.saldoBancario - saldoContable,
      estado: 'EN_PROCESO',
    },
    include: { cuentaBancaria: { select: { banco: true, numeroCuenta: true } } },
  });

  log.info('Conciliación iniciada', { id: conciliacion.id });
  res.status(201).json({ exito: true, datos: conciliacion });
}));

// Marcar movimiento como conciliado
router.patch('/movimientos/:id/conciliar', autorizar('conciliacion', 'actualizar'), asyncHandler(async (req, res) => {
  const { conciliacionId } = z.object({ conciliacionId: z.string().cuid() }).parse(req.body);

  const movimiento = await prisma.movimientoBancario.update({
    where: { id: req.params.id },
    data: { conciliado: true, conciliacionId },
  });

  res.json({ exito: true, datos: movimiento });
}));

// Obtener estado de conciliación
router.get('/:id', autorizar('conciliacion', 'leer'), asyncHandler(async (req, res) => {
  const conciliacion = await prisma.conciliacion.findUnique({
    where: { id: req.params.id },
    include: {
      cuentaBancaria: true,
      movimientos: { orderBy: { fecha: 'asc' } },
    },
  });

  if (!conciliacion) throw new NotFoundError('Conciliación', req.params.id);

  const movimientosConciliados = conciliacion.movimientos.filter((m) => m.conciliado).length;
  const totalMovimientos = conciliacion.movimientos.length;

  res.json({
    exito: true,
    datos: {
      ...conciliacion,
      progreso: {
        conciliados: movimientosConciliados,
        total: totalMovimientos,
        porcentaje: totalMovimientos > 0
          ? Math.round((movimientosConciliados / totalMovimientos) * 100)
          : 0,
      },
    },
  });
}));

export { router as conciliacionRouter };
