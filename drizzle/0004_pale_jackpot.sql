CREATE TABLE `ai_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planType` enum('health','diet','combined') NOT NULL,
	`content` text NOT NULL,
	`metricsSnapshot` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_plans_id` PRIMARY KEY(`id`)
);
