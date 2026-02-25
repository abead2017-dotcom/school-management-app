CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`subjectId` int NOT NULL,
	`teacherId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`dueDate` date NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`date` date NOT NULL,
	`status` enum('present','absent','late') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`level` varchar(100),
	`capacity` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`subjectId` int NOT NULL,
	`date` date NOT NULL,
	`time` varchar(10),
	`duration` int,
	`totalMarks` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`dueDate` date NOT NULL,
	`paidDate` date,
	`status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`subjectId` int NOT NULL,
	`grade` decimal(5,2) NOT NULL,
	`semester` varchar(20),
	`academicYear` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `grades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50),
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`relationship` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`classId` int,
	`parentId` int,
	`enrollmentDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`specialization` varchar(255),
	`qualification` varchar(255),
	`joinDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teachers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timetables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`day` varchar(20) NOT NULL,
	`startTime` varchar(10) NOT NULL,
	`endTime` varchar(10) NOT NULL,
	`subjectId` int NOT NULL,
	`teacherId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timetables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','teacher','student','parent') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `nationalId` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_nationalId_unique` UNIQUE(`nationalId`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `openId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `lastSignedIn`;