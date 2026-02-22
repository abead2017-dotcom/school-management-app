import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { hash, compare } from "bcryptjs";
import { SignJWT } from "jose";

// ============ AUTHENTICATION ROUTER ============

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    // Get current user info
    me: publicProcedure.query((opts) => opts.ctx.user),
    
    // Logout
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // Login with national ID and password
    login: publicProcedure
      .input(z.object({
        nationalId: z.string().min(1, "الرقم الوطني مطلوب"),
        password: z.string().min(1, "كلمة المرور مطلوبة"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Find user by national ID
          const user = await db.getUserByNationalId(input.nationalId);
          
          if (!user) {
            throw new Error("بيانات الدخول غير صحيحة");
          }

          // Verify password
          const isPasswordValid = await compare(input.password, user.password);
          if (!isPasswordValid) {
            throw new Error("بيانات الدخول غير صحيحة");
          }

        // Create JWT token
        const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "school-management-system-secret-key-change-in-production");
        const token = await new SignJWT({
          id: user.id,
          nationalId: user.nationalId,
          role: user.role,
          email: user.email,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("7d")
          .sign(JWT_SECRET);

      // Set session cookie
        const cookieString = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=604800`;
          ctx.res.setHeader("Set-Cookie", cookieString);

          return {
            success: true,
            user: {
              id: user.id,
              nationalId: user.nationalId,
              name: user.name,
              email: user.email,
              role: user.role,
            },
            token,
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "فشل تسجيل الدخول");
        }
      }),

    // Register new user (Admin only)
    register: protectedProcedure
      .input(z.object({
        nationalId: z.string().min(1, "الرقم الوطني مطلوب"),
        password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
        name: z.string().min(1, "الاسم مطلوب"),
        email: z.string().email("البريد الإلكتروني غير صحيح").optional(),
        phone: z.string().optional(),
        role: z.enum(["admin", "teacher", "student", "parent"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can create users
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح بإنشاء مستخدمين جدد");
        }

        try {
          // Check if user already exists
          const existing = await db.getUserByNationalId(input.nationalId);
          if (existing) {
            throw new Error("المستخدم موجود بالفعل");
          }

          // Hash password
          const hashedPassword = await hash(input.password, 10);

          // Create user
          const userId = await db.createUser({
            nationalId: input.nationalId,
            password: hashedPassword,
            name: input.name,
            email: input.email,
            phone: input.phone,
            role: input.role,
          });

          return {
            success: true,
            userId,
            message: "تم إنشاء المستخدم بنجاح",
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "فشل إنشاء المستخدم");
        }
      }),

    // Change password
    changePassword: protectedProcedure
      .input(z.object({
        oldPassword: z.string().min(1, "كلمة المرور القديمة مطلوبة"),
        newPassword: z.string().min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          if (!ctx.user) {
            throw new Error("المستخدم غير مصرح");
          }

          // Get user from database
          const user = await db.getUserById(ctx.user.id);
          if (!user) {
            throw new Error("المستخدم غير موجود");
          }

          // Verify old password
          const isPasswordValid = await compare(input.oldPassword, user.password);
          if (!isPasswordValid) {
            throw new Error("كلمة المرور القديمة غير صحيحة");
          }

          // Hash new password
          const hashedPassword = await hash(input.newPassword, 10);

          // Update password
          await db.updateUser(user.id, { password: hashedPassword });

          return {
            success: true,
            message: "تم تغيير كلمة المرور بنجاح",
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "فشل تغيير كلمة المرور");
        }
      }),

    // Reset password (Admin only)
    resetPassword: protectedProcedure
      .input(z.object({
        userId: z.number(),
        newPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can reset passwords
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح بإعادة تعيين كلمات المرور");
        }

        try {
          // Get user
          const user = await db.getUserById(input.userId);
          if (!user) {
            throw new Error("المستخدم غير موجود");
          }

          // Hash new password
          const hashedPassword = await hash(input.newPassword, 10);

          // Update password
          await db.updateUser(user.id, { password: hashedPassword });

          return {
            success: true,
            message: "تم إعادة تعيين كلمة المرور بنجاح",
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "فشل إعادة تعيين كلمة المرور");
        }
      }),
  }),

  // ============ ADMIN MANAGEMENT ROUTERS ============

  admin: router({
    // Get all users
    users: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("غير مصرح");
      }
      return db.getAllUsers();
    }),

    // Get user by ID
    user: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        return db.getUserById(input.id);
      }),

    // Update user
    updateUser: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.enum(["admin", "teacher", "student", "parent"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const { id, ...data } = input;
        await db.updateUser(id, data);
        return { success: true, message: "تم تحديث المستخدم بنجاح" };
      }),
  }),

  // ============ TEACHER MANAGEMENT ROUTERS ============

  teachers: router({
    // Get all teachers
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!["admin", "teacher"].includes(ctx.user?.role || "")) {
        throw new Error("غير مصرح");
      }
      return db.getAllTeachers();
    }),

    // Get teacher by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!["admin", "teacher"].includes(ctx.user?.role || "")) {
          throw new Error("غير مصرح");
        }
        return db.getTeacherByUserId(input.id);
      }),

    // Create teacher (Admin only)
    create: protectedProcedure
      .input(z.object({
        userId: z.number(),
        specialization: z.string().optional(),
        qualification: z.string().optional(),
        joinDate: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const teacherData: any = {
          userId: input.userId,
        };
        if (input.specialization) teacherData.specialization = input.specialization;
        if (input.qualification) teacherData.qualification = input.qualification;
        if (input.joinDate) teacherData.joinDate = new Date(input.joinDate);
        const teacherId = await db.createTeacher(teacherData);
        return { success: true, teacherId, message: "تم إنشاء المعلم بنجاح" };
      }),

    // Update teacher (Admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        specialization: z.string().optional(),
        qualification: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const { id, ...data } = input;
        await db.updateTeacher(id, data);
        return { success: true, message: "تم تحديث المعلم بنجاح" };
      }),

    // Delete teacher (Admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        await db.deleteTeacher(input.id);
        return { success: true, message: "تم حذف المعلم بنجاح" };
      }),
  }),

  // ============ STUDENT MANAGEMENT ROUTERS ============

  students: router({
    // Get all students
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!["admin", "teacher", "parent"].includes(ctx.user?.role || "")) {
        throw new Error("غير مصرح");
      }
      return db.getAllStudents();
    }),

    // Get students by class
    byClass: protectedProcedure
      .input(z.object({ classId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!["admin", "teacher"].includes(ctx.user?.role || "")) {
          throw new Error("غير مصرح");
        }
        return db.getStudentsByClassId(input.classId);
      }),

    // Create student (Admin only)
    create: protectedProcedure
      .input(z.object({
        userId: z.number(),
        classId: z.number().optional(),
        parentId: z.number().optional(),
        enrollmentDate: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const studentData: any = {
          userId: input.userId,
        };
        if (input.classId) studentData.classId = input.classId;
        if (input.parentId) studentData.parentId = input.parentId;
        if (input.enrollmentDate) studentData.enrollmentDate = new Date(input.enrollmentDate);
        const studentId = await db.createStudent(studentData);
        return { success: true, studentId, message: "تم إنشاء الطالب بنجاح" };
      }),

    // Update student (Admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        classId: z.number().optional(),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const { id, ...data } = input;
        await db.updateStudent(id, data);
        return { success: true, message: "تم تحديث الطالب بنجاح" };
      }),

    // Delete student (Admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        await db.deleteStudent(input.id);
        return { success: true, message: "تم حذف الطالب بنجاح" };
      }),
  }),

  // ============ CLASS MANAGEMENT ROUTERS ============

  classes: router({
    // Get all classes
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!["admin", "teacher", "student"].includes(ctx.user?.role || "")) {
        throw new Error("غير مصرح");
      }
      return db.getAllClasses();
    }),

    // Get class by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!["admin", "teacher", "student"].includes(ctx.user?.role || "")) {
          throw new Error("غير مصرح");
        }
        return db.getClassById(input.id);
      }),

    // Create class (Admin only)
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        level: z.string().optional(),
        capacity: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const classData: any = {
          name: input.name,
        };
        if (input.level) classData.level = input.level;
        if (input.capacity) classData.capacity = input.capacity;
        const classId = await db.createClass(classData);
        return { success: true, classId, message: "تم إنشاء الفصل بنجاح" };
      }),

    // Update class (Admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        level: z.string().optional(),
        capacity: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const { id, ...data } = input;
        await db.updateClass(id, data);
        return { success: true, message: "تم تحديث الفصل بنجاح" };
      }),

    // Delete class (Admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        await db.deleteClass(input.id);
        return { success: true, message: "تم حذف الفصل بنجاح" };
      }),
  }),

  // ============ SUBJECT MANAGEMENT ROUTERS ============

  subjects: router({
    // Get all subjects
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!["admin", "teacher", "student"].includes(ctx.user?.role || "")) {
        throw new Error("غير مصرح");
      }
      return db.getAllSubjects();
    }),

    // Get subject by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!["admin", "teacher", "student"].includes(ctx.user?.role || "")) {
          throw new Error("غير مصرح");
        }
        return db.getSubjectById(input.id);
      }),

    // Create subject (Admin only)
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const subjectData: any = {
          name: input.name,
          code: input.code,
        };
        if (input.description) subjectData.description = input.description;
        const subjectId = await db.createSubject(subjectData);
        return { success: true, subjectId, message: "تم إنشاء المادة بنجاح" };
      }),

    // Update subject (Admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        code: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const { id, ...data } = input;
        await db.updateSubject(id, data);
        return { success: true, message: "تم تحديث المادة بنجاح" };
      }),

    // Delete subject (Admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        await db.deleteSubject(input.id);
        return { success: true, message: "تم حذف المادة بنجاح" };
      }),
  }),

  // ============ GRADES MANAGEMENT ROUTERS ============

  grades: router({
    // Get student grades
    student: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!["admin", "teacher", "student", "parent"].includes(ctx.user?.role || "")) {
          throw new Error("غير مصرح");
        }
        return db.getStudentGrades(input.studentId);
      }),

    // Record grade (Teacher only)
    record: protectedProcedure
      .input(z.object({
        studentId: z.number(),
        subjectId: z.number(),
        grade: z.number().min(0).max(100),
        semester: z.string().optional(),
        academicYear: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "teacher") {
          throw new Error("غير مصرح");
        }
        const gradeData: any = {
          studentId: input.studentId,
          subjectId: input.subjectId,
          grade: input.grade.toString(),
        };
        if (input.semester) gradeData.semester = input.semester;
        if (input.academicYear) gradeData.academicYear = input.academicYear;
        const gradeId = await db.createGrade(gradeData);
        return { success: true, gradeId, message: "تم تسجيل الدرجة بنجاح" };
      }),

    // Update grade (Teacher only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        grade: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "teacher") {
          throw new Error("غير مصرح");
        }
        const { id, grade, ...data } = input;
        const updateData: any = data;
        if (grade !== undefined) {
          updateData.grade = grade.toString();
        }
        await db.updateGrade(id, updateData);
        return { success: true, message: "تم تحديث الدرجة بنجاح" };
      }),
  }),

  // ============ ATTENDANCE MANAGEMENT ROUTERS ============

  attendance: router({
    // Get student attendance
    student: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!["admin", "teacher", "student", "parent"].includes(ctx.user?.role || "")) {
          throw new Error("غير مصرح");
        }
        return db.getStudentAttendance(input.studentId);
      }),

    // Record attendance (Teacher only)
    record: protectedProcedure
      .input(z.object({
        studentId: z.number(),
        date: z.string(),
        status: z.enum(["present", "absent", "late"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "teacher") {
          throw new Error("غير مصرح");
        }
        const attendanceData: any = {
          studentId: input.studentId,
          date: new Date(input.date),
          status: input.status,
        };
        const attendanceId = await db.recordAttendance(attendanceData);
        return { success: true, attendanceId, message: "تم تسجيل الحضور بنجاح" };
      }),
  }),

  // ============ FEES MANAGEMENT ROUTERS ============

  fees: router({
    // Get student fees
    student: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!["admin", "student", "parent"].includes(ctx.user?.role || "")) {
          throw new Error("غير مصرح");
        }
        return db.getStudentFees(input.studentId);
      }),

    // Create fee (Admin only)
    create: protectedProcedure
      .input(z.object({
        studentId: z.number(),
        amount: z.number().positive(),
        dueDate: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const feeData: any = {
          studentId: input.studentId,
          dueDate: new Date(input.dueDate),
          amount: input.amount.toString(),
          status: "pending",
        };
        const feeId = await db.createFee(feeData);
        return { success: true, feeId, message: "تم إنشاء الرسم بنجاح" };
      }),

    // Update fee status (Admin only)
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "paid", "overdue"]),
        paidDate: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const { id, paidDate, status } = input;
        const updateData: any = { status };
        if (paidDate) {
          updateData.paidDate = new Date(paidDate);
        }
        await db.updateFee(id, updateData);
        return { success: true, message: "تم تحديث حالة الرسم بنجاح" };
      }),
  }),

  // ============ NOTIFICATIONS ROUTERS ============

  notifications: router({
    // Get user notifications
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error("غير مصرح");
      }
      return db.getUserNotifications(ctx.user.id);
    }),

    // Send notification (Admin only)
    send: protectedProcedure
      .input(z.object({
        userId: z.number(),
        title: z.string().min(1),
        message: z.string().min(1),
        type: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("غير مصرح");
        }
        const notificationData: any = {
          userId: input.userId,
          title: input.title,
          message: input.message,
          read: false,
        };
        if (input.type) notificationData.type = input.type;
        const notificationId = await db.createNotification(notificationData);
        return { success: true, notificationId, message: "تم إرسال الإشعار بنجاح" };
      }),

    // Mark as read
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("غير مصرح");
        }
        await db.markNotificationAsRead(input.id);
        return { success: true, message: "تم تحديث الإشعار" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
