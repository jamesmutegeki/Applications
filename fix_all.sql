-- Comprehensive database migration to add all missing tables and columns
-- Run: mysql -u root -p < fix_all.sql

USE yocoin_db;

-- ============================================================
-- 1. Add missing columns to `users` table
-- ============================================================
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='yocoin_db' AND TABLE_NAME='users' AND COLUMN_NAME='referral_code');
SET @sql = IF(@exists=0,'ALTER TABLE users ADD COLUMN referral_code VARCHAR(50) DEFAULT NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='yocoin_db' AND TABLE_NAME='users' AND COLUMN_NAME='referred_by');
SET @sql = IF(@exists=0,'ALTER TABLE users ADD COLUMN referred_by VARCHAR(36) DEFAULT NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE users MODIFY image_file VARCHAR(255) DEFAULT 'default.jpg';

-- ============================================================
-- 2. Add missing columns to `loans` table
-- ============================================================
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='yocoin_db' AND TABLE_NAME='loans' AND COLUMN_NAME='disbursement_method');
SET @sql = IF(@exists=0,'ALTER TABLE loans ADD COLUMN disbursement_method VARCHAR(50) DEFAULT NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='yocoin_db' AND TABLE_NAME='loans' AND COLUMN_NAME='disbursed_by');
SET @sql = IF(@exists=0,'ALTER TABLE loans ADD COLUMN disbursed_by VARCHAR(36) DEFAULT NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================================
-- 3. Create `admin_notifications` table
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id VARCHAR(36) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_id VARCHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_user (admin_user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- 4. Create `user_sessions` table
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_token VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_user (user_id),
    INDEX idx_token (session_token),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- 5. Create `support_tickets` table
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    admin_response TEXT,
    status VARCHAR(20) DEFAULT 'open',
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- 6. Create `referrals` table
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
    referral_id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id VARCHAR(36) NOT NULL,
    referred_id VARCHAR(36) NOT NULL,
    referral_code VARCHAR(50),
    is_rewarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_referrer (referrer_id),
    INDEX idx_referred (referred_id),
    UNIQUE KEY unique_referred (referred_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- 7. Create `late_fees` table
-- ============================================================
CREATE TABLE IF NOT EXISTS late_fees (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reason VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_loan (loan_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- 8. Create `email_verification` table
-- ============================================================
CREATE TABLE IF NOT EXISTS email_verification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(128) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- 9. Fix notification_log FK - allow NULL user_id for system messages
-- ============================================================
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA='yocoin_db' AND TABLE_NAME='notification_log' AND CONSTRAINT_TYPE='FOREIGN KEY');
SET @sql = IF(@fk_exists>0,
    'ALTER TABLE notification_log DROP FOREIGN KEY notification_log_ibfk_1',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
ALTER TABLE notification_log MODIFY user_id VARCHAR(36) NULL;
ALTER TABLE notification_log MODIFY notification_type VARCHAR(50) NULL;

-- ============================================================
-- 10. Add last_score_update if missing
-- ============================================================
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='yocoin_db' AND TABLE_NAME='users' AND COLUMN_NAME='last_score_update');
SET @sql = IF(@exists=0,'ALTER TABLE users ADD COLUMN last_score_update TIMESTAMP NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================================
-- 11. Seed default admin if none exists
-- ============================================================
INSERT IGNORE INTO users (user_id, name, email, phone, region, national_id, kyc_status, credit_score, is_verified)
VALUES ('admin-default', 'System Admin', 'admin@yocoin.ug', '+256700000001', 'Central', 'ADMIN0000000000001', 'verified', 750, TRUE);
INSERT IGNORE INTO user_auth (user_id, password_hash, salt, recovery_question, recovery_answer_hash)
VALUES ('admin-default', '$2b$04$kb1OX9Z.iAks7S3zHjQ3.ORb5YdkkOppKmpUcz3fPddOTZzrL1DhC', '', 'What city were you born in?', '$2b$04$kb1OX9Z.iAks7S3zHjQ3.ORb5YdkkOppKmpUcz3fPddOTZzrL1DhC');
INSERT IGNORE INTO token_balances (address, balance) VALUES ('admin-default', 0);
INSERT IGNORE INTO admins (user_id, role) VALUES ('admin-default', 'admin');
