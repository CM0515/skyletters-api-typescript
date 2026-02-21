import { Response, NextFunction } from "express";
import { parametrizacionService } from "../../services/parametrizacion/parametrizacionService";
import type { AuthRequest } from "../../middlewares/auth";

export const parametrizacionController = {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await parametrizacionService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getCurrent(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await parametrizacionService.getCurrent();
      if (!data) {
        res.status(404).json({ success: false, message: "Parametrización no configurada" });
        return;
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const data = await parametrizacionService.getById(id);
      if (!data) {
        res.status(404).json({ success: false, message: "Parametrización no encontrada" });
        return;
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await parametrizacionService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const data = await parametrizacionService.update(id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await parametrizacionService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
