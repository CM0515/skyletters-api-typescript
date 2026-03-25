// src/modules/usuarios/usuarios.service.ts
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { UsuariosRepository } from './usuarios.repository';
import { CrearUsuarioDto, ActualizarUsuarioDto, CambiarPasswordDto } from './usuarios.schemas';
import { NotFoundError, ConflictError, UnauthorizedError } from '../../utils/AppError';
import { createModuleLogger } from '../../utils/logger';
import { env } from '../../config/env';

const log = createModuleLogger('usuarios-service');

export class UsuariosService {
  constructor(private readonly usuariosRepo: UsuariosRepository) {}

  async crear(dto: CrearUsuarioDto) {
    // Verificar email único
    const existente = await this.usuariosRepo.findByEmail(dto.email);
    if (existente) {
      throw new ConflictError(`Ya existe un usuario con el email "${dto.email}"`);
    }

    // Verificar que el rol existe
    const rol = await prisma.rol.findUnique({ where: { id: dto.rolId } });
    if (!rol) throw new NotFoundError('Rol', dto.rolId);

    const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);

    const usuario = await this.usuariosRepo.crear({
      nombre: dto.nombre,
      apellido: dto.apellido,
      email: dto.email,
      passwordHash,
      rolId: dto.rolId,
    });

    log.info('Usuario creado', { userId: usuario.id, email: usuario.email });
    return usuario;
  }

  async obtener(id: string) {
    const usuario = await this.usuariosRepo.findById(id);
    if (!usuario) throw new NotFoundError('Usuario', id);
    return usuario;
  }

  async listar() {
    return this.usuariosRepo.findAll();
  }

  async actualizar(id: string, dto: ActualizarUsuarioDto) {
    await this.obtener(id); // Verifica existencia

    if (dto.email) {
      const conMismoEmail = await this.usuariosRepo.findByEmail(dto.email);
      if (conMismoEmail && conMismoEmail.id !== id) {
        throw new ConflictError(`El email "${dto.email}" ya está en uso`);
      }
    }

    if (dto.rolId) {
      const rol = await prisma.rol.findUnique({ where: { id: dto.rolId } });
      if (!rol) throw new NotFoundError('Rol', dto.rolId);
    }

    const actualizado = await this.usuariosRepo.actualizar(id, dto);
    log.info('Usuario actualizado', { userId: id });
    return actualizado;
  }

  async cambiarPassword(id: string, dto: CambiarPasswordDto) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundError('Usuario', id);

    const valida = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
    if (!valida) throw new UnauthorizedError('Contraseña actual incorrecta');

    const nuevoHash = await bcrypt.hash(dto.passwordNuevo, env.BCRYPT_ROUNDS);
    await this.usuariosRepo.actualizarPassword(id, nuevoHash);

    log.info('Contraseña cambiada', { userId: id });
  }

  async desactivar(id: string, adminId: string) {
    if (id === adminId) {
      throw new ConflictError('No puede desactivar su propia cuenta');
    }
    await this.obtener(id);
    await this.usuariosRepo.actualizar(id, { activo: false });
    log.info('Usuario desactivado', { userId: id, adminId });
  }
}
