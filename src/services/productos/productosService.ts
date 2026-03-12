import { productosRepository, type CreateProductoData } from "../../repositories/productosRepository";
import { AppError } from "../../utils/AppError";
import type { Producto } from "@prisma/client";

export const productosService = {
    async create(data: CreateProductoData): Promise<Producto> {
        const existingProducto = await productosRepository.findByname(data.nombreProducto);
        if (existingProducto) {
            throw new AppError("El producto ya existe", 400);
        }
        return productosRepository.create(data);
    },
    async findAll(): Promise<Producto[]> {
        return productosRepository.findAll();
    },
    async findByname(nombreProducto: string): Promise<Producto> {
        const producto = await productosRepository.findByname(nombreProducto);
        if (!producto) {
            throw new AppError("Producto no encontrado", 404);
        }
        return producto;
    }
}