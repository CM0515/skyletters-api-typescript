import { prisma } from "../config/database"; 
import type { Cliente } from "@prisma/client";

export interface CreateClienteData {
    nombreCliente: string;
    razonSocial: string;
    nitCliente: string;
    correoCliente: string;
    telefonoCliente: string;
    direccionCliente: string;
    ciudadCliente: string;
}

export const clientesRepository = {
    async getAll (): Promise<Cliente[]> {
        return prisma.cliente.findMany({where: {estadoCliente: true}, orderBy: {id: "asc"}})
    },
    async getById (id: number): Promise<Cliente | null> {
        return prisma.cliente.findUnique({where: {id, estadoCliente: true}})
    },
    async create (data: CreateClienteData): Promise<Cliente> {
        return prisma.cliente.create({data})
    },
    async update (id: number, data: Partial<CreateClienteData>): Promise<Cliente> {
        return prisma.cliente.update({where: {id}, data})
    },
    async delete (id: number): Promise<Cliente> {
        return prisma.cliente.update({where: {id}, data: {estadoCliente: false}})
    },
    async findByNit (nit: string): Promise<Cliente | null> {
        return prisma.cliente.findFirst({where: {nitCliente: nit}})
    }
}


