import { Response, NextFunction } from "express";
import { authService } from "../../services/auth/authService";
import type { AuthRequest } from "../../middlewares/auth";

export const authController = {
  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken as string | undefined;
      if (!refreshToken) {
        res.status(400).json({ success: false, message: "refreshToken es requerido" });
        return;
      }
      const tokens = await authService.refresh(refreshToken);
      res.status(200).json({ success: true, data: { tokens } });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken as string | undefined;
      await authService.logout(refreshToken);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
