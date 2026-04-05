CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kioskId` varchar(64) NOT NULL,
	`visitDate` varchar(10) NOT NULL,
	`timeSlot` varchar(20) NOT NULL,
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'confirmed',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kiosk_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('create','delete') NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`payload` json NOT NULL,
	`message` text,
	`adminNote` text,
	`processedBy` int,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kiosk_requests_id` PRIMARY KEY(`id`)
);
