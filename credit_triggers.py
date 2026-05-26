"""
Credit Score Trigger Module
Automatically recalculates credit scores on key events
"""
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def trigger_score_recalculation(mysql, user_id, event_type, event_data=None):
    """
    Trigger credit score recalculation based on events.
    Events: repayment, default, loan_approved, loan_rejected, kyc_verified, loan_repaid
    """
    if event_data is None:
        event_data = {}
    
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT credit_score FROM users WHERE user_id = %s', (user_id,))
        user = cursor.fetchone()
        if not user:
            return None
        
        old_score = user['credit_score'] or 500
        new_score = old_score
        
        if event_type == 'repayment':
            new_score = _on_repayment(cursor, user_id, old_score, event_data)
        elif event_type == 'default':
            new_score = _on_default(cursor, user_id, old_score, event_data)
        elif event_type == 'loan_approved':
            new_score = _on_loan_approved(cursor, user_id, old_score, event_data)
        elif event_type == 'loan_rejected':
            new_score = _on_loan_rejected(cursor, user_id, old_score, event_data)
        elif event_type == 'kyc_verified':
            new_score = _on_kyc_verified(cursor, user_id, old_score)
        elif event_type == 'loan_repaid':
            new_score = _on_loan_repaid(cursor, user_id, old_score, event_data)
        elif event_type == 'late_payment':
            new_score = _on_late_payment(cursor, user_id, old_score, event_data)
        elif event_type == 'full_recalculation':
            from credit_scoring import calculate_credit_score
            new_score = calculate_credit_score(mysql, user_id)
            return new_score
        
        new_score = max(300, min(850, new_score))
        
        if new_score != old_score:
            cursor.execute('UPDATE users SET credit_score = %s WHERE user_id = %s', (new_score, user_id))
            try:
                cursor.execute('UPDATE users SET last_score_update = NOW() WHERE user_id = %s', (user_id,))
            except Exception:
                pass
            mysql.connection.commit()
            
            try:
                cursor.execute('''
                    INSERT INTO credit_score_history (user_id, old_score, new_score, reason, created_at)
                    VALUES (%s, %s, %s, %s, NOW())
                ''', (user_id, old_score, new_score, f'Auto-update: {event_type}'))
            except Exception:
                pass
            mysql.connection.commit()
            
            logger.info(f'Credit score updated for {user_id}: {old_score} -> {new_score} (event: {event_type})')
        
        return new_score
    except Exception as e:
        logger.error(f'Score recalculation error for {user_id}: {e}')
        return None
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

def _on_repayment(cursor, user_id, current_score, data):
    """On-time repayment: +5 to +25 based on ratio"""
    amount = data.get('amount', 0)
    loan_amount = data.get('loan_amount', 1)
    was_on_time = data.get('was_on_time', True)
    days_early = data.get('days_early', 0)
    
    ratio = amount / loan_amount if loan_amount > 0 else 0
    
    if was_on_time:
        base = int(ratio * 15)
        early_bonus = min(10, days_early) if days_early > 0 else 0
        streak_bonus = _get_streak_bonus(cursor, user_id)
        return current_score + base + early_bonus + streak_bonus
    else:
        penalty = int(ratio * 10)
        return current_score - max(5, penalty)

def _on_default(cursor, user_id, current_score, data):
    """Loan default: -50 to -100"""
    loan_amount = data.get('loan_amount', 0)
    days_overdue = data.get('days_overdue', 0)
    
    base_penalty = 50
    overdue_penalty = min(50, days_overdue)
    
    has_prior_defaults = _count_defaults(cursor, user_id)
    if has_prior_defaults > 0:
        base_penalty += 25 * has_prior_defaults
    
    return current_score - (base_penalty + overdue_penalty)

def _on_loan_approved(cursor, user_id, current_score, data):
    """Loan approved: small positive for first loan, neutral for others"""
    total_loans = _count_total_loans(cursor, user_id)
    if total_loans == 1:
        return current_score + 5
    return current_score

def _on_loan_rejected(cursor, user_id, current_score, data):
    """Loan rejected: small penalty if recent rejections"""
    recent_rejections = _count_recent_rejections(cursor, user_id, days=90)
    if recent_rejections >= 3:
        return current_score - 10
    return current_score

def _on_kyc_verified(cursor, user_id, current_score):
    """KYC verified: small positive boost"""
    return current_score + 10

def _on_loan_repaid(cursor, user_id, current_score, data):
    """Full loan repaid: significant positive boost"""
    total_loans = _count_total_loans(cursor, user_id)
    repaid_loans = _count_repaid_loans(cursor, user_id)
    
    base_bonus = 15
    completion_ratio = repaid_loans / total_loans if total_loans > 0 else 0
    completion_bonus = int(completion_ratio * 20)
    
    return current_score + base_bonus + completion_bonus

def _on_late_payment(cursor, user_id, current_score, data):
    """Late payment detected: penalty based on days late"""
    days_late = data.get('days_late', 1)
    penalty = min(30, 5 + days_late)
    return current_score - penalty

def _get_streak_bonus(cursor, user_id):
    """Bonus for consecutive on-time payments"""
    cursor.execute('''
        SELECT COUNT(*) as streak
        FROM loan_repayments lr
        JOIN loans l ON lr.loan_id = l.loan_id
        WHERE l.user_id = %s AND lr.status = 'paid' AND lr.payment_date <= l.due_date
    ''', (user_id,))
    result = cursor.fetchone()
    streak = result['streak'] if result else 0
    
    if streak >= 12:
        return 15
    elif streak >= 6:
        return 10
    elif streak >= 3:
        return 5
    return 0

def _count_defaults(cursor, user_id):
    """Count user's prior defaults"""
    cursor.execute("SELECT COUNT(*) as cnt FROM loans WHERE user_id = %s AND status = 'defaulted'", (user_id,))
    result = cursor.fetchone()
    return result['cnt'] if result else 0

def _count_total_loans(cursor, user_id):
    """Count user's total loans"""
    cursor.execute("SELECT COUNT(*) as cnt FROM loans WHERE user_id = %s", (user_id,))
    result = cursor.fetchone()
    return result['cnt'] if result else 0

def _count_repaid_loans(cursor, user_id):
    """Count user's fully repaid loans"""
    cursor.execute("SELECT COUNT(*) as cnt FROM loans WHERE user_id = %s AND status = 'repaid'", (user_id,))
    result = cursor.fetchone()
    return result['cnt'] if result else 0

def _count_recent_rejections(cursor, user_id, days=90):
    """Count recent loan rejections"""
    from datetime import timedelta
    cutoff = datetime.now() - timedelta(days=days)
    cursor.execute("SELECT COUNT(*) as cnt FROM loans WHERE user_id = %s AND status = 'rejected' AND application_date >= %s", (user_id, cutoff))
    result = cursor.fetchone()
    return result['cnt'] if result else 0

def schedule_score_recalculation(mysql, user_id, event_type, event_data=None):
    """
    Schedule a score recalculation event.
    This is a wrapper that can be called from any route/hook.
    """
    return trigger_score_recalculation(mysql, user_id, event_type, event_data)
