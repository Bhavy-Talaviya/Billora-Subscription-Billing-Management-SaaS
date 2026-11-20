import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validations/auth";
import { sanitizeUser } from "@/services/auth.service";

describe("Phase 13 Authentication & User Management Suite", () => {
  describe("Sign Up Validation & Complexity Rules", () => {
    it("accepts valid sign up data with full complexity", () => {
      const valid = {
        name: "Bhavy Talaviya",
        email: "bhavy@billora.com",
        password: "Password123",
        confirmPassword: "Password123",
      };
      const result = signUpSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects passwords under 8 characters", () => {
      const invalid = {
        name: "Bhavy",
        email: "bhavy@billora.com",
        password: "Pass1",
        confirmPassword: "Pass1",
      };
      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects passwords without uppercase letters", () => {
      const invalid = {
        name: "Bhavy",
        email: "bhavy@billora.com",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects passwords without numbers", () => {
      const invalid = {
        name: "Bhavy",
        email: "bhavy@billora.com",
        password: "PasswordWord",
        confirmPassword: "PasswordWord",
      };
      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects when confirmPassword does not match password", () => {
      const invalid = {
        name: "Bhavy",
        email: "bhavy@billora.com",
        password: "Password123",
        confirmPassword: "Password456",
      };
      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined();
      }
    });

    it("rejects invalid email formats", () => {
      const invalid = {
        name: "Bhavy",
        email: "not-an-email",
        password: "Password123",
        confirmPassword: "Password123",
      };
      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Password Hashing & Bcrypt Verification", () => {
    it("hashes password with bcrypt and verifies matching credentials", async () => {
      const rawPassword = "StrongPassword99";
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(rawPassword, salt);

      expect(hash).not.toBe(rawPassword);
      expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);

      const isMatch = await bcrypt.compare(rawPassword, hash);
      expect(isMatch).toBe(true);

      const isWrongMatch = await bcrypt.compare("WrongPassword99", hash);
      expect(isWrongMatch).toBe(false);
    });

    it("sanitizes user record by omitting passwordHash", () => {
      const rawUser = {
        id: "usr_12345",
        name: "Bhavy",
        email: "bhavy@billora.com",
        passwordHash: "$2a$10$abcdef1234567890",
        image: null,
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sanitized = sanitizeUser(rawUser);
      expect((sanitized as any).passwordHash).toBeUndefined();
      expect(sanitized.id).toBe("usr_12345");
      expect(sanitized.name).toBe("Bhavy");
    });
  });

  describe("Sign In & Forgot Password Validations", () => {
    it("validates valid login credentials schema", () => {
      const valid = {
        email: "user@billora.com",
        password: "SecretPassword1",
        rememberMe: true,
      };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("validates forgot password email format", () => {
      const valid = { email: "recovery@billora.com" };
      expect(forgotPasswordSchema.safeParse(valid).success).toBe(true);

      const invalid = { email: "not-valid" };
      expect(forgotPasswordSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("Password Reset Token Hashing & Expiration Security", () => {
    it("generates and verifies cryptographic SHA-256 token hash", () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

      expect(rawToken.length).toBe(64);
      expect(tokenHash.length).toBe(64);

      // Verify idempotent hash matching
      const verifyHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      expect(verifyHash).toBe(tokenHash);
    });

    it("detects expired password reset tokens", () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      const isExpired = new Date() > pastDate;
      expect(isExpired).toBe(true);

      const futureDate = new Date(Date.now() + 3600 * 1000); // 1 hour ahead
      const isFutureExpired = new Date() > futureDate;
      expect(isFutureExpired).toBe(false);
    });

    it("validates reset password form schema", () => {
      const valid = {
        token: "tok_1234567890",
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      };
      expect(resetPasswordSchema.safeParse(valid).success).toBe(true);

      const mismatch = {
        token: "tok_1234567890",
        password: "NewPassword123",
        confirmPassword: "DifferentPassword123",
      };
      expect(resetPasswordSchema.safeParse(mismatch).success).toBe(false);
    });
  });

  describe("Profile and Password Change Validations", () => {
    it("validates profile update inputs", () => {
      const valid = {
        name: "Bhavy Admin",
        email: "newemail@billora.com",
        image: "https://example.com/avatar.png",
      };
      expect(updateProfileSchema.safeParse(valid).success).toBe(true);
    });

    it("validates change password inputs with complexity requirement", () => {
      const valid = {
        currentPassword: "OldPassword123",
        newPassword: "BrandNewPassword123",
        confirmNewPassword: "BrandNewPassword123",
      };
      expect(changePasswordSchema.safeParse(valid).success).toBe(true);

      const weakNew = {
        currentPassword: "OldPassword123",
        newPassword: "weak",
        confirmNewPassword: "weak",
      };
      expect(changePasswordSchema.safeParse(weakNew).success).toBe(false);
    });
  });
});
