// src/modules/reportes/reportes.service.ts
// Genera estados financieros según principios contables colombianos
// Decisión técnica: los reportes solo consideran asientos APROBADOS para garantizar integridad

import { prisma } from '../../config/database';
import { TipoCuenta } from '@prisma/client';
import { createModuleLogger } from '../../utils/logger';

const log = createModuleLogger('reportes-service');

// ─── Tipos de retorno ────────────────────────────────────────────────────────

interface CuentaReporte {
  id: string;
  codigo: string;
  nombre: string;
  debito: number;
  credito: number;
  saldo: number;
  subcuentas?: CuentaReporte[];
}

interface GrupoReporte {
  tipo: TipoCuenta;
  cuentas: CuentaReporte[];
  total: number;
}

export interface BalanceGeneral {
  fecha: string;
  empresa: string;
  activos: GrupoReporte;
  pasivos: GrupoReporte;
  patrimonio: GrupoReporte;
  totalPasivoMasPatrimonio: number;
  balanceado: boolean;
  generadoEn: string;
}

export interface EstadoResultados {
  periodoDesde: string;
  periodoHasta: string;
  empresa: string;
  ingresos: GrupoReporte;
  costos: GrupoReporte;
  gastos: GrupoReporte;
  utilidadBruta: number;
  utilidadOperacional: number;
  utilidadNeta: number;
  margenBruto: number;    // %
  margenNeto: number;     // %
  generadoEn: string;
}

export interface LibroDiario {
  periodoDesde: string;
  periodoHasta: string;
  empresa: string;
  asientos: Array<{
    numero: string;
    fecha: string;
    descripcion: string;
    tipo: string;
    estado: string;
    tercero?: string;
    referencia?: string;
    lineas: Array<{
      cuenta: string;
      descripcion?: string;
      debito: number;
      credito: number;
    }>;
    totalDebito: number;
    totalCredito: number;
  }>;
  totalesGlobales: { debito: number; credito: number };
  generadoEn: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class ReportesService {
  private readonly EMPRESA = process.env.EMPRESA_NOMBRE ?? 'CARTAS AL CIELO';

  async balanceGeneral(fecha?: string): Promise<BalanceGeneral> {
    const fechaCorte = fecha ? new Date(fecha) : new Date();

    log.info('Generando Balance General', { fechaCorte });

    const [activos, pasivos, patrimonio] = await Promise.all([
      this.obtenerSaldosPorTipo(['ACTIVO'], fechaCorte),
      this.obtenerSaldosPorTipo(['PASIVO'], fechaCorte),
      this.obtenerSaldosPorTipo(['PATRIMONIO'], fechaCorte),
    ]);

    const totalActivos = activos.reduce((s, c) => s + c.saldo, 0);
    const totalPasivos = pasivos.reduce((s, c) => s + c.saldo, 0);
    const totalPatrimonio = patrimonio.reduce((s, c) => s + c.saldo, 0);
    const totalPasivoMasPatrimonio = totalPasivos + totalPatrimonio;

    return {
      fecha: fechaCorte.toISOString().split('T')[0],
      empresa: this.EMPRESA,
      activos: {
        tipo: 'ACTIVO',
        cuentas: activos,
        total: totalActivos,
      },
      pasivos: {
        tipo: 'PASIVO',
        cuentas: pasivos,
        total: totalPasivos,
      },
      patrimonio: {
        tipo: 'PATRIMONIO',
        cuentas: patrimonio,
        total: totalPatrimonio,
      },
      totalPasivoMasPatrimonio,
      // Ecuación contable fundamental: Activo = Pasivo + Patrimonio
      balanceado: Math.abs(totalActivos - totalPasivoMasPatrimonio) < 0.01,
      generadoEn: new Date().toISOString(),
    };
  }

  async estadoResultados(
    periodoDesde: string,
    periodoHasta: string
  ): Promise<EstadoResultados> {
    const desde = new Date(periodoDesde);
    const hasta = new Date(periodoHasta);

    log.info('Generando Estado de Resultados', { desde, hasta });

    const [ingresos, costos, gastos] = await Promise.all([
      this.obtenerSaldosPorTipo(['INGRESO'], hasta, desde),
      this.obtenerSaldosPorTipo(['COSTO'], hasta, desde),
      this.obtenerSaldosPorTipo(['GASTO'], hasta, desde),
    ]);

    const totalIngresos = ingresos.reduce((s, c) => s + c.saldo, 0);
    const totalCostos = costos.reduce((s, c) => s + c.saldo, 0);
    const totalGastos = gastos.reduce((s, c) => s + c.saldo, 0);

    const utilidadBruta = totalIngresos - totalCostos;
    const utilidadOperacional = utilidadBruta - totalGastos;
    const utilidadNeta = utilidadOperacional; // Se puede extender con impuestos de renta

    return {
      periodoDesde: desde.toISOString().split('T')[0],
      periodoHasta: hasta.toISOString().split('T')[0],
      empresa: this.EMPRESA,
      ingresos: { tipo: 'INGRESO', cuentas: ingresos, total: totalIngresos },
      costos: { tipo: 'COSTO', cuentas: costos, total: totalCostos },
      gastos: { tipo: 'GASTO', cuentas: gastos, total: totalGastos },
      utilidadBruta,
      utilidadOperacional,
      utilidadNeta,
      margenBruto: totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0,
      margenNeto: totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0,
      generadoEn: new Date().toISOString(),
    };
  }

  async libroDiario(periodoDesde: string, periodoHasta: string): Promise<LibroDiario> {
    const desde = new Date(periodoDesde);
    const hasta = new Date(periodoHasta);

    const asientos = await prisma.asiento.findMany({
      where: {
        estado: 'APROBADO',
        fecha: { gte: desde, lte: hasta },
      },
      include: {
        lineas: {
          include: { cuenta: { select: { codigo: true, nombre: true } } },
          orderBy: { orden: 'asc' },
        },
        tercero: { select: { razonSocial: true } },
      },
      orderBy: [{ fecha: 'asc' }, { numero: 'asc' }],
    });

    let debitoGlobal = 0;
    let creditoGlobal = 0;

    const asientosFormateados = asientos.map((a) => {
      debitoGlobal += Number(a.totalDebito);
      creditoGlobal += Number(a.totalCredito);

      return {
        numero: a.numero,
        fecha: a.fecha.toISOString().split('T')[0],
        descripcion: a.descripcion,
        tipo: a.tipo,
        estado: a.estado,
        tercero: a.tercero?.razonSocial,
        referencia: a.referencia ?? undefined,
        lineas: a.lineas.map((l) => ({
          cuenta: `${l.cuenta.codigo} - ${l.cuenta.nombre}`,
          descripcion: l.descripcion ?? undefined,
          debito: Number(l.debito),
          credito: Number(l.credito),
        })),
        totalDebito: Number(a.totalDebito),
        totalCredito: Number(a.totalCredito),
      };
    });

    return {
      periodoDesde: desde.toISOString().split('T')[0],
      periodoHasta: hasta.toISOString().split('T')[0],
      empresa: this.EMPRESA,
      asientos: asientosFormateados,
      totalesGlobales: { debito: debitoGlobal, credito: creditoGlobal },
      generadoEn: new Date().toISOString(),
    };
  }

  async mayorCuenta(
    cuentaId: string,
    periodoDesde: string,
    periodoHasta: string
  ) {
    const desde = new Date(periodoDesde);
    const hasta = new Date(periodoHasta);

    const cuenta = await prisma.cuentaContable.findUnique({ where: { id: cuentaId } });
    if (!cuenta) throw new Error(`Cuenta ${cuentaId} no encontrada`);

    // Saldo anterior al período
    const saldoAnterior = await this.calcularSaldoCuenta(cuentaId, cuenta.naturaleza, hasta);

    const lineas = await prisma.lineaAsiento.findMany({
      where: {
        cuentaId,
        asiento: {
          estado: 'APROBADO',
          fecha: { gte: desde, lte: hasta },
        },
      },
      include: {
        asiento: {
          select: { numero: true, fecha: true, descripcion: true, tercero: { select: { razonSocial: true } } },
        },
      },
      orderBy: { asiento: { fecha: 'asc' } },
    });

    let saldoAcumulado = 0;
    const movimientos = lineas.map((l) => {
      const debito = Number(l.debito);
      const credito = Number(l.credito);
      saldoAcumulado +=
        cuenta.naturaleza === 'DEBITO' ? debito - credito : credito - debito;

      return {
        fecha: l.asiento.fecha.toISOString().split('T')[0],
        numero: l.asiento.numero,
        descripcion: l.descripcion ?? l.asiento.descripcion,
        tercero: l.asiento.tercero?.razonSocial,
        debito,
        credito,
        saldo: saldoAcumulado,
      };
    });

    return {
      cuenta: { codigo: cuenta.codigo, nombre: cuenta.nombre, naturaleza: cuenta.naturaleza },
      periodoDesde: desde.toISOString().split('T')[0],
      periodoHasta: hasta.toISOString().split('T')[0],
      saldoAnterior,
      movimientos,
      totales: {
        debito: lineas.reduce((s, l) => s + Number(l.debito), 0),
        credito: lineas.reduce((s, l) => s + Number(l.credito), 0),
        saldoFinal: saldoAcumulado,
      },
      generadoEn: new Date().toISOString(),
    };
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────

  private async obtenerSaldosPorTipo(
    tipos: TipoCuenta[],
    hasta: Date,
    desde?: Date
  ): Promise<CuentaReporte[]> {
    // Solo cuentas hoja (que aceptan movimientos) con saldo
    const cuentas = await prisma.cuentaContable.findMany({
      where: { tipo: { in: tipos }, activo: true, acepta_movimientos: true },
      orderBy: { codigo: 'asc' },
    });

    const saldos: CuentaReporte[] = [];

    for (const cuenta of cuentas) {
      const agg = await prisma.lineaAsiento.aggregate({
        where: {
          cuentaId: cuenta.id,
          asiento: {
            estado: 'APROBADO',
            fecha: {
              ...(desde && { gte: desde }),
              lte: hasta,
            },
          },
        },
        _sum: { debito: true, credito: true },
      });

      const debito = Number(agg._sum.debito ?? 0);
      const credito = Number(agg._sum.credito ?? 0);
      const saldo =
        cuenta.naturaleza === 'DEBITO' ? debito - credito : credito - debito;

      // Solo incluir cuentas con movimiento
      if (debito !== 0 || credito !== 0) {
        saldos.push({ id: cuenta.id, codigo: cuenta.codigo, nombre: cuenta.nombre, debito, credito, saldo });
      }
    }

    return saldos;
  }

  private async calcularSaldoCuenta(
    cuentaId: string,
    naturaleza: string,
    hasta: Date
  ): Promise<number> {
    const agg = await prisma.lineaAsiento.aggregate({
      where: { cuentaId, asiento: { estado: 'APROBADO', fecha: { lt: hasta } } },
      _sum: { debito: true, credito: true },
    });
    const debito = Number(agg._sum.debito ?? 0);
    const credito = Number(agg._sum.credito ?? 0);
    return naturaleza === 'DEBITO' ? debito - credito : credito - debito;
  }
}
