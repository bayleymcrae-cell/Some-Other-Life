import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const releaseList = sqliteTable("release_list", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  colourway: text("colourway").notNull(),
  preferredSize: text("preferred_size").notNull(),
  consentVersion: text("consent_version").notNull(),
  createdAt: text("created_at").notNull(),
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
});

export const releaseLimits = sqliteTable("release_limits", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull().default(1),
  expiresAt: integer("expires_at").notNull(),
});

export const privacyRequests = sqliteTable("privacy_requests", {
  email: text("email").primaryKey(),
  createdAt: text("created_at").notNull(),
});
