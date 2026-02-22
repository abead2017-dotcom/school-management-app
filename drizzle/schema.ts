import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, date } from "drizzle-orm/mysql-core";

/**
 * School Management System Database Schema
 * Complete schema for managing schools, teachers, students, parents, and academic data
 */

// Users table - Core authentication table
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  nationalId: varchar("nationalId", { length: 20 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  role: mysqlEnum("role", ["admin", "teacher", "student", "parent"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Teachers table
export const teachers = mysqlTable("teachers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  specialization: varchar("specialization", { length: 255 }),
  qualification: varchar("qualification", { length: 255 }),
  joinDate: date("joinDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Students table
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  classId: int("classId"),
  parentId: int("parentId"),
  enrollmentDate: date("enrollmentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Parents table
export const parents = mysqlTable("parents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  relationship: varchar("relationship", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Classes table
export const classes = mysqlTable("classes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  level: varchar("level", { length: 100 }),
  capacity: int("capacity"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Subjects table
export const subjects = mysqlTable("subjects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Timetables table
export const timetables = mysqlTable("timetables", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  day: varchar("day", { length: 20 }).notNull(),
  startTime: varchar("startTime", { length: 10 }).notNull(),
  endTime: varchar("endTime", { length: 10 }).notNull(),
  subjectId: int("subjectId").notNull(),
  teacherId: int("teacherId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Assignments table
export const assignments = mysqlTable("assignments", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  subjectId: int("subjectId").notNull(),
  teacherId: int("teacherId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: date("dueDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Grades table
export const grades = mysqlTable("grades", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  subjectId: int("subjectId").notNull(),
  grade: decimal("grade", { precision: 5, scale: 2 }).notNull(),
  semester: varchar("semester", { length: 20 }),
  academicYear: varchar("academicYear", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Exams table
export const exams = mysqlTable("exams", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  subjectId: int("subjectId").notNull(),
  date: date("date").notNull(),
  time: varchar("time", { length: 10 }),
  duration: int("duration"),
  totalMarks: decimal("totalMarks", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Attendance table
export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  date: date("date").notNull(),
  status: mysqlEnum("status", ["present", "absent", "late"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Fees table
export const fees = mysqlTable("fees", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("dueDate").notNull(),
  paidDate: date("paidDate"),
  status: mysqlEnum("status", ["pending", "paid", "overdue"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = typeof teachers.$inferInsert;
export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;
export type Parent = typeof parents.$inferSelect;
export type InsertParent = typeof parents.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type InsertClass = typeof classes.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;
export type Timetable = typeof timetables.$inferSelect;
export type InsertTimetable = typeof timetables.$inferInsert;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = typeof assignments.$inferInsert;
export type Grade = typeof grades.$inferSelect;
export type InsertGrade = typeof grades.$inferInsert;
export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;
export type Fee = typeof fees.$inferSelect;
export type InsertFee = typeof fees.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
