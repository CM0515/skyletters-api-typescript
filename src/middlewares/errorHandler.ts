import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { env } from "../config/env";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  logger.error(err.message, { stack: err.stack });

  const statusCode = 500;
  const message =
    env.NODE_ENV === "production"
      ? "Error interno del servidor"
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}
