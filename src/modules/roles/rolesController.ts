import { Response, NextFunction } from "express";
import { rolesService } from "../../services/roles/rolesService";
import type { AuthRequest } from "../../middlewares/auth";

export const rolesController = {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await rolesService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const data = await rolesService.getById(id);
      if (!data) {
        res.status(404).json({ success: false, message: "Rol no encontrado" });
        return;
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await rolesService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const data = await rolesService.update(id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await rolesService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
