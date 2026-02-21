-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_usuario` VARCHAR(191) NOT NULL,
    `correo_usuario` VARCHAR(191) NOT NULL,
    `contrasena_usuario` VARCHAR(191) NOT NULL,
    `rol_usuario` VARCHAR(191) NOT NULL,
    `estado_usuario` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `tipo_usuario` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `usuarios_correo_usuario_key`(`correo_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios_admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `nivel_confidencialidad` VARCHAR(191) NOT NULL,
    `permisos_admin` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_admin_id_usuario_key`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios_cont` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `area_contable` VARCHAR(191) NOT NULL,
    `fecha_ingreso` DATETIME(3) NOT NULL,
    `estado_usuario_cont` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_cont_id_usuario_key`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios_aux` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `area_contable` VARCHAR(191) NOT NULL,
    `fecha_ingreso` DATETIME(3) NOT NULL,
    `tarjeta_usuario_aux` INTEGER NOT NULL,
    `estado_usuario_aux` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_aux_id_usuario_key`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sesiones_usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles_y_permisos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `lista_permisos` VARCHAR(191) NOT NULL,
    `lista_rol` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parametrizacion_sistema` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_empresa` VARCHAR(191) NOT NULL,
    `direccion_empresa` VARCHAR(191) NOT NULL,
    `telefono_empresa` VARCHAR(191) NOT NULL,
    `anio_inicial_empresa` INTEGER NOT NULL,
    `tipo_moneda` VARCHAR(191) NOT NULL,
    `email_empresa` VARCHAR(191) NOT NULL,
    `maneja_impuesto` BOOLEAN NOT NULL,
    `impuestos` INTEGER NOT NULL DEFAULT 0,
    `cuentas_contables` INTEGER NOT NULL DEFAULT 0,
    `documento_contable` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asientos_contables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_creacion_registro` DATETIME(3) NOT NULL,
    `numero_factura` INTEGER NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `usuario_creador` VARCHAR(191) NOT NULL,
    `fecha_modificacion` DATETIME(3) NOT NULL,
    `lista_movimi_contable` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reportes_financieros` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(191) NOT NULL,
    `formato` VARCHAR(191) NOT NULL,
    `movimiento_contable` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `periodo_inicio` DATETIME(3) NOT NULL,
    `periodo_fin` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `impuestos_delete` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `porcentaje` DOUBLE NOT NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_fin` DATETIME(3) NOT NULL,
    `base_imponible` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conciliacion_bancaria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cuenta_bancaria` VARCHAR(191) NOT NULL,
    `banco` VARCHAR(191) NOT NULL,
    `periodo_inicio` DATETIME(3) NOT NULL,
    `periodo_fin` DATETIME(3) NOT NULL,
    `movimientos_conciliados` INTEGER NOT NULL DEFAULT 0,
    `saldo_bancario` DOUBLE NOT NULL,
    `saldo_contable` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios_admin` ADD CONSTRAINT `usuarios_admin_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios_cont` ADD CONSTRAINT `usuarios_cont_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios_aux` ADD CONSTRAINT `usuarios_aux_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesiones_usuario` ADD CONSTRAINT `sesiones_usuario_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
