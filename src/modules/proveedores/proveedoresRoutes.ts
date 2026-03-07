import { Router } from "express";
import { proveedoresController } from "./proveedoresController";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

router.get("/", proveedoresController.getAll);
router.get("/:nit", proveedoresController.findByNit);
router.post("/", proveedoresController.create);

export const proveedoresRoutes = router;
