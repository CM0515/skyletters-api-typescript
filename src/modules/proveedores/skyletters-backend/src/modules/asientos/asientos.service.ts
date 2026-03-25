// src/modules/asientos/asientos.service.ts
// NÚCLEO CONTABLE: implementa la partida doble y validaciones contables fundamentales
// Principio: todo asiento debe estar balanceado (Débitos = Créditos)

import { prisma } from '../../config/database';
import { AsientosRepository } from './asientos.repository';
import { CrearAsientoDto, FiltrosAsientoDto } from './asientos.schemas';
import {
  NotFoundError,
  AsientoDesbalanceadoError,
  PeriodoCerradoError,
  CuentaNoPertmiteMovimientosError,
  AppError,
} from '../../utils/AppError';
import { createModuleLogger } from '../../utils/logger';

const log = createModuleLogger('asientos-service');

// Precisión para comparación de decimales en contabilidad
const EPSILON = 0.001;

export class AsientosService {
  constructor(private readonly asientosRepo: AsientosRepository) {}

  async crearAsiento(dto: CrearAsientoDto, usuarioId: string) {
    // ── 1. Validar período abierto ───────────────────────────────────────────
    const periodo = await prisma.periodoContable.findUnique({
      where: { id: dto.periodoId },
    });

    if (!periodo) throw new NotFoundError('Período contable', dto.periodoId);

    if (periodo.estado !== 'ABIERTO') {
      throw new PeriodoCerradoError(periodo.nombre);
    }

    // ── 2. Validar cuentas contables ─────────────────────────────────────────
    const cuentaIds = dto.lineas.map((l) => l.cuentaId);
    const cuentas = await prisma.cuentaContable.findMany({
      where: { id: { in: cuentaIds }, activo: true },
    });

    if (cuentas.length !== cuentaIds.length) {
      throw new NotFoundError('Una o más cuentas contables no encontradas');
    }

    // Verificar que todas aceptan movimientos (no son cuentas de agrupación)
    for (const cuenta of cuentas) {
      if (!cuenta.acepta_movimientos) {
        throw new CuentaNoPertmiteMovimientosError(cuenta.codigo);
      }
    }

    // ── 3. REGLA FUNDAMENTAL: Partida Doble ──────────────────────────────────
    const totalDebito = dto.lineas.reduce((sum, l) => sum + l.debito, 0);
    const totalCredito = dto.lineas.reduce((sum, l) => sum + l.credito, 0);

    if (Math.abs(totalDebito - totalCredito) > EPSILON) {
      throw new AsientoDesbalanceadoError(totalDebito, totalCredito);
    }

    if (totalDebito === 0) {
      throw new AppError('El asiento no puede tener valores en cero', 400);
    }

    // ── 4. Generar número consecutivo ────────────────────────────────────────
    const numero = await this.asientosRepo.generarNumeroConsecutivo();

    // ── 5. Construir líneas con orden ────────────────────────────────────────
    const lineas = dto.lineas.map((linea, index) => ({
      cuentaId: linea.cuentaId,
      descripcion: linea.descripcion,
      debito: linea.debito,
      credito: linea.credito,
      baseImpuesto: linea.baseImpuesto,
      impuestoId: linea.impuestoId,
      orden: index + 1,
    }));

    // ── 6. Persistir ─────────────────────────────────────────────────────────
    const asiento = await this.asientosRepo.crear({
      numero,
      fecha: new Date(dto.fecha),
      descripcion: dto.descripcion,
      tipo: dto.tipo,
      estado: 'BORRADOR',
      totalDebito,
      totalCredito,
      periodoId: dto.periodoId,
      terceroId: dto.terceroId,
      referencia: dto.referencia,
      notas: dto.notas,
      creadoPorId: usuarioId,
      lineas,
    });

    log.info('Asiento creado', {
      numero,
      tipo: dto.tipo,
      totalDebito,
      totalCredito,
      lineas: dto.lineas.length,
      usuarioId,
    });

    return asiento;
  }

  async obtenerAsiento(id: string) {
    const asiento = await this.asientosRepo.findById(id);
    if (!asiento) throw new NotFoundError('Asiento', id);
    return asiento;
  }

  async listarAsientos(filtros: FiltrosAsientoDto) {
    return this.asientosRepo.findAll(filtros);
  }

  async aprobarAsiento(id: string) {
    const asiento = await this.asientosRepo.findById(id);
    if (!asiento) throw new NotFoundError('Asiento', id);

    if (asiento.estado !== 'BORRADOR') {
      throw new AppError(
        `No se puede aprobar un asiento en estado "${asiento.estado}"`,
        400
      );
    }

    const actualizado = await this.asientosRepo.actualizarEstado(id, 'APROBADO');
    log.info('Asiento aprobado', { id, numero: asiento.numero });
    return actualizado;
  }

  async anularAsiento(id: string, usuarioId: string) {
    const asiento = await this.asientosRepo.findById(id);
    if (!asiento) throw new NotFoundError('Asiento', id);

    if (asiento.estado === 'ANULADO') {
      throw new AppError('El asiento ya está anulado', 400);
    }

    // Si estaba aprobado, crear asiento de reverso (buena práctica contable)
    if (asiento.estado === 'APROBADO') {
      await this.crearAsientoReverso(asiento, usuarioId);
    }

    const actualizado = await this.asientosRepo.actualizarEstado(id, 'ANULADO');
    log.info('Asiento anulado', { id, numero: asiento.numero, usuarioId });
    return actualizado;
  }

  async obtenerSaldoCuenta(cuentaId: string, hasta?: string) {
    const cuenta = await prisma.cuentaContable.findUnique({
      where: { id: cuentaId },
    });
    if (!cuenta) throw new NotFoundError('Cuenta contable', cuentaId);

    const saldo = await this.asientosRepo.getSaldoCuenta(
      cuentaId,
      hasta ? new Date(hasta) : undefined
    );

    // El saldo real depende de la naturaleza de la cuenta
    const saldoReal =
      cuenta.naturaleza === 'DEBITO'
        ? saldo.debito - saldo.credito   // Activos, Gastos: saldo deudor
        : saldo.credito - saldo.debito;  // Pasivos, Patrimonio, Ingresos: saldo acreedor

    return {
      cuenta: { id: cuenta.id, codigo: cuenta.codigo, nombre: cuenta.nombre },
      movimientos: saldo,
      saldo: saldoReal,
    };
  }

  // Asiento de reverso para anulaciones de asientos aprobados
  private async crearAsientoReverso(
    asientoOriginal: Awaited<ReturnType<AsientosRepository['findById']>>,
    usuarioId: string
  ) {
    if (!asientoOriginal) return;

    const numero = await this.asientosRepo.generarNumeroConsecutivo();

    const lineasInvertidas = asientoOriginal.lineas.map((linea, index) => ({
      cuentaId: linea.cuentaId,
      descripcion: `REVERSO: ${linea.descripcion ?? ''}`,
      debito: Number(linea.credito), // Invertir débito y crédito
      credito: Number(linea.debito),
      orden: index + 1,
    }));

    await this.asientosRepo.crear({
      numero,
      fecha: new Date(),
      descripcion: `REVERSO - ${asientoOriginal.descripcion} (${asientoOriginal.numero})`,
      tipo: asientoOriginal.tipo,
      estado: 'APROBADO', // El reverso se aprueba automáticamente
      totalDebito: Number(asientoOriginal.totalCredito),
      totalCredito: Number(asientoOriginal.totalDebito),
      periodoId: asientoOriginal.periodoId,
      terceroId: asientoOriginal.terceroId ?? undefined,
      referencia: asientoOriginal.numero,
      creadoPorId: usuarioId,
      lineas: lineasInvertidas,
    });

    log.info('Asiento de reverso creado', { numero, originalId: asientoOriginal.id });
  }
}
