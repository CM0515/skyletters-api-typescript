import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { corsOptions } from "./config/cors";
import { rateLimiter } from "./config/rateLimit";
import { env } from "./config/env";
import { swaggerDocument } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import { authRoutes } from "./modules/auth/authRoutes";
import { usuariosRoutes } from "./modules/usuarios/usuariosRoutes";
import { rolesRoutes } from "./modules/roles/rolesRoutes";
import { parametrizacionRoutes } from "./modules/parametrizacion/parametrizacionRoutes";
import { asientosRoutes } from "./modules/asientos/asientosRoutes";
import { reportesRoutes } from "./modules/reportes/reportesRoutes";
import { personasRoutes } from './modules/personas/personasRoutes';
import { clientesRoutes } from './modules/clientes/clientesRoutes';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter);

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK", timestamp: new Date().toUTCString() });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(`${env.API_PREFIX}/auth`, authRoutes);
app.use(`${env.API_PREFIX}/usuarios`, usuariosRoutes);
app.use(`${env.API_PREFIX}/roles`, rolesRoutes);
app.use(`${env.API_PREFIX}/parametrizacion`, parametrizacionRoutes);
app.use(`${env.API_PREFIX}/asientos`, asientosRoutes);
app.use(`${env.API_PREFIX}/reportes`, reportesRoutes);
app.use(`${env.API_PREFIX}/personas`, personasRoutes);
app.use(`${env.API_PREFIX}/clientes`, clientesRoutes);

app.use(errorHandler);

export default app;
