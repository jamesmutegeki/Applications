-- YoCoin Database Migration: New Tables for v2 Features
-- Run after initial YoCoin.sql

-- Mobile Money Transactions
CREATE TABLE IF NOT EXISTS mobile_money_transactions (
    transaction_id VARCHAR(36) PRIMARY KEY,
    loan_id VARCHAR(36),
    user_id VARCHAR(36),
    provider ENUM('mtn', 'airtel') NOT NULL,
    transaction_type ENUM('disbursement', 'repayment') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    phone_number VARCHAR(20),
    external_reference VARCHAR(100),
    status ENUM('initiated', 'pending', 'completed', 'failed', 'cancelled') DEFAULT 'initiated',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_loan (loan_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Two-Factor Backup Codes
CREATE TABLE IF NOT EXISTS two_factor_backup_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    code_hash VARCHAR(64) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    INDEX idx_user (user_id),
    INDEX idx_hash (code_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Credit Score History
CREATE TABLE IF NOT EXISTS credit_score_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    old_score INT NOT NULL,
    new_score INT NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add 2FA columns to users table (safe to run multiple times)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'yocoin_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'two_factor_enabled');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists2 = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'yocoin_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'two_factor_secret');
SET @sql2 = IF(@col_exists2 = 0, 'ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(32) DEFAULT NULL', 'SELECT 1');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

SET @col_exists3 = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'yocoin_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_score_update');
SET @sql3 = IF(@col_exists3 = 0, 'ALTER TABLE users ADD COLUMN last_score_update TIMESTAMP NULL', 'SELECT 1');
PREPARE stmt3 FROM @sql3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

-- Add notification_log table if missing
CREATE TABLE IF NOT EXISTS notification_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    notification_type VARCHAR(50),
    channel VARCHAR(20),
    message TEXT,
    status VARCHAR(20),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
