CREATE TABLE `health_readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kioskId` varchar(64) NOT NULL,
	`bloodPressureSystolic` int,
	`bloodPressureDiastolic` int,
	`heartRate` int,
	`weight` decimal(5,1),
	`height` decimal(5,1),
	`bmi` decimal(4,1),
	`temperature` decimal(4,1),
	`notes` text,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_readings_id` PRIMARY KEY(`id`)
);
