CREATE TABLE `kiosk_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` varchar(64) NOT NULL,
	`label` varchar(255),
	`kioskId` varchar(64),
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kiosk_devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `kiosk_devices_deviceId_unique` UNIQUE(`deviceId`)
);
--> statement-breakpoint
CREATE TABLE `kiosk_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(128) NOT NULL,
	`deviceId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`status` enum('active','used','expired') NOT NULL DEFAULT 'active',
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kiosk_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `kiosk_sessions_token_unique` UNIQUE(`token`)
);
