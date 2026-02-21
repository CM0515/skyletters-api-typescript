import { Response, NextFunction } from "express";
import { asientosService } from "../../services/asientos/asientosService";
import type { AuthRequest } from "../../middlewares/auth";

export const asientosController = {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await asientosService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const data = await asientosService.getById(id);
      if (!data) {
        res.status(404).json({ success: false, message: "Asiento no encontrado" });
        return;
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await asientosService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const data = await asientosService.update(id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await asientosService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
