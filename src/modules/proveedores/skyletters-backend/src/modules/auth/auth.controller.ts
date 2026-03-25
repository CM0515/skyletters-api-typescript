// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, refreshTokenSchema } from './auth.schemas';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = loginSchema.parse(req.body);
      const resultado = await this.authService.login(dto);

      res.status(200).json({
        exito: true,
        mensaje: 'Sesión iniciada correctamente',
        datos: resultado,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const tokens = await this.authService.refresh(refreshToken);

      res.status(200).json({
        exito: true,
        mensaje: 'Tokens renovados',
        datos: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      await this.authService.logout(refreshToken, req.usuario!.id);

      res.status(200).json({ exito: true, mensaje: 'Sesión cerrada correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.logoutAll(req.usuario!.id);

      res.status(200).json({
        exito: true,
        mensaje: 'Sesión cerrada en todos los dispositivos',
      });
    } catch (error) {
      next(error);
    }
  }

  async perfil(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      exito: true,
      datos: req.usuario,
    });
  }
}

// ─── Router ──────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { AuthRepository } from './auth.repository';
import { autenticar } from '../../middlewares/auth';

const router = Router();
const authService = new AuthService(new AuthRepository());
const controller = new AuthController(authService);

router.post('/login', (req, res, next) => controller.login(req, res, next));
router.post('/refresh', (req, res, next) => controller.refresh(req, res, next));
router.post('/logout', autenticar, (req, res, next) => controller.logout(req, res, next));
router.post('/logout-all', autenticar, (req, res, next) => controller.logoutAll(req, res, next));
router.get('/perfil', autenticar, (req, res) => controller.perfil(req, res));

export { router as authRouter };
