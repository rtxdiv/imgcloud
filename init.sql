CREATE TABLE `images` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `img_id` CHAR(16) NOT NULL,
    `ext` CHAR(5) NOT NULL,
    `path` CHAR(10) NOT NULL,
    `user_id` CHAR(36) NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_id` (`img_id`),
    INDEX `idx_user` (`user_id`)
);