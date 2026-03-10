import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, authUsers, passwordResetTokens, type AuthUser, type PasswordResetToken } from "../drizzle/schema";
import { ENV } from "./_core/env";
import crypto from "crypto";

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
      values.role = "admin";
      updateSet.role = "admin";
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

// ===== Custom Auth Functions =====

/**
 * Hash password using SHA-256
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Register new user with email and password
 */
export async function registerUser(
  email: string,
  password: string,
  phone?: string
): Promise<AuthUser | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const passwordHash = hashPassword(password);
    await db.insert(authUsers).values({
      email,
      passwordHash,
      phone,
      isVerified: false,
    });

    const result = await db
      .select()
      .from(authUsers)
      .where(eq(authUsers.email, email));
    return result[0] || null;
  } catch (error) {
    console.error("Register error:", error);
    return null;
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(authUsers)
    .where(eq(authUsers.email, email));

  const user = result[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return user;
}

/**
 * Generate password reset token and temporary password
 */
export async function generatePasswordReset(
  userId: number,
  phone: string
): Promise<{ token: string; tempPassword: string; expiresAt: Date } | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const token = crypto.randomBytes(32).toString("hex");
    const tempPassword = crypto.randomBytes(4).toString("hex").toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(passwordResetTokens).values({
      userId,
      token,
      tempPassword,
      expiresAt,
      used: false,
    });

    console.log(
      `[DEMO] SMS sent to ${phone}: Your temporary password is: ${tempPassword}`
    );

    return { token, tempPassword, expiresAt };
  } catch (error) {
    console.error("Password reset error:", error);
    return null;
  }
}

/**
 * Verify temporary password and set new password
 */
export async function verifyTempPasswordAndSetNew(
  userId: number,
  tempPassword: string,
  newPassword: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const tokens = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, userId));

    const validToken = tokens.find(
      (t: PasswordResetToken) =>
        t.tempPassword === tempPassword &&
        !t.used &&
        new Date(t.expiresAt) > new Date()
    );

    if (!validToken) {
      return false;
    }

    const passwordHash = hashPassword(newPassword);
    await db
      .update(authUsers)
      .set({ passwordHash })
      .where(eq(authUsers.id, userId));

    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, validToken.id));

    return true;
  } catch (error) {
    console.error("Verify temp password error:", error);
    return false;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(authUsers)
    .where(eq(authUsers.email, email));

  return result[0] || null;
}

/**
 * Update user phone number
 */
export async function updateUserPhone(
  userId: number,
  phone: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(authUsers)
      .set({ phone })
      .where(eq(authUsers.id, userId));
    return true;
  } catch (error) {
    console.error("Update phone error:", error);
    return false;
  }
}
