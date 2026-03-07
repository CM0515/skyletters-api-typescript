import { Response, NextFunction } from "express";
import { proveedoresServices } from "../../services/proveedores/proveedoresServices";
import type { AuthRequest } from "@/middlewares/auth";

export const proveedoresController = {
    async getAll (req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const proveedores = await proveedoresServices.getAll()
            res.json(proveedores)
        } catch (error) {
            next(error)
        }
    },
    async findByNit (req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { nit } = req.params
            console.log("Buscando proveedor con NIT:", nit)
            const proveedor = await proveedoresServices.findByNit(nit)
            res.json(proveedor)
        } catch (error) {
            next(error)
        }
    },
    async create (req: AuthRequest, res: Response, next: NextFunction) {
        try {  
            const data = req.body
            const newProveedor = await proveedoresServices.create(data)
            res.status(201).json(newProveedor)
        } catch (error) {
            next(error)
        }
    }
}