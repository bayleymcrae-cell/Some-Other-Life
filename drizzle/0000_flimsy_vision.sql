CREATE TABLE `release_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 1 NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `release_list` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`colourway` text NOT NULL,
	`preferred_size` text NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` text NOT NULL,
	`unsubscribe_token` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `release_list_email_unique` ON `release_list` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `release_list_unsubscribe_token_unique` ON `release_list` (`unsubscribe_token`);