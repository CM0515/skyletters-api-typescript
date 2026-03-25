// src/utils/AppError.ts
// Jerarquía de errores personalizada para manejo robusto y tipado
// Decisión técnica: extiende Error nativo para compatibilidad con middleware de Express

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean; // Errores esperados vs bugs

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Errores específicos del dominio ──────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(recurso: string, id?: string) {
    super(
      id ? `${recurso} con id "${id}" no encontrado` : `${recurso} no encontrado`,
      404
    );
  }
}

export class ValidationError extends AppError {
  public readonly errores: Record<string, string[]>;

  constructor(errores: Record<string, string[]>) {
    super('Error de validación en los datos enviados', 400);
    this.errores = errores;
  }
}

export class UnauthorizedError extends AppError {
  constructor(mensaje = 'No autorizado. Token inválido o expirado') {
    super(mensaje, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(mensaje = 'No tiene permisos para realizar esta acción') {
    super(mensaje, 403);
  }
}

export class ConflictError extends AppError {
  constructor(mensaje: string) {
    super(mensaje, 409);
  }
}

// ─── Errores contables específicos ────────────────────────────────────────────

export class AsientoDesbalanceadoError extends AppError {
  constructor(debito: number, credito: number) {
    super(
      `Asiento desbalanceado: Débitos (${debito}) ≠ Créditos (${credito}). ` +
        `Diferencia: ${Math.abs(debito - credito)}`,
      400
    );
  }
}

export class PeriodoCerradoError extends AppError {
  constructor(periodo: string) {
    super(
      `No se puede registrar en el período "${periodo}" porque está cerrado`,
      400
    );
  }
}

export class CuentaNoPertmiteMovimientosError extends AppError {
  constructor(codigoCuenta: string) {
    super(
      `La cuenta "${codigoCuenta}" es una cuenta de agrupación y no acepta movimientos directos`,
      400
    );
  }
}
