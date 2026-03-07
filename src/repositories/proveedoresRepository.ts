import { prisma } from "../config/database";
import type { Proveedor } from "@prisma/client";


export interface CreateProveedorData {
    nombreProveedor: string;
    razonSocial: string;
    nitProveedor: string;
    correoProveedor: string;
    telefonoProveedor: string;
    direccionProveedor: string;
    ciudadProveedor: string;
}
export const proveedoresRepository = {
    async findAll (): Promise<Proveedor[]>{
        return prisma.proveedor.findMany({where: {estadoProveedor: true}, orderBy: {id: "asc"}})
    },
    async findByNit (nit: string): Promise<Proveedor | null> {
        return prisma.proveedor.findFirst({where: {nitProveedor: nit}})
    },
    async create (data: CreateProveedorData): Promise<Proveedor> {
        return prisma.proveedor.create({data})
    }
}
