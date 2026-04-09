import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/db/client';
import { initializeDatabase } from '@/db/init';
import { settings, users } from '@/db/schema';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type AuthInput = {
  email: string;
  password: string;
};

type RegisterInput = AuthInput & {
  name: string;
};

let currentUser: AuthUser | null = null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(email: string, password: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${normalizeEmail(email)}:${password}`
  );
}

function toAuthUser(user: typeof users.$inferSelect): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function validatePassword(password: string) {
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
}

export function getCurrentUser() {
  return currentUser;
}

export async function registerUser({ name, email, password }: RegisterInput) {
  initializeDatabase();

  const trimmedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (!trimmedName) {
    throw new Error('Name is required.');
  }

  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  validatePassword(password);

  const existingUser = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .get();

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(normalizedEmail, password);

  const createdUser = db
    .insert(users)
    .values({
      name: trimmedName,
      email: normalizedEmail,
      password_hash: passwordHash,
    })
    .returning()
    .get();

  db.insert(settings)
    .values({
      user_id: createdUser.id,
      theme_preference: 'system',
    })
    .run();

  currentUser = toAuthUser(createdUser);

  return currentUser;
}

export async function loginUser({ email, password }: AuthInput) {
  initializeDatabase();

  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  validatePassword(password);

  const user = db.select().from(users).where(eq(users.email, normalizedEmail)).get();

  if (!user) {
    throw new Error('No account found for this email.');
  }

  const passwordHash = await hashPassword(normalizedEmail, password);

  if (user.password_hash !== passwordHash) {
    throw new Error('Password is incorrect.');
  }

  currentUser = toAuthUser(user);

  return currentUser;
}

export function logoutUser() {
  currentUser = null;
}

export function deleteProfile(userId: number) {
  initializeDatabase();

  db.delete(users).where(eq(users.id, userId)).run();

  if (currentUser?.id === userId) {
    currentUser = null;
  }
}
