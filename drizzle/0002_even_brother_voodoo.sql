CREATE TABLE `availability_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`colourway` text NOT NULL,
	`preferred_size` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`email`) REFERENCES `release_list`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `availability_variant_unique` ON `availability_requests` (`email`,`colourway`,`preferred_size`);