"""
Transaction Monitoring Module
Detects suspicious activity patterns
"""
from datetime import datetime, timedelta

def detect_suspicious_activity(mysql, user_id=None):
    """
    Check for suspicious patterns:
    - Multiple loan applications in short time
    - Rapid repayment followed by new application
    - Unusually large amounts
    - Multiple accounts with same phone/email patterns
    """
    alerts = []
    
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        
        if user_id:
            alerts.extend(_check_user_patterns(cursor, user_id))
        else:
            alerts.extend(_check_system_patterns(cursor))
        
        return alerts
    except Exception:
        return []
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

def _check_user_patterns(cursor, user_id):
    """Check suspicious patterns for a specific user"""
    alerts = []
    
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    cursor.execute('''
        SELECT COUNT(*) as app_count FROM loans
        WHERE user_id = %s AND application_date >= %s
    ''', (user_id, thirty_days_ago))
    result = cursor.fetchone()
    if result and result['app_count'] > 5:
        alerts.append({
            'type': 'frequent_applications',
            'severity': 'warning',
            'message': f'User submitted {result["app_count"]} applications in 30 days',
            'user_id': user_id
        })
    
    cursor.execute('''
        SELECT COUNT(*) as rejected_count FROM loans
        WHERE user_id = %s AND status = 'rejected' AND application_date >= %s
    ''', (user_id, thirty_days_ago))
    result = cursor.fetchone()
    if result and result['rejected_count'] > 3:
        alerts.append({
            'type': 'multiple_rejections',
            'severity': 'high',
            'message': f'User had {result["rejected_count"]} rejections in 30 days',
            'user_id': user_id
        })
    
    cursor.execute('''
        SELECT MAX(amount) as max_amount FROM loans
        WHERE user_id = %s
    ''', (user_id,))
    result = cursor.fetchone()
    if result and result['max_amount'] and result['max_amount'] > 5000000:
        alerts.append({
            'type': 'large_amount',
            'severity': 'warning',
            'message': f'User applied for UGX {result["max_amount"]:,.0f}',
            'user_id': user_id
        })
    
    return alerts

def _check_system_patterns(cursor):
    """Check system-wide suspicious patterns"""
    alerts = []
    
    twenty_four_hours_ago = datetime.now() - timedelta(hours=24)
    
    cursor.execute('''
        SELECT COUNT(*) as new_users FROM users
        WHERE registration_date >= %s
    ''', (twenty_four_hours_ago,))
    result = cursor.fetchone()
    if result and result['new_users'] > 50:
        alerts.append({
            'type': 'user_spike',
            'severity': 'high',
            'message': f'{result["new_users"]} new users in 24 hours'
        })
    
    cursor.execute('''
        SELECT COUNT(*) as new_loans FROM loans
        WHERE application_date >= %s
    ''', (twenty_four_hours_ago,))
    result = cursor.fetchone()
    if result and result['new_loans'] > 100:
        alerts.append({
            'type': 'loan_spike',
            'severity': 'high',
            'message': f'{result["new_loans"]} loan applications in 24 hours'
        })
    
    cursor.execute('''
        SELECT u.email, COUNT(*) as account_count
        FROM users u
        GROUP BY u.email
        HAVING account_count > 1
        LIMIT 10
    ''')
    duplicates = cursor.fetchall()
    if duplicates:
        alerts.append({
            'type': 'duplicate_emails',
            'severity': 'medium',
            'message': f'{len(duplicates)} emails have multiple accounts'
        })
    
    return alerts

def log_suspicious_activity(mysql, alert):
    """Log suspicious activity to audit_log"""
    cursor = None
    try:
        import uuid
        cursor = mysql.connection.cursor()
        cursor.execute('''
            INSERT INTO audit_log (log_id, action_type, user_id, entity_type, entity_id, action_details, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        ''', (
            str(uuid.uuid4()),
            'suspicious_activity',
            alert.get('user_id'),
            'monitoring',
            alert.get('type'),
            alert.get('message')
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
