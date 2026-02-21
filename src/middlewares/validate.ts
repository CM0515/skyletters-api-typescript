import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type SchemaSource = "body" | "query" | "params" | "headers";

interface SchemaShape {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

function getShape(schema: SchemaShape | { shape: SchemaShape }): SchemaShape {
  if (schema && "shape" in schema && schema.shape) {
    return schema.shape as SchemaShape;
  }
  return schema as SchemaShape;
}

export function validate(schema: SchemaShape | { shape: SchemaShape }) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const shape = getShape(schema);
    const sources: SchemaSource[] = ["body", "query", "params", "headers"];
    try {
      for (const key of sources) {
        const s = shape[key];
        if (s) {
          const result = s.safeParse((req as Request)[key]);
          if (!result.success) {
            next(result.error);
            return;
          }
          (req as Request)[key] = result.data;
        }
      }
      next();
    } catch (error) {
      next(error instanceof ZodError ? error : new Error("Validation failed"));
    }
  };
}
