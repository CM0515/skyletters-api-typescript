import {clientesRepository, type CreateClienteData} from "../../repositories/clientesRepository";
import type { Cliente } from "@prisma/client";
import { AppError } from "../../utils/AppError";

export const clienteService = {
    async getAll(): Promise<Cliente[]> {
        try {
            return await clientesRepository.getAll();
        } catch (error) {
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
            throw new AppError("Error al crear el cliente", 500);
        }
    }
}