"""
Credit Scoring Module for YoCoin
Implements a weighted scoring model based on multiple factors
"""
from datetime import datetime, timedelta

def calculate_credit_score(mysql, user_id):
    """
    Calculate credit score using weighted factors:
    - Payment history (35%)
    - Credit utilization (30%)
    - Length of credit history (15%)
    - Loan diversity (10%)
    - Recent applications (10%)
    
    Returns: score (300-850)
    """
    current_score = 500
    try:
        cursor = mysql.connection.cursor()
        try:
            cursor.execute('SELECT credit_score FROM users WHERE user_id = %s', (user_id,))
            user = cursor.fetchone()
            if user:
                current_score = user['credit_score']

            payment_history_score = _calculate_payment_history(mysql, user_id)
            utilization_score = _calculate_utilization(mysql, user_id)
            history_length_score = _calculate_history_length(mysql, user_id)
            diversity_score = _calculate_diversity(mysql, user_id)
            recent_apps_score = _calculate_recent_apps(mysql, user_id)

            new_score = int(
                payment_history_score * 0.35 +
                utilization_score * 0.30 +
                history_length_score * 0.15 +
                diversity_score * 0.10 +
                recent_apps_score * 0.10
            )

            new_score = max(300, min(850, new_score))

            cursor.execute('UPDATE users SET credit_score = %s WHERE user_id = %s', (new_score, user_id))
            mysql.connection.commit()
        finally:
            cursor.close()

        return new_score
    except Exception:
        return current_score

def _calculate_payment_history(mysql, user_id):
    """35% weight - Based on on-time vs late payments"""
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''
            SELECT 
                COUNT(*) as total_repayments,
                SUM(CASE WHEN lr.payment_date <= l.due_date THEN 1 ELSE 0 END) as on_time,
                SUM(CASE WHEN lr.payment_date > l.due_date THEN 1 ELSE 0 END) as late
            FROM loan_repayments lr
            JOIN loans l ON lr.loan_id = l.loan_id
            WHERE l.user_id = %s AND lr.status = 'paid'
        ''', (user_id,))
        result = cursor.fetchone()
        cursor.close()
        
        if not result or result['total_repayments'] == 0:
            return 500
        
        on_time_ratio = result['on_time'] / result['total_repayments']
        return 300 + (on_time_ratio * 550)
    except Exception:
        return 500

def _calculate_utilization(mysql, user_id):
    """30% weight - Based on current debt vs total credit limit"""
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''
            SELECT 
                COALESCE(SUM(l.amount), 0) as total_borrowed,
                COALESCE(SUM(l.amount - COALESCE((
                    SELECT SUM(lr2.amount) FROM loan_repayments lr2 WHERE lr2.loan_id = l.loan_id
                ), 0)), 0) as current_balance
            FROM loans l
            WHERE l.user_id = %s AND l.status IN ('approved', 'disbursed')
        ''', (user_id,))
        result = cursor.fetchone()
        cursor.close()
        
        if not result or result['total_borrowed'] == 0:
            return 500
        
        utilization_ratio = result['current_balance'] / result['total_borrowed']
        if utilization_ratio <= 0.3:
            return 800
        elif utilization_ratio <= 0.5:
            return 650
        elif utilization_ratio <= 0.7:
            return 500
        else:
            return 350
    except Exception:
        return 500

def _calculate_history_length(mysql, user_id):
    """15% weight - Based on how long user has been borrowing"""
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''
            SELECT MIN(application_date) as first_loan
            FROM loans WHERE user_id = %s
        ''', (user_id,))
        result = cursor.fetchone()
        cursor.close()
        
        if not result or not result['first_loan']:
            return 500
        
        days_since_first = (datetime.now() - result['first_loan']).days
        if days_since_first >= 365:
            return 800
        elif days_since_first >= 180:
            return 700
        elif days_since_first >= 90:
            return 600
        elif days_since_first >= 30:
            return 500
        else:
            return 400
    except Exception:
        return 500

def _calculate_diversity(mysql, user_id):
    """10% weight - Based on variety of loan purposes"""
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''
            SELECT COUNT(DISTINCT purpose) as unique_purposes
            FROM loans WHERE user_id = %s AND status IN ('approved', 'repaid')
        ''', (user_id,))
        result = cursor.fetchone()
        cursor.close()
        
        if not result:
            return 500
        
        unique = result['unique_purposes']
        if unique >= 4:
            return 800
        elif unique >= 3:
            return 700
        elif unique >= 2:
            return 600
        elif unique >= 1:
            return 500
        else:
            return 400
    except Exception:
        return 500

def _calculate_recent_apps(mysql, user_id):
    """10% weight - Penalizes too many recent applications"""
    try:
        cursor = mysql.connection.cursor()
        thirty_days_ago = datetime.now() - timedelta(days=30)
        cursor.execute('''
            SELECT COUNT(*) as recent_apps
            FROM loans WHERE user_id = %s AND application_date >= %s
        ''', (user_id, thirty_days_ago))
        result = cursor.fetchone()
        cursor.close()
        
        if not result:
            return 500
        
        recent = result['recent_apps']
        if recent == 0:
            return 700
        elif recent == 1:
            return 600
        elif recent == 2:
            return 500
        else:
            return 350
    except Exception:
        return 500

def update_score_on_repayment(mysql, user_id, repayment_amount, loan_amount, was_on_time=True):
    """Quick score update after a single repayment (lighter than full recalculation)"""
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT credit_score FROM users WHERE user_id = %s', (user_id,))
        user = cursor.fetchone()
        if not user:
            cursor.close()
            return 500
        
        score = user['credit_score'] or 500
        repayment_ratio = repayment_amount / loan_amount if loan_amount > 0 else 0
        
        if was_on_time:
            score += int(repayment_ratio * 25)
            if repayment_ratio >= 0.5:
                score += 10
        else:
            score -= int(repayment_ratio * 15)
            if repayment_ratio >= 0.5:
                score -= 10
        
        score = max(300, min(850, score))
        cursor.execute('UPDATE users SET credit_score = %s WHERE user_id = %s', (score, user_id))
        mysql.connection.commit()
        cursor.close()
        return score
    except Exception:
        return 500

def get_score_tier(score):
    """Return credit score tier and description"""
    if score >= 750:
        return {'tier': 'Excellent', 'color': 'success', 'min_rate': 3.0, 'max_loan': 2000000}
    elif score >= 700:
        return {'tier': 'Good', 'color': 'success', 'min_rate': 3.5, 'max_loan': 1500000}
    elif score >= 650:
        return {'tier': 'Fair', 'color': 'warning', 'min_rate': 5.0, 'max_loan': 1000000}
    elif score >= 600:
        return {'tier': 'Poor', 'color': 'warning', 'min_rate': 7.5, 'max_loan': 750000}
    else:
        return {'tier': 'Very Poor', 'color': 'danger', 'min_rate': 10.0, 'max_loan': 500000}
