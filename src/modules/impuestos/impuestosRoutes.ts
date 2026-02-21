import { Router } from "express";
import { impuestosController } from "./impuestosController";
import { validate } from "../../middlewares/validate";
import { authMiddleware } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/roles";
import { createImpuestoSchema, updateImpuestoSchema, idParamSchema } from "./impuestosValidation";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("impuestos"));

router.get("/", impuestosController.getAll);
router.get("/:id", validate(idParamSchema), impuestosController.getById);
router.post("/", validate(createImpuestoSchema), impuestosController.create);
router.put("/:id", validate(updateImpuestoSchema), impuestosController.update);
router.delete("/:id", validate(idParamSchema), impuestosController.delete);

export const impuestosRoutes = router;
