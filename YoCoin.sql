-- Database creation
CREATE DATABASE IF NOT EXISTS yocoin_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'yocoin_user'@'localhost' IDENTIFIED BY 'securepassword123';
GRANT ALL PRIVILEGES ON yocoin_db.* TO 'yocoin_user'@'localhost';
FLUSH PRIVILEGES;
USE yocoin_db;

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Users table (for borrowers)
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    region VARCHAR(50) NOT NULL,
    national_id VARCHAR(50) UNIQUE,
    credit_score INT DEFAULT 500,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSON,
    image_file VARCHAR(255),
    kyc_status ENUM('not_started', 'in_progress', 'pending_review', 'verified', 'rejected') DEFAULT 'not_started',
    kyc_completed_at TIMESTAMP NULL,
    INDEX idx_region (region),
    INDEX idx_credit_score (credit_score),
    INDEX idx_kyc_status (kyc_status)
);

-- User authentication table
CREATE TABLE IF NOT EXISTS user_auth (
    auth_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100) NOT NULL,
    recovery_question VARCHAR(255),
    recovery_answer_hash VARCHAR(255),
    last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    failed_login_attempts INT DEFAULT 0,
    lockout_until TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
    loan_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    term_months INT NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'disbursed', 'repaid', 'defaulted') DEFAULT 'pending',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP NULL,
    disbursement_date TIMESTAMP NULL,
    due_date TIMESTAMP NULL,
    repayment_schedule JSON,
    collateral_details JSON,
    rejection_reason TEXT,
    rejection_date TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_loan_status (status),
    INDEX idx_loan_dates (application_date, approval_date, due_date)
);

-- Loan repayments table
CREATE TABLE IF NOT EXISTS loan_repayments (
    repayment_id VARCHAR(36) PRIMARY KEY,
    loan_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    payment_date TIMESTAMP NULL,
    status ENUM('pending', 'paid', 'late', 'partial') DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(100),
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_repayment_status (status),
    INDEX idx_repayment_dates (due_date, payment_date)
);

-- Blockchain blocks table
CREATE TABLE IF NOT EXISTS blockchain_blocks (
    block_index INT AUTO_INCREMENT PRIMARY KEY,
    block_hash VARCHAR(64) NOT NULL UNIQUE,
    previous_hash VARCHAR(64) NOT NULL,
    proof BIGINT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    miner_address VARCHAR(100),
    INDEX idx_block_hash (block_hash),
    INDEX idx_previous_hash (previous_hash)
);

-- Blockchain transactions table
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    transaction_id VARCHAR(36) PRIMARY KEY,
    block_index INT NOT NULL,
    sender_address VARCHAR(100) NOT NULL,
    recipient_address VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_fee DECIMAL(15,2) DEFAULT 0,
    message TEXT,
    loan_id VARCHAR(36),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_hash VARCHAR(64) NOT NULL UNIQUE,
    FOREIGN KEY (block_index) REFERENCES blockchain_blocks(block_index),
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),
    INDEX idx_transaction_hash (transaction_hash),
    INDEX idx_transaction_parties (sender_address, recipient_address)
);

-- YoCoin token balances
CREATE TABLE IF NOT EXISTS token_balances (
    address VARCHAR(100) PRIMARY KEY,
    balance DECIMAL(15,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_balance (balance)
);

-- Token transactions (separate from blockchain for performance)
CREATE TABLE IF NOT EXISTS token_transactions (
    transaction_id VARCHAR(36) PRIMARY KEY,
    sender VARCHAR(100) NOT NULL,
    recipient VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_type ENUM('transfer', 'loan_disbursement', 'loan_repayment', 'staking', 'reward') NOT NULL,
    reference_id VARCHAR(36),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    INDEX idx_token_transactions (sender, recipient),
    INDEX idx_transaction_type (transaction_type)
);

-- Staking table for token economy
CREATE TABLE IF NOT EXISTS token_staking (
    staking_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    rewards_earned DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_staking_status (status),
    INDEX idx_staking_dates (start_date, end_date)
);

-- Financial literacy resources (premium features)
CREATE TABLE IF NOT EXISTS financial_resources (
    resource_id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content_type ENUM('article', 'video', 'course', 'tool') NOT NULL,
    content_url VARCHAR(255),
    content_text TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    credit_score_requirement INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User access to premium features
CREATE TABLE IF NOT EXISTS user_premium_access (
    access_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    resource_id VARCHAR(36) NOT NULL,
    access_granted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    payment_reference VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (resource_id) REFERENCES financial_resources(resource_id),
    INDEX idx_access_expiry (expires_at)
);

-- Partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
    partnership_id VARCHAR(36) PRIMARY KEY,
    partner_name VARCHAR(100) NOT NULL,
    partner_type ENUM('NGO', 'financial_institution', 'government', 'corporate') NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    agreement_details TEXT,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    partnership_benefits TEXT,
    INDEX idx_partnership_status (status)
);

-- Partner-specific loan programs
CREATE TABLE IF NOT EXISTS partner_loan_programs (
    program_id VARCHAR(36) PRIMARY KEY,
    partnership_id VARCHAR(36) NOT NULL,
    program_name VARCHAR(100) NOT NULL,
    max_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    target_regions JSON,
    eligibility_criteria TEXT,
    special_terms TEXT,
    FOREIGN KEY (partnership_id) REFERENCES partnerships(partnership_id)
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit log for important actions
CREATE TABLE IF NOT EXISTS audit_log (
    log_id VARCHAR(36) PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(36),
    entity_type VARCHAR(50),
    entity_id VARCHAR(36),
    action_details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_timestamp (timestamp),
    INDEX idx_audit_user (user_id)
);

-- KYC Document uploads table
CREATE TABLE IF NOT EXISTS kyc_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    document_type ENUM('national_id_front', 'national_id_back', 'passport', 'drivers_license', 'utility_bill', 'selfie') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    verified_at TIMESTAMP NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_kyc_user (user_id),
    INDEX idx_kyc_status (status)
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    notify_loan_submitted BOOLEAN DEFAULT TRUE,
    notify_loan_approved BOOLEAN DEFAULT TRUE,
    notify_loan_rejected BOOLEAN DEFAULT TRUE,
    notify_loan_disbursed BOOLEAN DEFAULT TRUE,
    notify_repayment_due BOOLEAN DEFAULT TRUE,
    notify_repayment_made BOOLEAN DEFAULT TRUE,
    notify_loan_defaulted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user (user_id)
);

-- Notification log table for tracking sent notifications
CREATE TABLE IF NOT EXISTS notification_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    channel VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_created (created_at)
);

-- Initial system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('min_loan_amount', '50000', 'Minimum loan amount in UGX'),
('max_loan_amount', '1000000', 'Maximum loan amount in UGX'),
('base_interest_rate', '5.0', 'Base interest rate percentage'),
('block_reward', '1.0', 'YoCoin tokens rewarded for mining a block'),
('transaction_fee_rate', '0.5', 'Transaction fee as percentage of amount'),
('credit_score_initial', '500', 'Initial credit score for new users'),
('staking_min_amount', '1000', 'Minimum amount required for staking'),
('staking_default_rate', '3.5', 'Default annual interest rate for staking')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
