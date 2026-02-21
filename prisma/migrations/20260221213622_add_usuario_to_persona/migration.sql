/*
  Warnings:

  - A unique constraint covering the columns `[id_usuario]` on the table `personas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_usuario` to the `personas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `personas` ADD COLUMN `id_usuario` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `personas_id_usuario_key` ON `personas`(`id_usuario`);

-- AddForeignKey
ALTER TABLE `personas` ADD CONSTRAINT `personas_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
