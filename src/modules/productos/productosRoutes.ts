import { Router } from "express";
import { productosController } from "./productosController";

const router = Router();

router.post("/", productosController.create);
router.get("/", productosController.findAll);
router.get("/:nombreProducto", productosController.findByname);

export const productosRoutes = router;