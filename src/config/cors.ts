import cors from "cors";
import { env } from "./env";

const origins = env.CORS_ORIGINS === "*" ? "*" : env.CORS_ORIGINS.split(",").map((o) => o.trim());

export const corsOptions: cors.CorsOptions = {
  origin: origins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
