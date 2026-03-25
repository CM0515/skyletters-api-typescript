// src/modules/asientos/asientos.repository.ts
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { FiltrosAsientoDto } from './asientos.schemas';

// Tipo de retorno enriquecido para asientos
const asientoConDetalles = Prisma.validator<Prisma.AsientoDefaultArgs>()({
  include: {
    lineas: {
      include: {
        cuenta: { select: { codigo: true, nombre: true, tipo: true } },
        impuesto: { select: { nombre: true, tarifa: true } },
      },
      orderBy: { orden: 'asc' },
    },
    tercero: { select: { razonSocial: true, numeroDocumento: true } },
    periodo: { select: { año: true, mes: true, nombre: true, estado: true } },
    creadoPor: { select: { nombre: true, apellido: true, email: true } },
  },
});

export type AsientoConDetalles = Prisma.AsientoGetPayload<typeof asientoConDetalles>;

export class AsientosRepository {
  async crear(
    data: Prisma.AsientoUncheckedCreateInput & {
      lineas: Prisma.LineaAsientoUncheckedCreateWithoutAsientoInput[];
    }
  ): Promise<AsientoConDetalles> {
    const { lineas, ...asientoData } = data;

    return prisma.asiento.create({
      data: {
        ...asientoData,
        lineas: {
          create: lineas,
        },
      },
      ...asientoConDetalles,
    });
  }

  async findById(id: string): Promise<AsientoConDetalles | null> {
    return prisma.asiento.findUnique({
      where: { id },
      ...asientoConDetalles,
    });
  }

  async findAll(filtros: FiltrosAsientoDto): Promise<{
    datos: AsientoConDetalles[];
    total: number;
    pagina: number;
    totalPaginas: number;
  }> {
    const { pagina, porPagina, fechaDesde, fechaHasta, ...resto } = filtros;
    const skip = (pagina - 1) * porPagina;

    const where: Prisma.AsientoWhereInput = {
      ...resto,
      ...(fechaDesde || fechaHasta
        ? {
            fecha: {
              ...(fechaDesde && { gte: new Date(fechaDesde) }),
              ...(fechaHasta && { lte: new Date(fechaHasta) }),
            },
          }
        : {}),
    };

    const [datos, total] = await Promise.all([
      prisma.asiento.findMany({
        where,
        skip,
        take: porPagina,
        orderBy: { fecha: 'desc' },
        ...asientoConDetalles,
      }),
      prisma.asiento.count({ where }),
    ]);

    return {
      datos,
      total,
      pagina,
      totalPaginas: Math.ceil(total / porPagina),
    };
  }

  async actualizarEstado(
    id: string,
    estado: 'APROBADO' | 'ANULADO'
  ): Promise<AsientoConDetalles> {
    return prisma.asiento.update({
      where: { id },
      data: { estado },
      ...asientoConDetalles,
    });
  }

  async generarNumeroConsecutivo(): Promise<string> {
    const año = new Date().getFullYear();
    const count = await prisma.asiento.count({
      where: {
        numero: { startsWith: `AS-${año}-` },
      },
    });
    return `AS-${año}-${String(count + 1).padStart(6, '0')}`;
  }

  async getSaldoCuenta(
    cuentaId: string,
    hasta?: Date
  ): Promise<{ debito: number; credito: number; saldo: number }> {
    const where: Prisma.LineaAsientoWhereInput = {
      cuentaId,
      asiento: {
        estado: 'APROBADO',
        ...(hasta && { fecha: { lte: hasta } }),
      },
    };

    const resultado = await prisma.lineaAsiento.aggregate({
      where,
      _sum: { debito: true, credito: true },
    });

    const debito = Number(resultado._sum.debito ?? 0);
    const credito = Number(resultado._sum.credito ?? 0);

    return { debito, credito, saldo: debito - credito };
  }
}
