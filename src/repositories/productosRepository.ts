import { prisma } from "../config/database";
import type { Producto } from "@prisma/client";

export interface CreateProductoData {
  codigoProducto: string;
  nombreProducto: string;
  descripcionProducto: string;
  precioProducto: number;
  cantidadProducto: number;
}
export const productosRepository = {
  async create(data: CreateProductoData): Promise<Producto> {
    return prisma.producto.create({
      data:{...data,estadoProducto:true}
    });
  },
  async findByname(nombreProducto: string): Promise<Producto | null> {
    return prisma.producto.findFirst({
      where: { nombreProducto },
    });
  },
  async findAll(): Promise<Producto[]> {
    return prisma.producto.findMany({where:{estadoProducto:true}});
  }
}