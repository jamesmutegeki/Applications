"""
Notification Service for YoCoin
Handles email and SMS notifications for loan events
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

class NotificationService:
    def __init__(self, mysql=None):
        self.mysql = mysql
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_user)
        self.sms_api_key = os.getenv('SMS_API_KEY', '')
        self.sms_from = os.getenv('SMS_FROM', 'YoCoin')

    def get_user_preferences(self, user_id):
        """Get user notification preferences"""
        if not self.mysql:
            return {'email_enabled': True, 'sms_enabled': False}
        try:
            cursor = self.mysql.connection.cursor()
            cursor.execute('''
                SELECT email_enabled, sms_enabled, phone,
                       notify_loan_submitted, notify_loan_approved,
                       notify_loan_rejected, notify_loan_disbursed,
                       notify_repayment_due, notify_repayment_made,
                       notify_loan_defaulted
                FROM notification_preferences WHERE user_id = %s
            ''', (user_id,))
            prefs = cursor.fetchone()
            cursor.close()
            return prefs if prefs else {'email_enabled': True, 'sms_enabled': False}
        except Exception:
            return {'email_enabled': True, 'sms_enabled': False}

    def send_email(self, to_email, subject, body, user_id=None):
        """Send email notification"""
        if not self.smtp_user or not self.smtp_password:
            return False
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject

            html_body = f'''
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #228B22, #1a6b1a); padding: 20px; color: white;">
                    <h1 style="margin: 0;">YoCoin</h1>
                </div>
                <div style="padding: 20px;">
                    {body}
                </div>
                <div style="background: #f3f4f6; padding: 15px; text-align: center; color: #666; font-size: 12px;">
                    <p>This is an automated message from YoCoin. Please do not reply.</p>
                    <p>&copy; {datetime.now().year} YoCoin - Microloan Platform for Uganda</p>
                </div>
            </body>
            </html>
            '''

            msg.attach(MIMEText(body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            self._log_notification(user_id or 'system', to_email, 'email', subject, 'sent')
            return True
        except Exception as e:
            self._log_notification(user_id or 'system', to_email, 'email', subject, 'failed', str(e))
            return False

    def send_sms(self, phone, message, user_id=None):
        """Send SMS notification via API"""
        if not self.sms_api_key:
            return False
        try:
            import requests
            url = 'https://api.africastalking.com/version1/messaging'
            headers = {
                'ApiKey': self.sms_api_key,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            data = {
                'username': self.sms_from,
                'to': phone,
                'message': message
            }
            response = requests.post(url, headers=headers, data=data)
            status = 'sent' if response.status_code == 201 else 'failed'
            self._log_notification(user_id or 'system', phone, 'sms', message[:50], status)
            return response.status_code == 201
        except Exception as e:
            self._log_notification(user_id or 'system', phone, 'sms', message[:50], 'failed', str(e))
            return False

    def notify_loan_submitted(self, user_id, user_email, user_name, loan_amount):
        """Notify user that loan application was submitted"""
        prefs = self.get_user_preferences(user_id)
        subject = 'Loan Application Submitted'
        body = f'''
        <h2>Hello {user_name},</h2>
        <p>Your loan application for UGX {loan_amount:,.0f} has been submitted successfully.</p>
        <p>Our team will review your application and you will be notified once a decision is made.</p>
        <p><strong>Next steps:</strong></p>
        <ul>
            <li>Wait for review (typically 24 hours)</li>
            <li>Check your dashboard for updates</li>
        </ul>
        '''
        if prefs.get('email_enabled'):
            self.send_email(user_email, subject, body)

    def notify_loan_approved(self, user_id, user_email, user_name, loan_amount, loan_id):
        """Notify user that loan was approved"""
        prefs = self.get_user_preferences(user_id)
        subject = 'Loan Approved!'
        body = f'''
        <h2>Congratulations {user_name}!</h2>
        <p>Your loan application for UGX {loan_amount:,.0f} has been approved.</p>
        <p>Loan ID: {loan_id[:8]}</p>
        <p>The funds will be disbursed to your account shortly.</p>
        '''
        if prefs.get('email_enabled'):
            self.send_email(user_email, subject, body)
        if prefs.get('sms_enabled') and prefs.get('phone'):
            self.send_sms(prefs['phone'], f'YoCoin: Your loan of UGX {loan_amount:,.0f} has been approved!')

    def notify_loan_rejected(self, user_id, user_email, user_name, reason):
        """Notify user that loan was rejected"""
        prefs = self.get_user_preferences(user_id)
        subject = 'Loan Application Update'
        body = f'''
        <h2>Hello {user_name},</h2>
        <p>We regret to inform you that your loan application has been declined.</p>
        <p><strong>Reason:</strong> {reason}</p>
        <p>You can reapply after addressing the issues mentioned above or contact support for assistance.</p>
        '''
        if prefs.get('email_enabled'):
            self.send_email(user_email, subject, body)

    def notify_repayment_received(self, user_id, user_email, user_name, amount, loan_id):
        """Notify user that repayment was received"""
        prefs = self.get_user_preferences(user_id)
        subject = 'Repayment Received'
        body = f'''
        <h2>Hello {user_name},</h2>
        <p>We have received your repayment of UGX {amount:,.0f}.</p>
        <p>Loan ID: {loan_id[:8]}</p>
        <p>Thank you for your timely payment. This helps improve your credit score!</p>
        '''
        if prefs.get('email_enabled'):
            self.send_email(user_email, subject, body)

    def notify_repayment_due(self, user_id, user_email, user_name, amount, due_date):
        """Notify user that repayment is due"""
        prefs = self.get_user_preferences(user_id)
        subject = 'Repayment Due Soon'
        body = f'''
        <h2>Hello {user_name},</h2>
        <p>This is a reminder that your loan repayment of UGX {amount:,.0f} is due on {due_date}.</p>
        <p>Please make your payment on time to maintain a good credit score.</p>
        '''
        if prefs.get('email_enabled'):
            self.send_email(user_email, subject, body)
        if prefs.get('sms_enabled') and prefs.get('phone'):
            self.send_sms(prefs['phone'], f'YoCoin: Repayment of UGX {amount:,.0f} due on {due_date}')

    def _log_notification(self, user_id, recipient, channel, message, status, error=None):
        """Log notification to database"""
        if not self.mysql:
            return
        try:
            cursor = self.mysql.connection.cursor()
            cursor.execute('''
                INSERT INTO notification_log (user_id, notification_type, channel, message, status, error_message)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (user_id, 'notification', channel, message[:255], status, error))
            self.mysql.connection.commit()
            cursor.close()
        except Exception:
            pass
