CREATE TABLE `ingestion_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ingested_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `makes` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vehicle_types` (
	`id` integer NOT NULL,
	`make_id` integer NOT NULL,
	`name` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`id`, `make_id`),
	FOREIGN KEY (`make_id`) REFERENCES `makes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `vehicle_types_make_id_idx` ON `vehicle_types` (`make_id`);