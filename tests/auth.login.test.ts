import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "../server/db";
import { hash, compare } from "bcryptjs";

describe("Authentication System", () => {
  const testNationalId = "1234567890";
  const testPassword = "TestPassword123";
  let testUserId: number;

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await hash(testPassword, 10);
    testUserId = await db.createUser({
      nationalId: testNationalId,
      password: hashedPassword,
      name: "Test User",
      email: "test@example.com",
      phone: "0501234567",
      role: "student",
    });
  });

  afterAll(async () => {
    // Clean up test user
    if (testUserId) {
      // Note: You may need to implement a delete function in db.ts
      // For now, we'll just verify the user was created
    }
  });

  it("should create a user with hashed password", async () => {
    const user = await db.getUserById(testUserId);
    expect(user).toBeDefined();
    expect(user?.nationalId).toBe(testNationalId);
    expect(user?.name).toBe("Test User");
    expect(user?.role).toBe("student");
  });

  it("should retrieve user by national ID", async () => {
    const user = await db.getUserByNationalId(testNationalId);
    expect(user).toBeDefined();
    expect(user?.id).toBe(testUserId);
    expect(user?.email).toBe("test@example.com");
  });

  it("should verify correct password", async () => {
    const user = await db.getUserByNationalId(testNationalId);
    expect(user).toBeDefined();
    
    if (user) {
      const isValid = await compare(testPassword, user.password);
      expect(isValid).toBe(true);
    }
  });

  it("should reject incorrect password", async () => {
    const user = await db.getUserByNationalId(testNationalId);
    expect(user).toBeDefined();
    
    if (user) {
      const isValid = await compare("WrongPassword123", user.password);
      expect(isValid).toBe(false);
    }
  });

  it("should update user information", async () => {
    await db.updateUser(testUserId, {
      email: "newemail@example.com",
      phone: "0509876543",
    });

    const user = await db.getUserById(testUserId);
    expect(user?.email).toBe("newemail@example.com");
    expect(user?.phone).toBe("0509876543");
  });

  it("should get all users", async () => {
    const users = await db.getAllUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });
});

describe("User Roles", () => {
  it("should support all user roles", async () => {
    const roles = ["admin", "teacher", "student", "parent"];
    
    for (const role of roles) {
      const hashedPassword = await hash("TestPassword123", 10);
      const userId = await db.createUser({
        nationalId: `role_test_${role}_${Date.now()}`,
        password: hashedPassword,
        name: `${role} User`,
        email: `${role}@example.com`,
        role: role as any,
      });
      
      const user = await db.getUserById(userId);
      expect(user?.role).toBe(role);
    }
  });
});
