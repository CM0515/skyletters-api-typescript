import { Router } from "express";
import { authController } from "./authController";
import { validate } from "../../middlewares/validate";
import { loginSchema, refreshSchema } from "./authValidation";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authMiddleware, authController.logout);

export const authRoutes = router;
