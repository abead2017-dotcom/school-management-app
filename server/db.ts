import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  InsertTeacher, teachers,
  InsertStudent, students,
  InsertClass, classes,
  InsertSubject, subjects,
  InsertGrade, grades,
  InsertAttendance, attendance,
  InsertFee, fees,
  InsertNotification, notifications,
} from "../drizzle/schema";
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

// ============ USER MANAGEMENT ============

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(users).values(user);
  return result[0]?.insertId || 0;
}

export async function getUserByNationalId(nationalId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.nationalId, nationalId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(users);
}

// ============ TEACHER MANAGEMENT ============

export async function createTeacher(teacher: InsertTeacher) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(teachers).values(teacher);
  return result[0]?.insertId || 0;
}

export async function getTeacherByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTeachers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(teachers);
}

export async function updateTeacher(id: number, data: Partial<InsertTeacher>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(teachers).set(data).where(eq(teachers.id, id));
}

export async function deleteTeacher(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(teachers).where(eq(teachers.id, id));
}

// ============ STUDENT MANAGEMENT ============

export async function createStudent(student: InsertStudent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(students).values(student);
  return result[0]?.insertId || 0;
}

export async function getStudentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(students).where(eq(students.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentsByClassId(classId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(students).where(eq(students.classId, classId));
}

export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(students);
}

export async function updateStudent(id: number, data: Partial<InsertStudent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(students).set(data).where(eq(students.id, id));
}

export async function deleteStudent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(students).where(eq(students.id, id));
}

// ============ CLASS MANAGEMENT ============

export async function createClass(classData: InsertClass) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(classes).values(classData);
  return result[0]?.insertId || 0;
}

export async function getAllClasses() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(classes);
}

export async function getClassById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateClass(id: number, data: Partial<InsertClass>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(classes).set(data).where(eq(classes.id, id));
}

export async function deleteClass(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(classes).where(eq(classes.id, id));
}

// ============ SUBJECT MANAGEMENT ============

export async function createSubject(subject: InsertSubject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(subjects).values(subject);
  return result[0]?.insertId || 0;
}

export async function getAllSubjects() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(subjects);
}

export async function getSubjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSubject(id: number, data: Partial<InsertSubject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(subjects).set(data).where(eq(subjects.id, id));
}

export async function deleteSubject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(subjects).where(eq(subjects.id, id));
}

// ============ GRADE MANAGEMENT ============

export async function createGrade(grade: InsertGrade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(grades).values(grade);
  return result[0]?.insertId || 0;
}

export async function getStudentGrades(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(grades).where(eq(grades.studentId, studentId));
}

export async function updateGrade(id: number, data: Partial<InsertGrade>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(grades).set(data).where(eq(grades.id, id));
}

// ============ ATTENDANCE MANAGEMENT ============

export async function recordAttendance(attendance_record: InsertAttendance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(attendance).values(attendance_record);
  return result[0]?.insertId || 0;
}

export async function getStudentAttendance(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(attendance).where(eq(attendance.studentId, studentId));
}

// ============ FEE MANAGEMENT ============

export async function createFee(fee: InsertFee) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(fees).values(fee);
  return result[0]?.insertId || 0;
}

export async function getStudentFees(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(fees).where(eq(fees.studentId, studentId));
}

export async function updateFee(id: number, data: Partial<InsertFee>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(fees).set(data).where(eq(fees.id, id));
}

// ============ NOTIFICATION MANAGEMENT ============

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notifications).values(notification);
  return result[0]?.insertId || 0;
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(notifications).where(eq(notifications.userId, userId));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}

// ============ OAUTH COMPATIBILITY (Legacy functions) ============

/**
 * @deprecated Use getUserByNationalId instead
 * This function is kept for OAuth compatibility
 */
export async function getUserByOpenId(openId: string) {
  // Since we're using nationalId now, this is a fallback
  // In a real migration, you'd map openId to nationalId
  return undefined;
}

/**
 * @deprecated Use createUser/updateUser instead
 * This function is kept for OAuth compatibility
 */
export async function upsertUser(user: InsertUser) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // For now, just create a user if it doesn't exist
    // In production, you'd implement proper upsert logic
    const existing = await getUserByNationalId(user.nationalId || "");
    if (existing) {
      await updateUser(existing.id, user);
    } else {
      await createUser(user);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
