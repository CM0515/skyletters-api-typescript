-- CreateTable
CREATE TABLE `facturas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_factura` INTEGER NOT NULL,
    `id_persona` INTEGER NOT NULL,
    `fecha_factura` DATETIME(3) NOT NULL,
    `detalle_producto` VARCHAR(191) NOT NULL,
    `subtotal_factura` DOUBLE NOT NULL,
    `impuesto_factura` DOUBLE NOT NULL,
    `total_factura` DOUBLE NOT NULL,
    `forma_pago` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `facturas` ADD CONSTRAINT `facturas_id_persona_fkey` FOREIGN KEY (`id_persona`) REFERENCES `personas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
