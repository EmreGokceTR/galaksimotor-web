-- CreateTable
CREATE TABLE `MotorcycleListing` (
    `id` VARCHAR(191) NOT NULL,
    `marka` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `yil` INTEGER NOT NULL,
    `cc` INTEGER NULL,
    `fiyat` DECIMAL(10, 2) NOT NULL,
    `stokDurumu` BOOLEAN NOT NULL DEFAULT true,
    `gorsel` VARCHAR(191) NULL,
    `aciklama` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MotorcycleListing_marka_idx`(`marka`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
