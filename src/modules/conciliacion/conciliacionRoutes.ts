import { Router } from "express";
import { conciliacionController } from "./conciliacionController";
import { validate } from "../../middlewares/validate";
import { authMiddleware } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/roles";
import {
  createConciliacionSchema,
  updateConciliacionSchema,
  idParamSchema,
} from "./conciliacionValidation";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("conciliacion"));

router.get("/", conciliacionController.getAll);
router.get("/:id", validate(idParamSchema), conciliacionController.getById);
router.post("/", validate(createConciliacionSchema), conciliacionController.create);
router.put("/:id", validate(updateConciliacionSchema), conciliacionController.update);
router.delete("/:id", validate(idParamSchema), conciliacionController.delete);

export const conciliacionRoutes = router;
