import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const waitlistTable = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWaitlistSchema = createInsertSchema(waitlistTable).omit({
  id: true,
  createdAt: true,
});

export const selectWaitlistSchema = createSelectSchema(waitlistTable);

export type InsertWaitlist = typeof waitlistTable.$inferInsert;
export type WaitlistEntry = typeof waitlistTable.$inferSelect;
