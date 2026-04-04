CREATE TABLE `kiosks` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`phone` varchar(32),
	`email` varchar(320),
	`image` text,
	`rating` decimal(3,1),
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`hours` json,
	`services` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kiosks_id` PRIMARY KEY(`id`)
);
