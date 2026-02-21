import { Router } from "express";
import { personasController } from "./personasController";
import { createPersonaSchema } from "./personasValidation";
import { validate } from "../../middlewares/validate";

const router = Router();

router.post("/", validate(createPersonaSchema), personasController.create);


export const personasRoutes = router;