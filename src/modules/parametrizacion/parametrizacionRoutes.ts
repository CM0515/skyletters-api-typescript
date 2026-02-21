import { Router } from "express";
import { parametrizacionController } from "./parametrizacionController";
import { validate } from "../../middlewares/validate";
import { authMiddleware } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/roles";
import {
  createParametrizacionSchema,
  updateParametrizacionSchema,
  idParamSchema,
} from "./parametrizacionValidation";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("parametrizacion"));

router.get("/", parametrizacionController.getAll);
router.get("/current", parametrizacionController.getCurrent);
router.get("/:id", validate(idParamSchema), parametrizacionController.getById);
router.post("/", validate(createParametrizacionSchema), parametrizacionController.create);
router.put("/:id", validate(updateParametrizacionSchema), parametrizacionController.update);
router.delete("/:id", validate(idParamSchema), parametrizacionController.delete);

export const parametrizacionRoutes = router;
