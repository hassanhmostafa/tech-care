import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  /**
   * User role:
   * - user: regular user
   * - kiosk_owner: manages one or more kiosks
   * - expert: health specialist who can chat with users
   * - admin: administrative user (see adminType for sub-role)
   */
  role: mysqlEnum("role", ["user", "kiosk_owner", "expert", "admin"]).default("user").notNull(),
  /**
   * Admin sub-role (only meaningful when role = admin):
   * - kiosk: manages kiosk creation/deletion requests
   * - expert: manages expert registration requests
   * - super: full access to all admin functions
   */
  adminType: mysqlEnum("adminType", ["kiosk", "expert", "super"]),
  /**
   * For expert users: their medical/health specialty.
   * e.g. "Nutritionist", "Cardiologist", "General Practitioner"
   */
  specialty: varchar("specialty", { length: 128 }),
  /**
   * For expert users: a short professional bio shown on the experts listing page.
   */
  bio: text("bio"),
  /** User's gender, chosen during profile setup. Used for BMI calculations. */
  gender: mysqlEnum("gender", ["male", "female"]),
  /** User's date of birth (stored as a date string YYYY-MM-DD). Used to compute age for BMI. */
  birthDate: varchar("birthDate", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Kiosk locations table.
 * Each row represents one physical health screening station.
 */
export const kiosks = mysqlTable("kiosks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  image: text("image"),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  hours: json("hours").$type<{ day: string; open: string; close: string }[]>(),
  services: json("services").$type<string[]>(),
  ownerId: int("ownerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KioskRecord = typeof kiosks.$inferSelect;
export type InsertKiosk = typeof kiosks.$inferInsert;

/**
 * Health readings table.
 */
export const healthReadings = mysqlTable("health_readings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  kioskId: varchar("kioskId", { length: 64 }).notNull(),
  bloodPressureSystolic: int("bloodPressureSystolic"),
  bloodPressureDiastolic: int("bloodPressureDiastolic"),
  heartRate: int("heartRate"),
  weight: decimal("weight", { precision: 5, scale: 1 }),
  height: decimal("height", { precision: 5, scale: 1 }),
  bmi: decimal("bmi", { precision: 4, scale: 1 }),
  temperature: decimal("temperature", { precision: 4, scale: 1 }),
  notes: text("notes"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthReading = typeof healthReadings.$inferSelect;
export type InsertHealthReading = typeof healthReadings.$inferInsert;

/**
 * AI-generated health and diet plans.
 */
export const aiPlans = mysqlTable("ai_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planType: mysqlEnum("planType", ["health", "diet", "combined"]).notNull(),
  content: text("content").notNull(),
  metricsSnapshot: json("metricsSnapshot").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiPlan = typeof aiPlans.$inferSelect;
export type InsertAiPlan = typeof aiPlans.$inferInsert;

/**
 * Kiosk requests table.
 */
export const kioskRequests = mysqlTable("kiosk_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["create", "delete"]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  payload: json("payload").$type<Record<string, unknown>>().notNull(),
  message: text("message"),
  adminNote: text("adminNote"),
  processedBy: int("processedBy"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KioskRequest = typeof kioskRequests.$inferSelect;
export type InsertKioskRequest = typeof kioskRequests.$inferInsert;

/**
 * Kiosk visit bookings table.
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  kioskId: varchar("kioskId", { length: 64 }).notNull(),
  visitDate: varchar("visitDate", { length: 10 }).notNull(),
  timeSlot: varchar("timeSlot", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("confirmed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Expert registration requests table.
 * Users submit requests to become health experts on the platform.
 * Expert admins and super admins review and approve/reject these.
 */
export const expertRequests = mysqlTable("expert_requests", {
  id: int("id").autoincrement().primaryKey(),
  /** The user applying to become an expert */
  userId: int("userId").notNull(),
  /** Medical/health specialty e.g. "Nutritionist", "Cardiologist" */
  specialty: varchar("specialty", { length: 128 }).notNull(),
  /** Professional credentials e.g. "MD, King Abdulaziz University" */
  credentials: varchar("credentials", { length: 512 }).notNull(),
  /** Short professional bio */
  bio: text("bio").notNull(),
  /** Request status */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  /** Admin's note when approving or rejecting */
  adminNote: text("adminNote"),
  /** Admin who processed the request */
  processedBy: int("processedBy"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpertRequest = typeof expertRequests.$inferSelect;
export type InsertExpertRequest = typeof expertRequests.$inferInsert;

/**
 * Conversations table.
 * Each row represents a chat thread between one user and one expert.
 * One conversation per user–expert pair (unique constraint enforced in app logic).
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  /** The regular user in the conversation */
  userId: int("userId").notNull(),
  /** The expert user in the conversation */
  expertId: int("expertId").notNull(),
  /** Timestamp of the last message (for sorting inbox) */
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table.
 * Individual messages within a conversation thread.
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  /** The user who sent this message (could be the user or the expert) */
  senderId: int("senderId").notNull(),
  /** Message text content */
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
