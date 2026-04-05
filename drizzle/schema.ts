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
  role: mysqlEnum("role", ["user", "kiosk_owner", "admin"]).default("user").notNull(),
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
 * To switch from test data to real data, simply replace the seed data
 * or update rows via the admin dashboard.
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
  /**
   * JSON column storing operating hours array:
   * [{ day: string, open: string, close: string }]
   */
  hours: json("hours").$type<{ day: string; open: string; close: string }[]>(),
  /**
   * JSON column storing list of services offered:
   * ["Blood Pressure", "Weight & BMI", ...]
   */
  services: json("services").$type<string[]>(),
  /**
   * Optional FK to the user who owns/manages this kiosk.
   * Set by admin. The owner can edit this kiosk but cannot create or delete kiosks.
   */
  ownerId: int("ownerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KioskRecord = typeof kiosks.$inferSelect;
export type InsertKiosk = typeof kiosks.$inferInsert;

/**
 * Health readings table.
 * Stores individual screening results logged by users at a kiosk.
 * Each row links a user to a kiosk and records the metric values measured.
 */
export const healthReadings = mysqlTable("health_readings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  kioskId: varchar("kioskId", { length: 64 }).notNull(),
  /** Systolic blood pressure in mmHg */
  bloodPressureSystolic: int("bloodPressureSystolic"),
  /** Diastolic blood pressure in mmHg */
  bloodPressureDiastolic: int("bloodPressureDiastolic"),
  /** Heart rate in bpm */
  heartRate: int("heartRate"),
  /** Weight in kg */
  weight: decimal("weight", { precision: 5, scale: 1 }),
  /** Height in cm */
  height: decimal("height", { precision: 5, scale: 1 }),
  /** Body Mass Index */
  bmi: decimal("bmi", { precision: 4, scale: 1 }),
  /** Body temperature in Celsius */
  temperature: decimal("temperature", { precision: 4, scale: 1 }),
  /** Optional free-text notes */
  notes: text("notes"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthReading = typeof healthReadings.$inferSelect;
export type InsertHealthReading = typeof healthReadings.$inferInsert;

/**
 * AI-generated health and diet plans.
 * Each row stores a plan generated for a user based on their health metrics.
 */
export const aiPlans = mysqlTable("ai_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Type of plan: 'health', 'diet', or 'combined' */
  planType: mysqlEnum("planType", ["health", "diet", "combined"]).notNull(),
  /** The full AI-generated plan content in Markdown */
  content: text("content").notNull(),
  /** Snapshot of key metrics used to generate this plan */
  metricsSnapshot: json("metricsSnapshot").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiPlan = typeof aiPlans.$inferSelect;
export type InsertAiPlan = typeof aiPlans.$inferInsert;

/**
 * Kiosk requests table.
 * Users can submit requests to create a new kiosk or request deletion of an existing one.
 * Admins review and approve/reject these requests.
 */
export const kioskRequests = mysqlTable("kiosk_requests", {
  id: int("id").autoincrement().primaryKey(),
  /** The user who submitted the request */
  userId: int("userId").notNull(),
  /** Type of request */
  type: mysqlEnum("type", ["create", "delete"]).notNull(),
  /** Current status of the request */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  /**
   * For 'create' requests: proposed kiosk details as JSON.
   * For 'delete' requests: the kioskId to delete.
   */
  payload: json("payload").$type<Record<string, unknown>>().notNull(),
  /** Optional message from the requester explaining the request */
  message: text("message"),
  /** Admin's response note when approving or rejecting */
  adminNote: text("adminNote"),
  /** Admin who processed the request */
  processedBy: int("processedBy"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KioskRequest = typeof kioskRequests.$inferSelect;
export type InsertKioskRequest = typeof kioskRequests.$inferInsert;

/**
 * Kiosk visit bookings table.
 * Users can book a time slot at a kiosk for a health screening visit.
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  kioskId: varchar("kioskId", { length: 64 }).notNull(),
  /** Date of the visit in YYYY-MM-DD format */
  visitDate: varchar("visitDate", { length: 10 }).notNull(),
  /** Time slot string e.g. "10:00 AM" */
  timeSlot: varchar("timeSlot", { length: 20 }).notNull(),
  /** Booking status */
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("confirmed").notNull(),
  /** Optional notes from the user (e.g. specific services needed) */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
