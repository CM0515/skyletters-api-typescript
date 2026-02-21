import { Router } from "express";
import { rolesController } from "./rolesController";
import { validate } from "../../middlewares/validate";
import { authMiddleware } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/roles";
import { createRolSchema, updateRolSchema, idParamSchema } from "./rolesValidation";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("roles"));

router.get("/", rolesController.getAll);
router.get("/:id", validate(idParamSchema), rolesController.getById);
router.post("/", validate(createRolSchema), rolesController.create);
router.put("/:id", validate(updateRolSchema), rolesController.update);
router.delete("/:id", validate(idParamSchema), rolesController.delete);

export const rolesRoutes = router;
