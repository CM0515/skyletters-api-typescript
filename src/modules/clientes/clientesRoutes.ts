import { Router } from "express";
import { clientesController } from "./clientesController";
import { authMiddleware } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { createClienteSchema } from "./clientesValidation";

const router = Router();

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

// [GET] Obtener todos los clientes
router.get("/", clientesController.getAll);

// [POST] Crear nuevo cliente
router.post("/", validate(createClienteSchema), clientesController.create);

// [GET] Obtener cliente por ID
router.get("/:id", clientesController.getById);

// [PUT] Actualizar cliente por ID
router.put("/:id", validate(createClienteSchema), clientesController.update);

// [DELETE] Eliminar cliente por ID
router.delete("/:id", clientesController.delete);

// [GET] Obtener cliente por NIT
router.get("/nit/:nit", clientesController.findByNit);

export const clientesRoutes = router;