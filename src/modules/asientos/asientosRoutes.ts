import { Router } from "express";
import { asientosController } from "./asientosController";
import { validate } from "../../middlewares/validate";
import { authMiddleware } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/roles";
import { createAsientoSchema, updateAsientoSchema, idParamSchema } from "./asientosValidation";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("asientos"));

router.get("/", asientosController.getAll);
router.get("/:id", validate(idParamSchema), asientosController.getById);
router.post("/", validate(createAsientoSchema), asientosController.create);
router.put("/:id", validate(updateAsientoSchema), asientosController.update);
router.delete("/:id", validate(idParamSchema), asientosController.delete);

export const asientosRoutes = router;
