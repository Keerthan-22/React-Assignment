-- File: server/database.sql
-- Purpose: SQL script to create the database and required tables for Task Manager

CREATE DATABASE IF NOT EXISTS task_manager;
USE task_manager;

-- Profiles table: stores a single user profile (simple app scope)
CREATE TABLE IF NOT EXISTS profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table: stores tasks and timing metadata
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_name VARCHAR(255) NOT NULL,
  comments TEXT,
  expected_seconds INT DEFAULT 0, -- store expected time in seconds
  status ENUM('Pending','In Progress','Paused','Completed') DEFAULT 'Pending',
  total_work_seconds INT DEFAULT 0, -- accumulated worked seconds
  last_started_at DATETIME DEFAULT NULL, -- when it was last started/resumed
  is_manual TINYINT(1) DEFAULT 0, -- 1 if manually entered completed task
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
