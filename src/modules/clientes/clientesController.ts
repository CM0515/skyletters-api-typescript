import { Response, NextFunction } from "express";
import { clienteService } from "../../services/clientes/clienteService";    
import { AuthRequest } from "../../middlewares/auth";

export const clientesController = {
    async getAll(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const clientes = await clienteService.getAll();
            res.json({
                success: true,
                message: clientes.length>0 ? "Clientes obtenidos exitosamente" : "No se encontraron clientes",
                data: clientes
            });
        } catch (error) {
            next(error);
        }
    },
    async create (req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const cliente = await clienteService.create(req.body);
            res.status(201).json({
                success: true,
                message: "Cliente creado exitosamente",
                data: cliente
            });
        } catch (error) {
            next(error);
        }
    }
}
