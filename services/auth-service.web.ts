import * as Crypto from 'expo-crypto';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type StoredUser = AuthUser & {
  password_hash: string;
};

type AuthInput = {
  email: string;
  password: string;
};

type RegisterInput = AuthInput & {
  name: string;
};

const usersStorageKey = 'job_tracker_users';
const currentUserStorageKey = 'job_tracker_current_user_id';

let currentUser: AuthUser | null = null;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readUsers(): StoredUser[] {
  if (!canUseStorage()) {
    return [];
  }

  const storedUsers = window.localStorage.getItem(usersStorageKey);

  if (!storedUsers) {
    return [];
  }

  try {
    return JSON.parse(storedUsers) as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(usersStorageKey, JSON.stringify(users));
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(email: string, password: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${normalizeEmail(email)}:${password}`
  );
}

function toAuthUser(user: StoredUser): AuthUser {
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
  if (currentUser || !canUseStorage()) {
    return currentUser;
  }

  const currentUserId = Number(window.localStorage.getItem(currentUserStorageKey));
  const user = readUsers().find((storedUser) => storedUser.id === currentUserId);

  currentUser = user ? toAuthUser(user) : null;

  return currentUser;
}

export async function registerUser({ name, email, password }: RegisterInput) {
  const trimmedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (!trimmedName) {
    throw new Error('Name is required.');
  }

  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  validatePassword(password);

  const storedUsers = readUsers();

  if (storedUsers.some((user) => user.email === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(normalizedEmail, password);
  const storedUser: StoredUser = {
    id: Date.now(),
    name: trimmedName,
    email: normalizedEmail,
    password_hash: passwordHash,
  };

  writeUsers([...storedUsers, storedUser]);

  if (canUseStorage()) {
    window.localStorage.setItem(currentUserStorageKey, String(storedUser.id));
  }

  currentUser = toAuthUser(storedUser);

  return currentUser;
}

export async function loginUser({ email, password }: AuthInput) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  validatePassword(password);

  const user = readUsers().find((storedUser) => storedUser.email === normalizedEmail);

  if (!user) {
    throw new Error('No account found for this email.');
  }

  const passwordHash = await hashPassword(normalizedEmail, password);

  if (user.password_hash !== passwordHash) {
    throw new Error('Password is incorrect.');
  }

  if (canUseStorage()) {
    window.localStorage.setItem(currentUserStorageKey, String(user.id));
  }

  currentUser = toAuthUser(user);

  return currentUser;
}

export function logoutUser() {
  currentUser = null;

  if (canUseStorage()) {
    window.localStorage.removeItem(currentUserStorageKey);
  }
}

export function deleteProfile(userId: number) {
  writeUsers(readUsers().filter((user) => user.id !== userId));

  if (currentUser?.id === userId) {
    currentUser = null;
  }

  if (canUseStorage()) {
    window.localStorage.removeItem(currentUserStorageKey);
  }
}
