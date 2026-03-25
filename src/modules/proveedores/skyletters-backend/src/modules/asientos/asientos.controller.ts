// src/modules/asientos/asientos.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { AsientosService } from './asientos.service';
import { AsientosRepository } from './asientos.repository';
import { crearAsientoSchema, filtrosAsientoSchema } from './asientos.schemas';
import { autenticar, autorizar } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/errorHandler';

class AsientosController {
  constructor(private readonly service: AsientosService) {}

  crear = asyncHandler(async (req: Request, res: Response) => {
    const dto = crearAsientoSchema.parse(req.body);
    const asiento = await this.service.crearAsiento(dto, req.usuario!.id);

    res.status(201).json({
      exito: true,
      mensaje: `Asiento ${asiento.numero} creado correctamente`,
      datos: asiento,
    });
  });

  obtener = asyncHandler(async (req: Request, res: Response) => {
    const asiento = await this.service.obtenerAsiento(req.params.id);
    res.json({ exito: true, datos: asiento });
  });

  listar = asyncHandler(async (req: Request, res: Response) => {
    const filtros = filtrosAsientoSchema.parse(req.query);
    const resultado = await this.service.listarAsientos(filtros);

    res.json({
      exito: true,
      datos: resultado.datos,
      paginacion: {
        total: resultado.total,
        pagina: resultado.pagina,
        totalPaginas: resultado.totalPaginas,
      },
    });
  });

  aprobar = asyncHandler(async (req: Request, res: Response) => {
    const asiento = await this.service.aprobarAsiento(req.params.id);
    res.json({
      exito: true,
      mensaje: `Asiento ${asiento.numero} aprobado`,
      datos: asiento,
    });
  });

  anular = asyncHandler(async (req: Request, res: Response) => {
    const asiento = await this.service.anularAsiento(req.params.id, req.usuario!.id);
    res.json({
      exito: true,
      mensaje: `Asiento ${asiento.numero} anulado`,
      datos: asiento,
    });
  });

  saldoCuenta = asyncHandler(async (req: Request, res: Response) => {
    const { hasta } = req.query as { hasta?: string };
    const resultado = await this.service.obtenerSaldoCuenta(req.params.cuentaId, hasta);
    res.json({ exito: true, datos: resultado });
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

const router = Router();
const service = new AsientosService(new AsientosRepository());
const ctrl = new AsientosController(service);

router.use(autenticar); // Todos los endpoints requieren autenticación

router.post('/', autorizar('asientos', 'crear'), ctrl.crear);
router.get('/', autorizar('asientos', 'leer'), ctrl.listar);
router.get('/:id', autorizar('asientos', 'leer'), ctrl.obtener);
router.patch('/:id/aprobar', autorizar('asientos', 'aprobar'), ctrl.aprobar);
router.patch('/:id/anular', autorizar('asientos', 'anular'), ctrl.anular);
router.get('/saldo/:cuentaId', autorizar('asientos', 'leer'), ctrl.saldoCuenta);

export { router as asientosRouter };
