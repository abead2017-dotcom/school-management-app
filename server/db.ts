import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
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

let pool: mysql.Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && !pool) {
    const databaseUrl = process.env.DATABASE_URL || ENV.databaseUrl;
    if (databaseUrl) {
      try {
        console.log("[Database] Connecting to:", databaseUrl.substring(0, 30) + "...");
        // Create mysql2 pool from DSN
        pool = mysql.createPool({
          uri: databaseUrl,
          connectionLimit: 10,
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
        });
        
        // Test connection
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        
        // Create drizzle instance from pool
        _db = drizzle(pool) as any;
        console.log("[Database] Connected successfully");
      } catch (error) {
        console.error("[Database] Failed to connect:", error);
        _db = null;
        pool = null;
      }
    } else {
      console.warn("[Database] No DATABASE_URL or databaseUrl found in environment");
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

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(users);
  return result;
}

export async function updateUser(id: number, updates: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set(updates).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(users).where(eq(users.id, id));
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
  
  const result = await db.select().from(teachers);
  return result;
}

export async function updateTeacher(id: number, updates: Partial<InsertTeacher>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(teachers).set(updates).where(eq(teachers.id, id));
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

export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(students);
  return result;
}

export async function getStudentsByClassId(classId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(students).where(eq(students.classId, classId));
  return result;
}

export async function updateStudent(id: number, updates: Partial<InsertStudent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(students).set(updates).where(eq(students.id, id));
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

export async function getClassById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllClasses() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(classes);
  return result;
}

export async function updateClass(id: number, updates: Partial<InsertClass>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(classes).set(updates).where(eq(classes.id, id));
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

export async function getSubjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSubjects() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(subjects);
  return result;
}

export async function updateSubject(id: number, updates: Partial<InsertSubject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(subjects).set(updates).where(eq(subjects.id, id));
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
  
  const result = await db.select().from(grades).where(eq(grades.studentId, studentId));
  return result;
}

export async function updateGrade(id: number, updates: Partial<InsertGrade>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(grades).set(updates).where(eq(grades.id, id));
}

// ============ ATTENDANCE MANAGEMENT ============

export async function createAttendance(attendance_data: InsertAttendance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(attendance).values(attendance_data);
  return result[0]?.insertId || 0;
}

export async function getStudentAttendance(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(attendance).where(eq(attendance.studentId, studentId));
  return result;
}

export async function recordAttendance(studentId: number, date: Date, status: "present" | "absent" | "late") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(attendance).values({
    studentId,
    date,
    status,
  });
  return result[0]?.insertId || 0;
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
  
  const result = await db.select().from(fees).where(eq(fees.studentId, studentId));
  return result;
}

export async function updateFee(id: number, updates: Partial<InsertFee>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(fees).set(updates).where(eq(fees.id, id));
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
  
  const result = await db.select().from(notifications).where(eq(notifications.userId, userId));
  return result;
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}


// ============ OAUTH COMPATIBILITY FUNCTIONS ============

export async function getUserByOpenId(openId: string) {
  // For OAuth compatibility - not used in national ID based auth
  return undefined;
}

export async function upsertUser(data: any) {
  // For OAuth compatibility - use createUser or updateUser instead
  const existing = await getUserByNationalId(data.nationalId);
  if (existing) {
    await updateUser(existing.id, data);
    return existing.id;
  } else {
    return await createUser(data);
  }
}
