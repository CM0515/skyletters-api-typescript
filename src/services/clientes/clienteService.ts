import {clientesRepository, type CreateClienteData} from "../../repositories/clientesRepository";
import type { Cliente } from "@prisma/client";
import { AppError } from "../../utils/AppError";

export const clienteService = {
    async getAll(): Promise<Cliente[]> {
        try {
            return await clientesRepository.getAll();
        } catch (error) {
            // Re-lanzar AppError tal como viene (preserva el código de estado)
            if (error instanceof AppError) {
                throw error;
            }
            // Convertir otros errores a 500
            throw new AppError("Error al obtener los clientes", 500);
        }
    },
    async getById(id: number): Promise<Cliente> {
        try {
            const cliente = await clientesRepository.getById(id);
            if (!cliente) {
                throw new AppError("Cliente no encontrado", 404);
            }
            return cliente;
        } catch (error) {
            // Re-lanzar AppError tal como viene (preserva el código de estado)
            if (error instanceof AppError) {
                throw error;
            }
            // Convertir otros errores a 500
            throw new AppError("Error al obtener el cliente", 500);
        }
    },
    async create(data: CreateClienteData): Promise<Cliente> {
        try {
            const existingCliente = await clientesRepository.findByNit(data.nitCliente);
            if (existingCliente) {
                throw new AppError("Ya existe un cliente con el mismo NIT", 400);
            }
            return await clientesRepository.create(data);
        } catch (error) {
            // Re-lanzar AppError tal como viene (preserva el código de estado)
            if (error instanceof AppError) {
                throw error;
            }
            // Convertir otros errores a 500
            throw new AppError("Error al crear el cliente", 500);
        }
    },
    async update(id: number, data: Partial<CreateClienteData>): Promise<Cliente> {
        try {
            const cliente = await clientesRepository.getById(id);
            if (!cliente) {
                throw new AppError("Cliente no encontrado", 404);
            }
            if (data.nitCliente && data.nitCliente !== cliente.nitCliente) {
                const existingCliente = await clientesRepository.findByNit(data.nitCliente);
                if (existingCliente) {
                    throw new AppError("Ya existe un cliente con el mismo NIT", 400);
                }
            }
            return await clientesRepository.update(id, data);
        } catch (error) {
            // Re-lanzar AppError tal como viene (preserva el código de estado)
            if (error instanceof AppError) {
                throw error;
            }
            // Convertir otros errores a 500
            throw new AppError("Error al actualizar el cliente", 500);
        }
    },
    async delete(id: number): Promise<Cliente> {
        try {
            const cliente = await clientesRepository.getById(id);
            if (!cliente) {
                throw new AppError("Cliente no encontrado", 404);
            }
            return await clientesRepository.delete(id);
        } catch (error) {
            // Re-lanzar AppError tal como viene (preserva el código de estado)
            if (error instanceof AppError) {
                throw error;
            }
            // Convertir otros errores a 500
            throw new AppError("Error al eliminar el cliente", 500);
        }
    },
    async findByNit(nit: string): Promise<Cliente | null> {
        try {
            return await clientesRepository.findByNit(nit);
        } catch (error) {
            // Re-lanzar AppError tal como viene (preserva el código de estado)
            if (error instanceof AppError) {
                throw error;
            }
            // Convertir otros errores a 500
            throw new AppError("Error al buscar el cliente por NIT", 500);
        }
    }
}