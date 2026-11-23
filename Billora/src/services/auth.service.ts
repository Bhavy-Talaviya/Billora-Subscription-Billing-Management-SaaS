import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  SignUpInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/lib/validations/auth";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sanitizes user record by omitting sensitive password hash
 */
export function sanitizeUser(user: any): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe as SafeUser;
}

/**
 * Registers a new user with bcrypt password hashing
 */
export async function registerUser(input: SignUpInput): Promise<SafeUser> {
  const emailNormalized = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: emailNormalized },
  });

  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(input.password, salt);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: emailNormalized,
      passwordHash,
      role: "USER",
    },
  });

  return sanitizeUser(user);
}

/**
 * Fetches user by ID without password hash
 */
export async function getUserById(id: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) return null;
  return sanitizeUser(user);
}

/**
 * Updates user profile information
 */
export async function updateUserProfile(
  id: string,
  input: UpdateProfileInput
): Promise<SafeUser> {
  const emailNormalized = input.email.trim().toLowerCase();

  // If email is changing, ensure no conflict
  const existing = await prisma.user.findUnique({
    where: { email: emailNormalized },
  });

  if (existing && existing.id !== id) {
    throw new Error("This email is already in use by another account.");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: input.name.trim(),
      email: emailNormalized,
      image: input.image || null,
    },
  });

  return sanitizeUser(updated);
}

/**
 * Changes a user password after verifying current password
 */
export async function changeUserPassword(
  id: string,
  input: ChangePasswordInput
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!matches) {
    throw new Error("Incorrect current password.");
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(input.newPassword, salt);

  await prisma.user.update({
    where: { id },
    data: {
      passwordHash: newHash,
    },
  });

  return true;
}

export function getAppBaseUrl(): string {
  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
  ) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://billora-subscription-billing-manage.vercel.app";
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Generates single-use password reset token with 1 hour expiration
 */
export async function createPasswordResetToken(
  email: string
): Promise<{ rawToken: string | null; resetUrl?: string }> {
  const emailNormalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: emailNormalized },
  });

  // Never reveal whether an email exists to the public caller
  if (!user) {
    return { rawToken: null };
  }

  // Generate cryptographically secure token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate any prior unused reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
  });

  // Store hashed token
  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  const baseUrl = getAppBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  return { rawToken, resetUrl };
}

/**
 * Validates reset token and updates password
 */
export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string
): Promise<boolean> {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetRecord) {
    throw new Error("Invalid or expired password reset link.");
  }

  if (resetRecord.usedAt) {
    throw new Error("This password reset link has already been used.");
  }

  if (new Date() > resetRecord.expiresAt) {
    throw new Error("This password reset link has expired. Please request a new one.");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // Atomic transaction: update password & mark token used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return true;
}
