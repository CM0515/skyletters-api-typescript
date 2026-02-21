import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("3000"),
  API_PREFIX: z.string().default("/api/v1"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerida"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET debe tener al menos 16 caracteres"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET es requerido"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGINS: z.string().default("*"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("100"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variables de entorno inválidas:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
