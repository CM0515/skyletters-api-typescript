import { proveedoresRepository,type CreateProveedorData } from "../../repositories/proveedoresRepository";
import { AppError } from "../../utils/AppError";
import type { Proveedor } from "@prisma/client";

export const proveedoresServices = {
    async getAll (): Promise<Proveedor[]> {
        return proveedoresRepository.findAll()
    },
    async findByNit (nit: string): Promise<Proveedor> {
        const proveedor = await proveedoresRepository.findByNit(nit)
        if (!proveedor) {
            throw new AppError("Proveedor no encontrado", 404)
        }
        return proveedor
    },
    async create (data: CreateProveedorData): Promise<Proveedor> {
        const existingProveedor = await proveedoresRepository.findByNit(data.nitProveedor)
        if (existingProveedor) {
            throw new AppError("Proveedor ya existe", 409)
        }
        return proveedoresRepository.create(data)
    }
}