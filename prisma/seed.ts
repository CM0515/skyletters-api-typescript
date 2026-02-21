import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main(): Promise<void> {
  const hash = await bcrypt.hash("Admin123!", SALT_ROUNDS);

  const permisos =
    "usuarios,roles,parametrizacion,asientos,reportes,impuestos,conciliacion";

  let rol = await prisma.rolesYPermisos.findFirst({
    where: { nombre: "Administrador" },
  });
  if (!rol) {
    rol = await prisma.rolesYPermisos.create({
      data: {
        nombre: "Administrador",
        listaPermisos: permisos,
        listaRol: "admin,Administrador",
        descripcion: "Rol con todos los permisos del sistema",
      },
    });
  } else {
    rol = await prisma.rolesYPermisos.update({
      where: { id: rol.id },
      data: { listaPermisos: permisos, listaRol: "admin,Administrador" },
    });
  }

  const usuario = await prisma.usuario.upsert({
    where: { correoUsuario: "admin@skyletters.com" },
    create: {
      nombreUsuario: "Admin",
      correoUsuario: "admin@skyletters.com",
      contrasenaUsuario: hash,
      rolUsuario: "Administrador",
      estadoUsuario: true,
      tipoUsuario: "admin",
    },
    update: {},
  });

  await prisma.usuarioAdmin.upsert({
    where: { idUsuario: usuario.id },
    create: {
      idUsuario: usuario.id,
      nivelConfidencialidad: "alto",
      permisosAdmin: permisos,
    },
    update: {},
  });

  console.log("Seed ejecutado:", { rolId: rol.id, usuarioId: usuario.id });
  console.log("Credenciales por defecto: admin@skyletters.com / Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
