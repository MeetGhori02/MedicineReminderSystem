-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicines` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `dosage` VARCHAR(100) NOT NULL,
    `date` DATE NOT NULL,
    `time` VARCHAR(10) NOT NULL,
    `frequency` ENUM('ONCE', 'DAILY', 'WEEKLY') NOT NULL DEFAULT 'DAILY',
    `beforeAfterFood` ENUM('BEFORE', 'AFTER', 'WITH') NOT NULL DEFAULT 'AFTER',
    `mealTimings` TEXT NULL,
    `notes` TEXT NULL,
    `reminderEnabled` BOOLEAN NOT NULL DEFAULT true,
    `taken` BOOLEAN NOT NULL DEFAULT false,
    `takenAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `medicines_userId_idx`(`userId`),
    INDEX `medicines_userId_date_idx`(`userId`, `date`),
    INDEX `medicines_reminderEnabled_taken_idx`(`reminderEnabled`, `taken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `medicines` ADD CONSTRAINT `medicines_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
