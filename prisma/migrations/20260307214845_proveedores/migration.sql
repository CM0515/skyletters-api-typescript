-- CreateTable
CREATE TABLE `proveedores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_proveedor` VARCHAR(191) NOT NULL,
    `razon_social` VARCHAR(191) NOT NULL,
    `nit_proveedor` VARCHAR(191) NOT NULL,
    `correo_proveedor` VARCHAR(191) NOT NULL,
    `direccion_proveedor` VARCHAR(191) NOT NULL,
    `telefono_proveedor` VARCHAR(191) NOT NULL,
    `ciudad_proveedor` VARCHAR(191) NOT NULL,
    `estado_proveedor` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
