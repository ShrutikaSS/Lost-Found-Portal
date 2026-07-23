-- TrackNfind Campus Lost & Found System Database Schema
-- Compatible with MySQL 5.7+ / MySQL 8.0 / MariaDB

CREATE DATABASE IF NOT EXISTS `tracknfind_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tracknfind_db`;

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'officer', 'admin') NOT NULL DEFAULT 'student',
  `student_id` VARCHAR(30) NULL,
  `phone` VARCHAR(25) NOT NULL,
  `security_question` VARCHAR(255) NULL,
  `security_answer_hash` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `items`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_code` VARCHAR(20) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `type` ENUM('lost', 'found') NOT NULL DEFAULT 'found',
  `location` VARCHAR(150) NOT NULL,
  `date_event` DATE NOT NULL,
  `status` ENUM('Unclaimed', 'Claimed', 'Searching') NOT NULL DEFAULT 'Unclaimed',
  `image_url` VARCHAR(255) NULL,
  `description` TEXT NOT NULL,
  `reported_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `claims`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `claims` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `claim_notes` TEXT NOT NULL,
  `proof_details` TEXT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `audit_logs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(255) NOT NULL,
  `role_context` VARCHAR(30) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Seed Data Insertion (Default Demo Users & Sample Items)
-- Default Password for Demo Users is: DemoPass123!
-- Default Security Question Answer for Demo Users is: demoanswer
-- --------------------------------------------------------
INSERT IGNORE INTO `users` (`id`, `full_name`, `email`, `username`, `password_hash`, `role`, `student_id`, `phone`, `security_question`, `security_answer_hash`) VALUES
(1, 'Alex Student', 'alex.student@tracknfind.com', 'alex.student', '$2y$10$w8uMh5E9B0l3O4.vG3bH.O5E0DkX.aF3dE2bC1aD0eF4gH5iJ6kL', 'student', 'STU-2026-881', '+1 (555) 019-2834', 'What was the name of your first pet?', '$2y$10$3YcW5QyO7lH2c.8r9.9e8.N4X7rF0wY3k4b5v6c7d8e9f0a1b2c3d'),
(2, 'Officer Smith', 'officer.smith@tracknfind.com', 'officer.smith', '$2y$10$w8uMh5E9B0l3O4.vG3bH.O5E0DkX.aF3dE2bC1aD0eF4gH5iJ6kL', 'officer', NULL, '+1 (555) 019-5521', 'In what city were you born?', '$2y$10$3YcW5QyO7lH2c.8r9.9e8.N4X7rF0wY3k4b5v6c7d8e9f0a1b2c3d'),
(3, 'System Administrator', 'admin.tnf@tracknfind.com', 'admin.tnf', '$2y$10$w8uMh5E9B0l3O4.vG3bH.O5E0DkX.aF3dE2bC1aD0eF4gH5iJ6kL', 'admin', NULL, '+1 (555) 019-9000', 'What high school did you attend?', '$2y$10$3YcW5QyO7lH2c.8r9.9e8.N4X7rF0wY3k4b5v6c7d8e9f0a1b2c3d');

INSERT IGNORE INTO `items` (`id`, `item_code`, `title`, `category`, `type`, `location`, `date_event`, `status`, `image_url`, `description`, `reported_by`) VALUES
(1, 'item-101', 'Apple MacBook Pro 14" M2 (Space Gray)', 'Electronics', 'found', 'Central Library - 2nd Floor Quiet Zone', '2026-07-20', 'Unclaimed', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', 'Found on desk 24 with a dark gray sleeve case. Turned into campus security post.', 2),
(2, 'item-102', 'Student ID Card & Dorm Keycard (S. Sharma)', 'IDs & Cards', 'found', 'Student Activity Center Cafe', '2026-07-21', 'Unclaimed', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', 'Campus Student ID belonging to Computer Science dept. Found near order counter.', 2),
(3, 'item-103', 'Sony WH-1000XM4 Noise Canceling Headphones', 'Electronics', 'lost', 'Auditorium Hall B', '2026-07-19', 'Searching', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', 'Black headphones left during morning guest lecture. Small scratch on right ear cup.', 1),
(4, 'item-104', 'Leather Wallet with Driving License', 'Accessories', 'found', 'Science Block - Lab 302', '2026-07-18', 'Unclaimed', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80', 'Brown genuine leather wallet containing driving license and campus gym pass.', 2),
(5, 'item-105', 'Hydro Flask Insulated Water Bottle 32oz', 'Personal Belongings', 'found', 'Main Sports Complex Gym', '2026-07-21', 'Unclaimed', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80', 'Pacific blue color water bottle with custom outdoor stickers.', 2),
(6, 'item-106', 'Scientific Calculator (Casio fx-991EX)', 'Electronics', 'lost', 'Mathematics Dept Room 104', '2026-07-22', 'Searching', 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80', 'Casio ClassWiz calculator with name written on back tape.', 1);

INSERT IGNORE INTO `claims` (`id`, `item_id`, `user_id`, `claim_notes`, `proof_details`, `status`) VALUES
(1, 1, 1, 'This is my laptop left during my study session.', 'Serial number ending in 8921. Wallpaper is a mountain landscape.', 'pending');

INSERT IGNORE INTO `audit_logs` (`id`, `user_id`, `action`, `role_context`, `status`) VALUES
(1, 3, 'Role Assignment: Officer #2', 'admin', 'SUCCESS'),
(2, 2, 'Item Bulk Export', 'officer', 'SUCCESS'),
(3, 1, 'Password Reset Request', 'student', 'COMPLETED');
