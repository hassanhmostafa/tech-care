import { eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, kiosks, InsertKiosk } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─────────────────────────────────────────────
// Kiosk helpers
// ─────────────────────────────────────────────

/**
 * Retrieve all active kiosks from the database.
 * Returns an empty array if the database is unavailable.
 */
export async function getAllKiosks() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get kiosks: database not available");
    return [];
  }
  return db.select().from(kiosks).where(eq(kiosks.isActive, "true"));
}

/**
 * Retrieve a single kiosk by its ID.
 */
export async function getKioskById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(kiosks).where(eq(kiosks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Search kiosks by name, location, or address.
 */
export async function searchKiosks(query: string) {
  const db = await getDb();
  if (!db) return [];
  const pattern = `%${query}%`;
  return db
    .select()
    .from(kiosks)
    .where(
      or(
        like(kiosks.name, pattern),
        like(kiosks.location, pattern),
        like(kiosks.address, pattern)
      )
    );
}

/**
 * Seed the database with the provided kiosk data.
 * Uses onDuplicateKeyUpdate so existing rows are not overwritten with blank data.
 * Safe to call multiple times — only updates the timestamp if the row already exists.
 */
export async function seedKiosks(data: InsertKiosk[]) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed kiosks: database not available");
    return;
  }
  for (const kiosk of data) {
    await db
      .insert(kiosks)
      .values(kiosk)
      .onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  }
  console.log(`[Database] Seeded ${data.length} kiosks`);
}
