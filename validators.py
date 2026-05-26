"""
Validators for YoCoin
Uganda-specific validation for phone numbers and National IDs
"""
import re

def validate_uganda_phone(phone):
    """
    Validate Uganda phone number format.
    Accepts: +256XXXXXXXXX, 0XXXXXXXXX, 256XXXXXXXXX
    Returns: (is_valid, normalized_phone)
    """
    phone = phone.strip().replace(' ', '').replace('-', '')

    patterns = [
        (r'^\+256\d{9}$', lambda p: p),
        (r'^256\d{9}$', lambda p: f'+{p}'),
        (r'^0[78]\d{8}$', lambda p: '+256' + p[1:]),
    ]

    for pattern, normalizer in patterns:
        if re.match(pattern, phone):
            return True, normalizer(phone)

    return False, phone

def validate_national_id(national_id):
    """
    Validate Uganda National ID format.
    Format: CM91412102ABCDEFG (2 letters + 7 digits + 7 alphanumeric)
    Returns: (is_valid, error_message)
    """
    national_id = national_id.strip().upper()

    if len(national_id) < 14:
        return False, 'National ID must be at least 14 characters'

    if len(national_id) > 20:
        return False, 'National ID must be at most 20 characters'

    if not re.match(r'^[A-Z0-9]+$', national_id):
        return False, 'National ID must contain only letters and numbers'

    return True, ''

def validate_email_domain(email):
    """Validate email has a proper domain"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password_strength(password):
    """
    Validate password strength.
    Returns: (is_valid, list_of_issues)
    """
    issues = []

    if len(password) < 8:
        issues.append('Password must be at least 8 characters')

    if not re.search(r'[A-Z]', password):
        issues.append('Password must contain at least one uppercase letter')

    if not re.search(r'[a-z]', password):
        issues.append('Password must contain at least one lowercase letter')

    if not re.search(r'[0-9]', password):
        issues.append('Password must contain at least one number')

    return len(issues) == 0, issues
