-- Run this file: mysql -u root -p < fix_kyc_columns.sql
-- Or paste into MySQL Workbench / phpMyAdmin

USE yocoin_db;

-- Check if columns exist before adding
SET @dbname = 'yocoin_db';
SET @tablename = 'users';

-- Add kyc_status if missing
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE users ADD COLUMN kyc_status ENUM(''not_started'', ''in_progress'', ''pending_review'', ''verified'', ''rejected'') DEFAULT ''not_started''',
        'SELECT ''kyc_status column already exists'''
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'kyc_status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add kyc_completed_at if missing
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE users ADD COLUMN kyc_completed_at TIMESTAMP NULL',
        'SELECT ''kyc_completed_at column already exists'''
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'kyc_completed_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add kyc_verified_by if missing
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE users ADD COLUMN kyc_verified_by VARCHAR(36) NULL COMMENT ''admin user_id who verified''',
        'SELECT ''kyc_verified_by column already exists'''
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'kyc_verified_by'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add kyc_rejection_reason if missing
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE users ADD COLUMN kyc_rejection_reason TEXT NULL',
        'SELECT ''kyc_rejection_reason column already exists'''
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'kyc_rejection_reason'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add kyc_last_reviewed if missing
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE users ADD COLUMN kyc_last_reviewed TIMESTAMP NULL',
        'SELECT ''kyc_last_reviewed column already exists'''
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'kyc_last_reviewed'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify columns were added
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'yocoin_db' AND TABLE_NAME = 'users' AND COLUMN_NAME LIKE 'kyc%';
