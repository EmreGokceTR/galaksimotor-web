-- AlterTable
ALTER TABLE `Order` ADD COLUMN `invoiceAddress` TEXT NULL,
    ADD COLUMN `invoiceFullName` VARCHAR(191) NULL,
    ADD COLUMN `invoicePdfUrl` VARCHAR(191) NULL,
    ADD COLUMN `invoiceTcNo` VARCHAR(191) NULL,
    ADD COLUMN `iyzicoConversationId` VARCHAR(191) NULL;
