// src/modules/parametrizacion/parametrizacion.controller.ts
// Gestión del Plan de Cuentas, Períodos y Parámetros del sistema

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { TipoCuenta, NaturalezaCuenta, EstadoPeriodo } from '@prisma/client';
import { prisma } from '../../config/database';
import { autenticar, autorizar } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/errorHandler';
import { NotFoundError, ConflictError, AppError } from '../../utils/AppError';
import { createModuleLogger } from '../../utils/logger';

const log = createModuleLogger('parametrizacion');
const router = Router();
router.use(autenticar);

// ─── PLAN DE CUENTAS ─────────────────────────────────────────────────────────

const cuentaSchema = z.object({
  codigo: z.string().min(2).max(20),
  nombre: z.string().min(3).max(200),
  descripcion: z.string().max(500).optional(),
  tipo: z.nativeEnum(TipoCuenta),
  naturaleza: z.nativeEnum(NaturalezaCuenta),
  nivel: z.number().int().min(1).max(6).default(1),
  cuentaPadreId: z.string().cuid().optional(),
  acepta_movimientos: z.boolean().default(true),
});

// Listar plan de cuentas con jerarquía
router.get('/cuentas', autorizar('parametrizacion', 'leer'), asyncHandler(async (req, res) => {
  const { tipo, solo_hoja } = req.query as { tipo?: TipoCuenta; solo_hoja?: string };

  const cuentas = await prisma.cuentaContable.findMany({
    where: {
      activo: true,
      ...(tipo && { tipo }),
      ...(solo_hoja === 'true' && { acepta_movimientos: true }),
    },
    include: {
      cuentaPadre: { select: { codigo: true, nombre: true } },
      _count: { select: { subcuentas: true } },
    },
    orderBy: { codigo: 'asc' },
  });

  res.json({ exito: true, datos: cuentas });
}));

// Obtener cuenta por ID
router.get('/cuentas/:id', autorizar('parametrizacion', 'leer'), asyncHandler(async (req, res) => {
  const cuenta = await prisma.cuentaContable.findUnique({
    where: { id: req.params.id },
    include: {
      subcuentas: { where: { activo: true } },
      cuentaPadre: true,
    },
  });
  if (!cuenta) throw new NotFoundError('Cuenta contable', req.params.id);
  res.json({ exito: true, datos: cuenta });
}));

// Crear cuenta
router.post('/cuentas', autorizar('parametrizacion', 'crear'), asyncHandler(async (req, res) => {
  const dto = cuentaSchema.parse(req.body);

  const existente = await prisma.cuentaContable.findUnique({ where: { codigo: dto.codigo } });
  if (existente) throw new ConflictError(`Ya existe una cuenta con código "${dto.codigo}"`);

  if (dto.cuentaPadreId) {
    const padre = await prisma.cuentaContable.findUnique({ where: { id: dto.cuentaPadreId } });
    if (!padre) throw new NotFoundError('Cuenta padre', dto.cuentaPadreId);
    // Validar que el tipo coincide con el padre
    if (padre.tipo !== dto.tipo) {
      throw new AppError(
        `El tipo de cuenta (${dto.tipo}) no coincide con el de la cuenta padre (${padre.tipo})`,
        400
      );
    }
  }

  const cuenta = await prisma.cuentaContable.create({ data: dto });
  log.info('Cuenta contable creada', { codigo: cuenta.codigo, tipo: cuenta.tipo });
  res.status(201).json({ exito: true, mensaje: 'Cuenta creada', datos: cuenta });
}));

// Actualizar cuenta
router.patch('/cuentas/:id', autorizar('parametrizacion', 'actualizar'), asyncHandler(async (req, res) => {
  const dto = cuentaSchema.partial().parse(req.body);

  // No permitir cambiar tipo si tiene movimientos
  if (dto.tipo) {
    const movimientos = await prisma.lineaAsiento.count({ where: { cuentaId: req.params.id } });
    if (movimientos > 0) {
      throw new AppError('No se puede cambiar el tipo de una cuenta con movimientos', 400);
    }
  }

  const cuenta = await prisma.cuentaContable.update({
    where: { id: req.params.id },
    data: dto,
  });
  res.json({ exito: true, datos: cuenta });
}));

// ─── PERÍODOS CONTABLES ───────────────────────────────────────────────────────

const periodoSchema = z.object({
  año: z.number().int().min(2000).max(2100),
  mes: z.number().int().min(1).max(12),
  nombre: z.string().max(100).optional(),
});

router.get('/periodos', autorizar('parametrizacion', 'leer'), asyncHandler(async (_req, res) => {
  const periodos = await prisma.periodoContable.findMany({
    orderBy: [{ año: 'desc' }, { mes: 'desc' }],
    include: { _count: { select: { asientos: true } } },
  });
  res.json({ exito: true, datos: periodos });
}));

router.post('/periodos', autorizar('parametrizacion', 'crear'), asyncHandler(async (req, res) => {
  const dto = periodoSchema.parse(req.body);

  const existente = await prisma.periodoContable.findUnique({
    where: { año_mes: { año: dto.año, mes: dto.mes } },
  });
  if (existente) throw new ConflictError(`Ya existe el período ${dto.mes}/${dto.año}`);

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const periodo = await prisma.periodoContable.create({
    data: {
      año: dto.año,
      mes: dto.mes,
      nombre: dto.nombre ?? `${MESES[dto.mes - 1]} ${dto.año}`,
    },
  });

  log.info('Período creado', { periodo: periodo.nombre });
  res.status(201).json({ exito: true, datos: periodo });
}));

router.patch('/periodos/:id/estado', autorizar('parametrizacion', 'actualizar'), asyncHandler(async (req, res) => {
  const { estado } = z.object({
    estado: z.nativeEnum(EstadoPeriodo),
  }).parse(req.body);

  const periodo = await prisma.periodoContable.update({
    where: { id: req.params.id },
    data: { estado },
  });

  log.info('Estado de período actualizado', { id: req.params.id, estado });
  res.json({ exito: true, mensaje: `Período ${periodo.nombre} → ${estado}`, datos: periodo });
}));

// ─── PARÁMETROS DEL SISTEMA ───────────────────────────────────────────────────

router.get('/parametros', autorizar('parametrizacion', 'leer'), asyncHandler(async (_req, res) => {
  const parametros = await prisma.parametro.findMany({ orderBy: { clave: 'asc' } });
  res.json({ exito: true, datos: parametros });
}));

router.put('/parametros/:clave', autorizar('parametrizacion', 'actualizar'), asyncHandler(async (req, res) => {
  const { valor, descripcion } = z.object({
    valor: z.string(),
    descripcion: z.string().optional(),
  }).parse(req.body);

  const parametro = await prisma.parametro.upsert({
    where: { clave: req.params.clave },
    update: { valor, ...(descripcion && { descripcion }) },
    create: { clave: req.params.clave, valor, descripcion },
  });

  res.json({ exito: true, datos: parametro });
}));

export { router as parametrizacionRouter };
