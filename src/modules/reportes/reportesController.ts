import { Response, NextFunction } from "express";
import { reportesService } from "../../services/reportes/reportesService";
import type { AuthRequest } from "../../middlewares/auth";

export const reportesController = {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportesService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const data = await reportesService.getById(id);
      if (!data) {
        res.status(404).json({ success: false, message: "Reporte no encontrado" });
        return;
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportesService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const data = await reportesService.update(id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await reportesService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
