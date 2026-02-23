import { describe, it, expect } from "vitest";
import { hash, compare } from "bcryptjs";

describe("Password Hashing", () => {
  it("should hash a password", async () => {
    const password = "TestPassword123";
    const hashedPassword = await hash(password, 10);
    
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.length).toBeGreaterThan(20);
  });

  it("should verify correct password", async () => {
    const password = "TestPassword123";
    const hashedPassword = await hash(password, 10);
    const isValid = await compare(password, hashedPassword);
    
    expect(isValid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const password = "TestPassword123";
    const hashedPassword = await hash(password, 10);
    const isValid = await compare("WrongPassword", hashedPassword);
    
    expect(isValid).toBe(false);
  });

  it("should produce different hashes for same password", async () => {
    const password = "TestPassword123";
    const hash1 = await hash(password, 10);
    const hash2 = await hash(password, 10);
    
    expect(hash1).not.toBe(hash2);
    // But both should verify correctly
    expect(await compare(password, hash1)).toBe(true);
    expect(await compare(password, hash2)).toBe(true);
  });
});

describe("Authentication Flow", () => {
  it("should validate national ID format", () => {
    const validNationalIds = ["1234567890", "9876543210"];
    const invalidNationalIds = ["", "123", "abc"];
    
    validNationalIds.forEach(id => {
      expect(id.length).toBeGreaterThan(0);
      expect(/^\d+$/.test(id)).toBe(true);
    });
    
    invalidNationalIds.forEach(id => {
      expect(id.length === 0 || id.length < 10 || !/^\d+$/.test(id)).toBe(true);
    });
  });

  it("should validate user roles", () => {
    const validRoles = ["admin", "teacher", "student", "parent"];
    const invalidRoles = ["superadmin", "user", "guest"];
    
    validRoles.forEach(role => {
      expect(["admin", "teacher", "student", "parent"].includes(role)).toBe(true);
    });
    
    invalidRoles.forEach(role => {
      expect(["admin", "teacher", "student", "parent"].includes(role)).toBe(false);
    });
  });
});
