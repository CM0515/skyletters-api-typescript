import { productosService } from "../../services/productos/productosService";
import { Response, NextFunction } from "express";

export const productosController = {
    async create(req: any, res: Response, next: NextFunction) {
        try {
            const producto = await productosService.create(req.body);
            res.status(201).json(producto);
        } catch (error) {
            next(error);
        }  
    },
    async findAll(req: any, res: Response, next: NextFunction) {
        try {
            const productos = await productosService.findAll();
            res.json(productos);
        } catch (error) {
            next(error);
        }
    },
    async findByname(req: any, res: Response, next: NextFunction) {
        try {  
            const { nombreProducto } = req.params;
            const producto = await productosService.findByname(nombreProducto);
            res.json(producto);
        }
        catch (error) {
            next(error);
        }
    }
}