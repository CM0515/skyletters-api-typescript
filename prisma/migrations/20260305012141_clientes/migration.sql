-- CreateTable
CREATE TABLE `clientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_cliente` VARCHAR(191) NOT NULL,
    `razon_social` VARCHAR(191) NOT NULL,
    `nit_cliente` VARCHAR(191) NOT NULL,
    `correo_cliente` VARCHAR(191) NOT NULL,
    `direccion_cliente` VARCHAR(191) NOT NULL,
    `telefono_cliente` VARCHAR(191) NOT NULL,
    `ciudad_cliente` VARCHAR(191) NOT NULL,
    `estado_cliente` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
