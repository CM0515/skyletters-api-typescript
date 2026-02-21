import { Request, Response, NextFunction } from "express";
import { personasService } from "../../services/personas/personasService";

export const personasController = {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const nuevaPersona = await personasService.create(req.body);
            res.status(201).json({ success: true, data: nuevaPersona });
        } catch (error) {
            next(error);
        }
    }
};