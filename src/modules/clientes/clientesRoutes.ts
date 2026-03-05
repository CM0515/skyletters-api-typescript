import { Router } from "express";
import { clientesController } from "./clientesController";
import { authMiddleware } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { createClienteSchema } from "./clientesValidation";

const router = Router();

router.get("/", clientesController.getAll);
router.post("/crear-cliente", validate(createClienteSchema), clientesController.create);


export const clientesRoutes = router;