import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    correoUsuario: z.string().email("Correo inválido"),
    contrasenaUsuario: z.string().min(1, "Contraseña requerida"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "refreshToken es requerido"),
  }),
});

export type LoginBody = z.infer<typeof loginSchema>["body"];
export type RefreshBody = z.infer<typeof refreshSchema>["body"];
