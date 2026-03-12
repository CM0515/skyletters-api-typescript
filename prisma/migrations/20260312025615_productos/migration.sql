-- CreateTable
CREATE TABLE `productos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_producto` VARCHAR(191) NOT NULL,
    `nombre_producto` VARCHAR(191) NOT NULL,
    `descripcion_producto` VARCHAR(191) NOT NULL,
    `precio_producto` DOUBLE NOT NULL,
    `cantidad_producto` INTEGER NOT NULL,
    `estado_producto` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
