// src/modules/usuarios/usuarios.controller.ts
import { Router, Request, Response } from 'express';
import { UsuariosService } from './usuarios.service';
import { UsuariosRepository } from './usuarios.repository';
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  cambiarPasswordSchema,
} from './usuarios.schemas';
import { autenticar, autorizar } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/errorHandler';

class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  crear = asyncHandler(async (req: Request, res: Response) => {
    const dto = crearUsuarioSchema.parse(req.body);
    const usuario = await this.service.crear(dto);
    res.status(201).json({ exito: true, mensaje: 'Usuario creado', datos: usuario });
  });

  listar = asyncHandler(async (_req: Request, res: Response) => {
    const usuarios = await this.service.listar();
    res.json({ exito: true, datos: usuarios });
  });

  obtener = asyncHandler(async (req: Request, res: Response) => {
    const usuario = await this.service.obtener(req.params.id);
    res.json({ exito: true, datos: usuario });
  });

  actualizar = asyncHandler(async (req: Request, res: Response) => {
    const dto = actualizarUsuarioSchema.parse(req.body);
    const usuario = await this.service.actualizar(req.params.id, dto);
    res.json({ exito: true, mensaje: 'Usuario actualizado', datos: usuario });
  });

  cambiarPassword = asyncHandler(async (req: Request, res: Response) => {
    const dto = cambiarPasswordSchema.parse(req.body);
    // Solo el propio usuario puede cambiar su contraseña (o un admin)
    await this.service.cambiarPassword(req.params.id, dto);
    res.json({ exito: true, mensaje: 'Contraseña actualizada correctamente' });
  });

  desactivar = asyncHandler(async (req: Request, res: Response) => {
    await this.service.desactivar(req.params.id, req.usuario!.id);
    res.json({ exito: true, mensaje: 'Usuario desactivado' });
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

const router = Router();
const service = new UsuariosService(new UsuariosRepository());
const ctrl = new UsuariosController(service);

router.use(autenticar);

router.post('/', autorizar('usuarios', 'crear'), ctrl.crear);
router.get('/', autorizar('usuarios', 'leer'), ctrl.listar);
router.get('/:id', autorizar('usuarios', 'leer'), ctrl.obtener);
router.patch('/:id', autorizar('usuarios', 'actualizar'), ctrl.actualizar);
router.patch('/:id/password', ctrl.cambiarPassword); // Propio usuario
router.delete('/:id', autorizar('usuarios', 'eliminar'), ctrl.desactivar);

export { router as usuariosRouter };
