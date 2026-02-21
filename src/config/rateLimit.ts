import rateLimit from "express-rate-limit";
import { env } from "./env";

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: { success: false, message: "Demasiadas solicitudes, intente más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});
