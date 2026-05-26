"""
Audit Logging Utility for YoCoin
Logs important actions for security and compliance
"""
import uuid
from datetime import datetime

def log_action(mysql, action_type, user_id=None, entity_type=None, entity_id=None, action_details=None, request=None):
    """
    Log an action to the audit_log table

    Args:
        mysql: MySQL connection
        action_type: Type of action (e.g., 'loan_approved', 'user_login', 'password_reset')
        user_id: User who performed the action
        entity_type: Type of entity affected (e.g., 'loan', 'user', 'repayment')
        entity_id: ID of the entity affected
        action_details: Additional details about the action
        request: Flask request object for IP and user agent
    """
    if not mysql:
        return

    cursor = None
    try:
        cursor = mysql.connection.cursor()
        ip_address = request.remote_addr if request else None
        user_agent = request.headers.get('User-Agent', '') if request else None

        cursor.execute('''
            INSERT INTO audit_log (log_id, action_type, user_id, entity_type, entity_id, action_details, ip_address, user_agent, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ''', (
            str(uuid.uuid4()),
            action_type,
            user_id,
            entity_type,
            entity_id,
            action_details,
            ip_address,
            user_agent
        ))
        mysql.connection.commit()
    except Exception:
        pass
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

def get_user_audit_log(mysql, user_id, limit=50):
    """Get audit log entries for a specific user"""
    if not mysql:
        return []

    cursor = None
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''
            SELECT * FROM audit_log
            WHERE user_id = %s
            ORDER BY timestamp DESC
            LIMIT %s
        ''', (user_id, limit))
        logs = cursor.fetchall()
        return logs
    except Exception:
        return []
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

def get_entity_audit_log(mysql, entity_type, entity_id, limit=50):
    """Get audit log entries for a specific entity"""
    if not mysql:
        return []

    cursor = None
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''
            SELECT * FROM audit_log
            WHERE entity_type = %s AND entity_id = %s
            ORDER BY timestamp DESC
            LIMIT %s
        ''', (entity_type, entity_id, limit))
        logs = cursor.fetchall()
        return logs
    except Exception:
        return []
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
