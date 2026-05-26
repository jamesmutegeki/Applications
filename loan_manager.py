"""
Loan Management Module
Handles default detection, grace periods, repayment schedules
"""
from datetime import datetime, timedelta

def check_for_defaults(mysql, notifications=None):
    """
    Check all active loans for default status and overdue late fees.
    A loan is defaulted if:
    - Due date has passed + grace period (7 days)
    - No repayment made during grace period
    Late fees are applied:
    - 1% per day after due date (capped at 10% of loan amount)
    - 5% on default
    """
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        grace_days = 7
        default_threshold = datetime.now() - timedelta(days=grace_days)
        today = datetime.now()

        cursor.execute('''
            SELECT l.*, u.email, u.name, u.phone
            FROM loans l
            JOIN users u ON l.user_id = u.user_id
            WHERE l.status IN ('approved', 'disbursed')
            AND l.due_date < %s
            AND l.loan_id NOT IN (
                SELECT lr.loan_id FROM loan_repayments lr
                WHERE lr.loan_id = l.loan_id AND lr.payment_date >= l.due_date
            )
        ''', (today,))
        overdue_loans = cursor.fetchall()

        for loan in overdue_loans:
            days_overdue = (today - loan['due_date']).days if loan['due_date'] else 0
            if days_overdue > 0 and days_overdue <= grace_days:
                daily_fee = loan['amount'] * 0.01
                cursor.execute('SELECT COALESCE(SUM(amount), 0) as total_fees FROM late_fees WHERE loan_id = %s', (loan['loan_id'],))
                existing_fees = float(cursor.fetchone()['total_fees'])
                max_fee = loan['amount'] * 0.10
                if existing_fees + daily_fee <= max_fee:
                    cursor.execute('''
                        INSERT INTO late_fees (loan_id, user_id, amount, reason)
                        VALUES (%s, %s, %s, %s)
                    ''', (loan['loan_id'], loan['user_id'], daily_fee, f'Late payment: {days_overdue} day(s) overdue'))

        cursor.execute('''
            SELECT l.*, u.email, u.name, u.phone
            FROM loans l
            JOIN users u ON l.user_id = u.user_id
            WHERE l.status IN ('approved', 'disbursed')
            AND l.due_date <= %s
            AND l.loan_id NOT IN (
                SELECT lr.loan_id FROM loan_repayments lr
                WHERE lr.loan_id = l.loan_id AND lr.payment_date >= l.due_date
            )
        ''', (default_threshold,))
        defaulted_loans = cursor.fetchall()
        
        for loan in defaulted_loans:
            cursor.execute('UPDATE loans SET status = "defaulted" WHERE loan_id = %s', (loan['loan_id'],))
            late_fee = loan['amount'] * 0.05
            cursor.execute('''
                INSERT INTO late_fees (loan_id, user_id, amount, reason)
                VALUES (%s, %s, %s, %s)
            ''', (loan['loan_id'], loan['user_id'], late_fee, 'Loan defaulted after grace period'))
            
            try:
                from credit_triggers import trigger_score_recalculation
                days_overdue = (datetime.now() - loan['due_date']).days if loan['due_date'] else 0
                trigger_score_recalculation(mysql, loan['user_id'], 'default', {
                    'loan_amount': float(loan['amount']),
                    'days_overdue': days_overdue
                })
            except Exception:
                pass
            
            if notifications:
                notifications.notify_loan_defaulted(
                    loan['user_id'],
                    loan['email'],
                    loan['name'],
                    loan['amount'],
                    loan['loan_id']
                )
        
        mysql.connection.commit()
        return len(defaulted_loans)
    except Exception:
        return 0
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

def generate_repayment_schedule(loan_amount, interest_rate, term_months, start_date=None):
    """
    Generate a monthly repayment schedule.
    Returns list of dicts with due_date, amount, status
    """
    if start_date is None:
        start_date = datetime.now()
    
    total_amount = loan_amount * (1 + interest_rate / 100)
    monthly_payment = total_amount / term_months
    
    schedule = []
    for i in range(term_months):
        due_date = start_date + timedelta(days=30 * (i + 1))
        schedule.append({
            'installment': i + 1,
            'due_date': due_date,
            'amount': round(monthly_payment, 2),
            'status': 'pending'
        })
    
    return schedule

def get_days_until_due(due_date):
    """Calculate days until loan is due"""
    if not due_date:
        return None
    if isinstance(due_date, str):
        due_date = datetime.strptime(due_date, '%Y-%m-%d %H:%M:%S')
    delta = due_date - datetime.now()
    return delta.days

def is_loan_overdue(due_date, grace_days=7):
    """Check if loan is past due date + grace period"""
    if not due_date:
        return False
    if isinstance(due_date, str):
        due_date = datetime.strptime(due_date, '%Y-%m-%d %H:%M:%S')
    overdue_threshold = datetime.now() - timedelta(days=grace_days)
    return due_date < overdue_threshold

def get_loan_status_summary(mysql, user_id):
    """Get comprehensive loan status for a user"""
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        
        cursor.execute('''
            SELECT 
                COUNT(*) as total_loans,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status IN ('approved', 'disbursed') THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'repaid' THEN 1 ELSE 0 END) as repaid,
                SUM(CASE WHEN status = 'defaulted' THEN 1 ELSE 0 END) as defaulted,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM loans WHERE user_id = %s
        ''', (user_id,))
        summary = cursor.fetchone()
        
        cursor.execute('''
            SELECT l.loan_id, l.amount, l.due_date, l.status,
                   l.amount - COALESCE((SELECT SUM(lr.amount) FROM loan_repayments lr WHERE lr.loan_id = l.loan_id), 0) as balance
            FROM loans l
            WHERE l.user_id = %s AND l.status IN ('approved', 'disbursed')
            ORDER BY l.due_date ASC
        ''', (user_id,))
        active_loans = cursor.fetchall()
        
        for loan in active_loans:
            loan['days_until_due'] = get_days_until_due(loan['due_date'])
            loan['is_overdue'] = loan['days_until_due'] is not None and loan['days_until_due'] < 0
        
        return {'summary': summary, 'active_loans': active_loans}
    except Exception:
        return {'summary': None, 'active_loans': []}
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
