/*
  Warnings:

  - You are about to drop the `impuestos_delete` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `impuestos_delete`;

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
