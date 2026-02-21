import { Router } from "express";
import { usuariosController } from "./usuariosController";
import { validate } from "../../middlewares/validate";
import { authMiddleware } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/roles";
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  idParamSchema,
} from "./usuariosValidation";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("usuarios"));

router.get("/", usuariosController.getAll);
router.get("/:id", validate(idParamSchema), usuariosController.getById);
router.post("/", validate(createUsuarioSchema), usuariosController.create);
router.put("/:id", validate(updateUsuarioSchema), usuariosController.update);
router.delete("/:id", validate(idParamSchema), usuariosController.delete);

export const usuariosRoutes = router;
