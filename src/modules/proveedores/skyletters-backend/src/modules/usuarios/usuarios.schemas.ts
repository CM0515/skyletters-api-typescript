// src/modules/usuarios/usuarios.schemas.ts
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');

export const crearUsuarioSchema = z.object({
  nombre: z.string().min(2).max(100),
  apellido: z.string().min(2).max(100),
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  rolId: z.string().cuid('ID de rol inválido'),
});

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  apellido: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  rolId: z.string().cuid().optional(),
  activo: z.boolean().optional(),
});

export const cambiarPasswordSchema = z.object({
  passwordActual: z.string().min(1),
  passwordNuevo: passwordSchema,
});

export type CrearUsuarioDto = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioDto = z.infer<typeof actualizarUsuarioSchema>;
export type CambiarPasswordDto = z.infer<typeof cambiarPasswordSchema>;
