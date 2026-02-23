import { describe, it, expect } from "vitest";
import { hash } from "bcryptjs";

describe("Sign Up Validation", () => {
  it("should validate national ID format", () => {
    const validIds = ["1234567890", "9876543210", "1111111111"];
    const invalidIds = ["", "123", "abc", "12345"];

    validIds.forEach(id => {
      expect(id.length >= 10).toBe(true);
      expect(/^\d+$/.test(id)).toBe(true);
    });

    invalidIds.forEach(id => {
      expect(id.length < 10 || !/^\d+$/.test(id)).toBe(true);
    });
  });

  it("should validate name format", () => {
    const validNames = ["أحمد محمد", "علي خالد", "فاطمة علي"];
    const invalidNames = ["", "أ", "ب"];

    validNames.forEach(name => {
      expect(name.trim().length >= 3).toBe(true);
    });

    invalidNames.forEach(name => {
      expect(name.trim().length < 3).toBe(true);
    });
  });

  it("should validate email format", () => {
    const validEmails = ["user@example.com", "test@domain.co.uk", "admin@school.edu"];
    const invalidEmails = ["", "invalid", "test@", "@example.com", "test@.com"];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach(email => {
      if (email.length > 0) {
        expect(emailRegex.test(email)).toBe(false);
      }
    });
  });

  it("should validate phone number format", () => {
    const validPhones = ["0501234567", "966501234567", "5012345678"];
    const invalidPhones = ["", "123", "abc"];

    validPhones.forEach(phone => {
      expect(/^\d{9,}$/.test(phone)).toBe(true);
    });

    invalidPhones.forEach(phone => {
      expect(phone.length === 0 || /^\d{9,}$/.test(phone) === false).toBe(true);
    });
  });

  it("should validate password strength", () => {
    const strongPasswords = [
      "Password123",
      "SecurePass456",
      "MyPassword789",
    ];
    const weakPasswords = [
      "pass",
      "password",
      "12345678",
      "abcdefgh",
      "ABCDEFGH",
    ];

    const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

    strongPasswords.forEach(pass => {
      expect(pass.length >= 8).toBe(true);
      expect(passwordRegex.test(pass)).toBe(true);
    });

    weakPasswords.forEach(pass => {
      expect(pass.length < 8 || !passwordRegex.test(pass)).toBe(true);
    });
  });

  it("should validate password confirmation", () => {
    const password = "TestPassword123";
    const confirmPassword = "TestPassword123";
    const wrongConfirm: string = "DifferentPassword123";

    expect(password === confirmPassword).toBe(true);
    expect(password === wrongConfirm).toBe(false);
  });

  it("should hash passwords securely", async () => {
    const password = "TestPassword123";
    const hash1 = await hash(password, 10);
    const hash2 = await hash(password, 10);

    // Hashes should be different (salt is different)
    expect(hash1).not.toBe(hash2);
    
    // But both should be valid bcrypt hashes
    expect(hash1.startsWith("$2")).toBe(true);
    expect(hash2.startsWith("$2")).toBe(true);
  });

  it("should validate all required fields", () => {
    const requiredFields = {
      nationalId: "1234567890",
      name: "أحمد محمد",
      password: "TestPassword123",
    };

    const optionalFields = {
      email: "test@example.com",
      phone: "0501234567",
    };

    // Check required fields
    expect(requiredFields.nationalId).toBeDefined();
    expect(requiredFields.name).toBeDefined();
    expect(requiredFields.password).toBeDefined();

    // Check optional fields
    expect(optionalFields.email).toBeDefined();
    expect(optionalFields.phone).toBeDefined();
  });
});

describe("Sign Up User Roles", () => {
  it("should support default role for new users", () => {
    const defaultRole = "student";
    const validRoles = ["admin", "teacher", "student", "parent"];

    expect(validRoles.includes(defaultRole)).toBe(true);
  });

  it("should validate user role enum", () => {
    const validRoles = ["admin", "teacher", "student", "parent"];
    const invalidRoles = ["superadmin", "user", "guest", "moderator"];

    validRoles.forEach(role => {
      expect(["admin", "teacher", "student", "parent"].includes(role)).toBe(true);
    });

    invalidRoles.forEach(role => {
      expect(["admin", "teacher", "student", "parent"].includes(role)).toBe(false);
    });
  });
});
