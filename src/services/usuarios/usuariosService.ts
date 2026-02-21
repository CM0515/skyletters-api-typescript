import bcrypt from "bcryptjs";
import { usuariosRepository } from "../../repositories/usuariosRepository";
import { prisma } from "../../config/database";
import { AppError } from "../../utils/AppError";
import type { Usuario } from "@prisma/client";

const SALT_ROUNDS = 10;

export interface CreateUsuarioBase {
  nombreUsuario: string;
  correoUsuario: string;
  contrasenaUsuario: string;
  rolUsuario: string;
  estadoUsuario?: boolean;
}

export interface CreateUsuarioAdminInput extends CreateUsuarioBase {
  tipoUsuario: "admin";
  nivelConfidencialidad: string;
  permisosAdmin: string;
}

export interface CreateUsuarioContInput extends CreateUsuarioBase {
  tipoUsuario: "cont";
  areaContable: string;
  fechaIngreso: Date;
  estadoUsuarioCont?: boolean;
}

export interface CreateUsuarioAuxInput extends CreateUsuarioBase {
  tipoUsuario: "aux";
  areaContable: string;
  fechaIngreso: Date;
  tarjetaUsuarioAux: number;
  estadoUsuarioAux?: boolean;
}

export type CreateUsuarioInput = CreateUsuarioAdminInput | CreateUsuarioContInput | CreateUsuarioAuxInput;

export const usuariosService = {
  async getAll(): Promise<Omit<Usuario, "contrasenaUsuario">[]> {
    const list = await usuariosRepository.findAll();
    return list.map(({ contrasenaUsuario: _, ...u }) => u);
  },

  async getById(id: number): Promise<Omit<Usuario, "contrasenaUsuario"> | null> {
    const u = await usuariosRepository.findById(id);
    if (!u) return null;
    const { contrasenaUsuario: _, ...safe } = u;
    return safe;
  },

  async create(input: CreateUsuarioInput): Promise<Omit<Usuario, "contrasenaUsuario">> {
    const existing = await usuariosRepository.findByEmail(input.correoUsuario);
    if (existing) throw AppError.conflict("El correo ya está registrado");
    const hash = await bcrypt.hash(input.contrasenaUsuario, SALT_ROUNDS);
    const usuario = await prisma.$transaction(async (tx) => {
      const u = await tx.usuario.create({
        data: {
          nombreUsuario: input.nombreUsuario,
          correoUsuario: input.correoUsuario,
          contrasenaUsuario: hash,
          rolUsuario: input.rolUsuario,
          estadoUsuario: input.estadoUsuario ?? true,
          tipoUsuario: input.tipoUsuario,
        },
      });
      if (input.tipoUsuario === "admin" && "nivelConfidencialidad" in input) {
        await tx.usuarioAdmin.create({
          data: {
            idUsuario: u.id,
            nivelConfidencialidad: input.nivelConfidencialidad,
            permisosAdmin: input.permisosAdmin,
          },
        });
      }
      if (input.tipoUsuario === "cont" && "areaContable" in input) {
        await tx.usuarioCont.create({
          data: {
            idUsuario: u.id,
            areaContable: input.areaContable,
            fechaIngreso: input.fechaIngreso,
            estadoUsuarioCont: input.estadoUsuarioCont ?? true,
          },
        });
      }
      if (input.tipoUsuario === "aux" && "tarjetaUsuarioAux" in input) {
        await tx.usuarioAux.create({
          data: {
            idUsuario: u.id,
            areaContable: input.areaContable,
            fechaIngreso: input.fechaIngreso,
            tarjetaUsuarioAux: input.tarjetaUsuarioAux,
            estadoUsuarioAux: input.estadoUsuarioAux ?? true,
          },
        });
      }
      return u;
    });
    const { contrasenaUsuario: _, ...safe } = usuario;
    return safe;
  },

  async update(
    id: number,
    data: Partial<{
      nombreUsuario: string;
      correoUsuario: string;
      contrasenaUsuario: string;
      rolUsuario: string;
      estadoUsuario: boolean;
    }>
  ): Promise<Omit<Usuario, "contrasenaUsuario">> {
    const u = await usuariosRepository.findById(id);
    if (!u) throw AppError.notFound("Usuario no encontrado");
    if (data.correoUsuario && data.correoUsuario !== u.correoUsuario) {
      const existing = await usuariosRepository.findByEmail(data.correoUsuario);
      if (existing) throw AppError.conflict("El correo ya está en uso");
    }
    const updateData = { ...data };
    if (data.contrasenaUsuario) {
      updateData.contrasenaUsuario = await bcrypt.hash(data.contrasenaUsuario, SALT_ROUNDS);
    }
    const updated = await usuariosRepository.update(id, updateData);
    const { contrasenaUsuario: _, ...safe } = updated;
    return safe;
  },

  async delete(id: number): Promise<void> {
    const u = await usuariosRepository.findById(id);
    if (!u) throw AppError.notFound("Usuario no encontrado");
    await usuariosRepository.delete(id);
  },
};
