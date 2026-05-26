"""
Security Module for YoCoin
Account lockout, input sanitization, session security
"""
import re
import html
from datetime import datetime, timedelta
from functools import wraps
from flask import flash, redirect, url_for, request, session

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30

def check_account_lockout(mysql, email):
    """
    Check if account is locked due to too many failed login attempts.
    Returns: (is_locked, lockout_remaining_minutes)
    """
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''
            SELECT failed_login_attempts, lockout_until
            FROM user_auth ua
            JOIN users u ON ua.user_id = u.user_id
            WHERE u.email = %s
        ''', (email,))
        result = cursor.fetchone()
        
        if not result:
            return False, 0
        
        if result['failed_login_attempts'] >= MAX_FAILED_ATTEMPTS:
            if result['lockout_until'] and result['lockout_until'] > datetime.now():
                remaining = (result['lockout_until'] - datetime.now()).total_seconds() / 60
                return True, int(remaining)
            else:
                cursor.execute('''
                    UPDATE user_auth ua
                    JOIN users u ON ua.user_id = u.user_id
                    SET failed_login_attempts = 0, lockout_until = NULL
                    WHERE u.email = %s
                ''', (email,))
                mysql.connection.commit()
        
        return False, 0
    except Exception:
        return False, 0
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

def record_failed_login(mysql, email):
    """Record a failed login attempt and lock account if threshold reached"""
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''
            SELECT failed_login_attempts FROM user_auth ua
            JOIN users u ON ua.user_id = u.user_id
            WHERE u.email = %s
        ''', (email,))
        result = cursor.fetchone()
        
        if result:
            attempts = (result['failed_login_attempts'] or 0) + 1
            if attempts >= MAX_FAILED_ATTEMPTS:
                lockout_until = datetime.now() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
                cursor.execute('''
                    UPDATE user_auth ua
                    JOIN users u ON ua.user_id = u.user_id
                    SET failed_login_attempts = %s, lockout_until = %s
                    WHERE u.email = %s
                ''', (attempts, lockout_until, email))
            else:
                cursor.execute('''
                    UPDATE user_auth ua
                    JOIN users u ON ua.user_id = u.user_id
                    SET failed_login_attempts = %s
                    WHERE u.email = %s
                ''', (attempts, email))
            mysql.connection.commit()
    except Exception:
        pass
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

def reset_failed_logins(mysql, email):
    """Reset failed login counter on successful login"""
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''
            UPDATE user_auth ua
            JOIN users u ON ua.user_id = u.user_id
            SET failed_login_attempts = 0, lockout_until = NULL
            WHERE u.email = %s
        ''', (email,))
        mysql.connection.commit()
    except Exception:
        pass
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

def sanitize_input(value):
    """Sanitize user input to prevent XSS"""
    if isinstance(value, str):
        value = html.escape(value, quote=True)
        value = re.sub(r'<[^>]+>', '', value)
        value = value.strip()
    return value

def sanitize_dict(data, exclude_keys=None):
    """Sanitize all string values in a dictionary"""
    if exclude_keys is None:
        exclude_keys = set()
    sanitized = {}
    for key, value in data.items():
        if key not in exclude_keys:
            sanitized[key] = sanitize_input(value) if isinstance(value, str) else value
        else:
            sanitized[key] = value
    return sanitized

def require_fresh_session(f):
    """Decorator to require recent authentication for sensitive operations"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'login_time' not in session:
            flash('Please log in again to perform this action', 'warning')
            return redirect(url_for('login'))
        
        login_time = datetime.fromisoformat(session['login_time'])
        if datetime.now() - login_time > timedelta(hours=2):
            flash('Session expired. Please log in again.', 'warning')
            return redirect(url_for('login'))
        
        return f(*args, **kwargs)
    return decorated_function

def validate_session_integrity():
    """Validate that session hasn't been tampered with"""
    if 'user_id' in session and 'user_agent' in session:
        if session['user_agent'] != request.headers.get('User-Agent', ''):
            return False
    return True
