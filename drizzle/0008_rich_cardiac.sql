ALTER TABLE `messages` MODIFY COLUMN `content` text NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `messages` ADD `fileUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `messages` ADD `fileName` varchar(255);