# YoCoin - Microloan Platform for Uganda

## Project Overview
Blockchain-powered microloan platform providing collateral-free loans to Ugandans. Users register with National ID, complete KYC verification, apply for loans, and build credit scores.

## Tech Stack
- **Backend**: Flask (Python), MySQL, bcrypt, WTForms, Flask-Limiter
- **Blockchain**: Custom Python blockchain with DB persistence
- **Frontend**: Bootstrap 5, Jinja2 templates
- **Database**: MySQL with 20+ tables
- **Notifications**: Email (SMTP) and SMS (Africa's Talking API)

## Key Files
- `YoCoin.py` - Main Flask application (routes, forms, auth, admin, KYC, notifications)
- `blockchain.py` - Blockchain class with DB persistence and verification
- `notifications.py` - Email/SMS notification service
- `validators.py` - Uganda-specific input validation
- `audit.py` - Audit logging utility
- `YoCoin.sql` - Complete database schema
- `templates/` - Jinja2 HTML templates
- `static/` - CSS, images, uploaded files

## Directory Structure
```
YoCoin/
├── YoCoin.py              # Main app entry point
├── blockchain.py          # Blockchain with DB persistence
├── notifications.py       # Email/SMS notification service
├── validators.py          # Input validation utilities
├── audit.py               # Audit logging utility
├── kyc.py                 # KYC helper functions
├── YoCoin.sql             # Complete database schema
├── YoCoin.env             # Environment config
├── requirements.txt       # Python dependencies
├── .env.example           # Example environment variables
├── templates/             # HTML templates
│   ├── base.html          # Base layout with flash messages
│   ├── index.html         # Landing page
│   ├── login.html         # Login form
│   ├── register.html      # Registration form
│   ├── dashboard.html     # User dashboard
│   ├── profile.html       # Profile management
│   ├── apply_loan.html    # Loan application
│   ├── repayment.html     # Loan repayment
│   ├── password_reset_request.html  # Password reset request
│   ├── password_reset_verify.html   # Password reset verification
│   ├── kyc_upload.html    # KYC document upload
│   ├── kyc_status.html    # KYC status page
│   ├── admin_dashboard.html
│   ├── admin_users.html
│   ├── admin_kyc.html     # KYC verification queue
│   └── admin_audit.html   # Audit log viewer
└── static/
    ├── images/            # Static images
    ├── profile_pics/      # User profile uploads
    └── kyc/               # KYC document uploads
```

## Essential Commands
```bash
# Install dependencies
pip install -r requirements.txt

# Setup database (run ALL three SQL files in order)
mysql -u root -p < YoCoin.sql
mysql -u root -p < migration_v2.sql
mysql -u root -p < fix_all.sql

# Seed admin user (creates admin@yocoin.ug / Admin@123)
python seed_admin.py

# Run development server
python YoCoin.py
```

## Features Implemented
1. **KYC Integration** - Document upload, admin verification queue
2. **Notifications** - Email/SMS alerts for loan events
3. **Password Reset** - Security question-based reset flow
4. **Due Date Calculation** - Auto-calculated on loan approval
5. **Credit Score Updates** - Algorithm based on repayment behavior
6. **Blockchain Persistence** - Syncs with DB on startup
7. **Input Validation** - Uganda phone/National ID format validators
8. **Rate Limiting** - Flask-Limiter on sensitive endpoints
9. **Audit Logging** - All admin actions logged with IP/user agent
10. **Pagination** - Admin lists paginated (20 items per page)
11. **File Upload Security** - Magic byte validation
12. **HTTPS Enforcement** - Secure session configuration
