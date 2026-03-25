// src/modules/reportes/reportes.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ReportesService } from './reportes.service';
import { autenticar, autorizar } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/errorHandler';

const periodoSchema = z.object({
  desde: z.string().datetime({ message: 'Fecha "desde" inválida (ISO 8601)' }),
  hasta: z.string().datetime({ message: 'Fecha "hasta" inválida (ISO 8601)' }),
});

class ReportesController {
  constructor(private readonly service: ReportesService) {}

  balanceGeneral = asyncHandler(async (req: Request, res: Response) => {
    const { fecha } = req.query as { fecha?: string };
    const reporte = await this.service.balanceGeneral(fecha);

    res.json({
      exito: true,
      datos: reporte,
      advertencia: !reporte.balanceado
        ? '⚠️ El balance no cuadra. Revisar asientos contables.'
        : undefined,
    });
  });

  estadoResultados = asyncHandler(async (req: Request, res: Response) => {
    const { desde, hasta } = periodoSchema.parse(req.query);
    const reporte = await this.service.estadoResultados(desde, hasta);
    res.json({ exito: true, datos: reporte });
  });

  libroDiario = asyncHandler(async (req: Request, res: Response) => {
    const { desde, hasta } = periodoSchema.parse(req.query);
    const reporte = await this.service.libroDiario(desde, hasta);
    res.json({ exito: true, datos: reporte });
  });

  mayorCuenta = asyncHandler(async (req: Request, res: Response) => {
    const { desde, hasta } = periodoSchema.parse(req.query);
    const reporte = await this.service.mayorCuenta(req.params.cuentaId, desde, hasta);
    res.json({ exito: true, datos: reporte });
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

const router = Router();
const ctrl = new ReportesController(new ReportesService());

router.use(autenticar);
router.use(autorizar('reportes', 'leer'));

router.get('/balance-general', ctrl.balanceGeneral);
router.get('/estado-resultados', ctrl.estadoResultados);
router.get('/libro-diario', ctrl.libroDiario);
router.get('/mayor/:cuentaId', ctrl.mayorCuenta);

export { router as reportesRouter };
