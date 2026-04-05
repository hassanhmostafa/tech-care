ALTER TABLE `users` MODIFY COLUMN `role` enum('user','kiosk_owner','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `kiosks` ADD `ownerId` int;