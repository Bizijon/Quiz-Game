-- CreateTable
CREATE TABLE `quiz` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(255) NOT NULL,
    `answer` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `keywords` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `keywords_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_KeywordToLOLQuiz` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_KeywordToLOLQuiz_AB_unique`(`A`, `B`),
    INDEX `_KeywordToLOLQuiz_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_KeywordToLOLQuiz` ADD CONSTRAINT `_KeywordToLOLQuiz_A_fkey` FOREIGN KEY (`A`) REFERENCES `keywords`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_KeywordToLOLQuiz` ADD CONSTRAINT `_KeywordToLOLQuiz_B_fkey` FOREIGN KEY (`B`) REFERENCES `quiz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
