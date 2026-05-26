"""
Mobile Money Integration for YoCoin
Supports MTN MoMo and Airtel Money APIs for Uganda
"""
import os
import uuid
import hashlib
import logging
import requests
from datetime import datetime

logger = logging.getLogger(__name__)

class MTNMoMoAPI:
    """MTN Mobile Money API Integration (Uganda)"""
    
    def __init__(self):
        self.api_user = os.getenv('MTN_MOMO_API_USER', '')
        self.api_key = os.getenv('MTN_MOMO_API_KEY', '')
        self.subscription_key = os.getenv('MTN_MOMO_SUBSCRIPTION_KEY', '')
        self.base_url = os.getenv('MTN_MOMO_BASE_URL', 'https://sandbox.momodeveloper.mtn.com')
        self.provider_callback_host = os.getenv('MTN_MOMO_CALLBACK_HOST', '')
        self.environment = os.getenv('MTN_MOMO_ENVIRONMENT', 'sandbox')
        
    def _get_token(self):
        """Get OAuth2 access token from MTN"""
        if not self.api_user or not self.api_key:
            return None
        try:
            url = f'{self.base_url}/collection/token/'
            import base64
            auth = base64.b64encode(f'{self.api_user}:{self.api_key}'.encode()).decode()
            headers = {
                'Authorization': f'Basic {auth}',
                'Ocp-Apim-Subscription-Key': self.subscription_key
            }
            response = requests.post(url, headers=headers, timeout=10)
            if response.status_code == 200:
                return response.json().get('access_token')
            logger.error(f'MTN token error: {response.status_code} {response.text}')
            return None
        except Exception as e:
            logger.error(f'MTN token exception: {e}')
            return None
    
    def disburse(self, amount, phone, external_id=None, narration='YoCoin Disbursement'):
        """
        Disburse funds to user via MTN MoMo
        Returns: (success, transaction_id, message)
        """
        if not self.api_user:
            return False, None, 'MTN MoMo not configured'
        
        ext_id = external_id or str(uuid.uuid4())
        formatted_phone = self._format_phone(phone)
        
        payload = {
            'amount': str(amount),
            'currency': 'UGX',
            'externalId': ext_id,
            'payee': {
                'partyIdType': 'MSISDN',
                'partyId': formatted_phone
            },
            'payerMessage': narration,
            'payeeNote': 'YoCoin loan disbursement'
        }
        
        try:
            token = self._get_token()
            if not token:
                return False, None, 'Failed to get MTN token'
            
            url = f'{self.base_url}/collection/v1_0/disbursement'
            headers = {
                'Authorization': f'Bearer {token}',
                'X-Reference-Id': ext_id,
                'X-Target-Environment': self.environment,
                'Ocp-Apim-Subscription-Key': self.subscription_key,
                'Content-Type': 'application/json'
            }
            
            if self.provider_callback_host:
                headers['X-Callback-Url'] = f'{self.provider_callback_host}/callback/mtn'
            
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            
            if response.status_code in (201, 202):
                return True, ext_id, 'Disbursement initiated'
            else:
                error = response.json() if response.text else {}
                return False, ext_id, f'MTN error: {error.get("reason", response.text)}'
        except Exception as e:
            logger.error(f'MTN disbursement error: {e}')
            return False, ext_id, f'Disbursement failed: {str(e)}'
    
    def collect_payment(self, amount, phone, external_id=None, narration='YoCoin Repayment'):
        """
        Collect payment from user via MTN MoMo
        Returns: (success, transaction_id, message)
        """
        if not self.api_user:
            return False, None, 'MTN MoMo not configured'
        
        ext_id = external_id or str(uuid.uuid4())
        formatted_phone = self._format_phone(phone)
        
        payload = {
            'amount': str(amount),
            'currency': 'UGX',
            'externalId': ext_id,
            'payer': {
                'partyIdType': 'MSISDN',
                'partyId': formatted_phone
            },
            'payerMessage': narration,
            'payeeNote': 'YoCoin loan repayment'
        }
        
        try:
            token = self._get_token()
            if not token:
                return False, None, 'Failed to get MTN token'
            
            url = f'{self.base_url}/collection/v1_0/requesttopay'
            headers = {
                'Authorization': f'Bearer {token}',
                'X-Reference-Id': ext_id,
                'X-Target-Environment': self.environment,
                'Ocp-Apim-Subscription-Key': self.subscription_key,
                'Content-Type': 'application/json'
            }
            
            if self.provider_callback_host:
                headers['X-Callback-Url'] = f'{self.provider_callback_host}/callback/mtn'
            
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            
            if response.status_code in (201, 202):
                return True, ext_id, 'Payment request sent. Check phone to approve.'
            else:
                error = response.json() if response.text else {}
                return False, ext_id, f'MTN error: {error.get("reason", response.text)}'
        except Exception as e:
            logger.error(f'MTN collection error: {e}')
            return False, ext_id, f'Payment failed: {str(e)}'
    
    def get_transaction_status(self, reference_id):
        """Check status of a disbursement or payment"""
        try:
            token = self._get_token()
            if not token:
                return None
            
            url = f'{self.base_url}/collection/v1_0/disbursement/{reference_id}'
            headers = {
                'Authorization': f'Bearer {token}',
                'X-Target-Environment': self.environment,
                'Ocp-Apim-Subscription-Key': self.subscription_key
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f'MTN status check error: {e}')
            return None
    
    def _format_phone(self, phone):
        """Format phone to MTN required format (remove +, ensure country code)"""
        clean = phone.replace(' ', '').replace('-', '')
        if clean.startswith('+256'):
            return clean[1:]
        if clean.startswith('256'):
            return clean
        if clean.startswith('0'):
            return '256' + clean[1:]
        return clean


class AirtelMoneyAPI:
    """Airtel Money API Integration (Uganda)"""
    
    def __init__(self):
        self.api_key = os.getenv('AIRTEL_API_KEY', '')
        self.api_secret = os.getenv('AIRTEL_API_SECRET', '')
        self.country_code = os.getenv('AIRTEL_COUNTRY_CODE', 'UG')
        self.currency = os.getenv('AIRTEL_CURRENCY', 'UGX')
        self.base_url = os.getenv('AIRTEL_BASE_URL', 'https://openapiuat.airtel.africa')
        self.environment = os.getenv('AIRTEL_ENVIRONMENT', 'sandbox')
        
    def _get_token(self):
        """Get access token from Airtel"""
        if not self.api_key or not self.api_secret:
            return None
        try:
            url = f'{self.base_url}/auth/token'
            headers = {'Content-Type': 'application/json'}
            payload = {
                'grant_type': 'client_credentials',
                'client_id': self.api_key,
                'client_secret': self.api_secret
            }
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            if response.status_code == 200:
                return response.json().get('access_token')
            logger.error(f'Airtel token error: {response.status_code} {response.text}')
            return None
        except Exception as e:
            logger.error(f'Airtel token exception: {e}')
            return None
    
    def disburse(self, amount, phone, external_id=None, narration='YoCoin Disbursement'):
        """
        Disburse funds to user via Airtel Money
        Returns: (success, transaction_id, message)
        """
        if not self.api_key:
            return False, None, 'Airtel Money not configured'
        
        ext_id = external_id or str(uuid.uuid4())
        formatted_phone = self._format_phone(phone)
        
        payload = {
            'country': self.country_code,
            'currency': self.currency,
            'amount': str(amount),
            'reference': ext_id,
            'subscriber': {
                'country': self.country_code,
                'currency': self.currency,
                'msisdn': formatted_phone
            },
            'narration': narration
        }
        
        try:
            token = self._get_token()
            if not token:
                return False, None, 'Failed to get Airtel token'
            
            url = f'{self.base_url}/standard/v1/disbursements'
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            
            if response.status_code in (200, 201, 202):
                data = response.json()
                txn_id = data.get('transaction_id', ext_id)
                return True, txn_id, 'Disbursement initiated'
            else:
                error = response.json() if response.text else {}
                return False, ext_id, f'Airtel error: {error.get("message", response.text)}'
        except Exception as e:
            logger.error(f'Airtel disbursement error: {e}')
            return False, ext_id, f'Disbursement failed: {str(e)}'
    
    def collect_payment(self, amount, phone, external_id=None, narration='YoCoin Repayment'):
        """
        Collect payment from user via Airtel Money
        Returns: (success, transaction_id, message)
        """
        if not self.api_key:
            return False, None, 'Airtel Money not configured'
        
        ext_id = external_id or str(uuid.uuid4())
        formatted_phone = self._format_phone(phone)
        
        payload = {
            'country': self.country_code,
            'currency': self.currency,
            'amount': str(amount),
            'reference': ext_id,
            'subscriber': {
                'country': self.country_code,
                'currency': self.currency,
                'msisdn': formatted_phone
            },
            'narration': narration
        }
        
        try:
            token = self._get_token()
            if not token:
                return False, None, 'Failed to get Airtel token'
            
            url = f'{self.base_url}/standard/v1/payments'
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            
            if response.status_code in (200, 201, 202):
                data = response.json()
                txn_id = data.get('transaction_id', ext_id)
                return True, txn_id, 'Payment request sent. Check phone to approve.'
            else:
                error = response.json() if response.text else {}
                return False, ext_id, f'Airtel error: {error.get("message", response.text)}'
        except Exception as e:
            logger.error(f'Airtel collection error: {e}')
            return False, ext_id, f'Payment failed: {str(e)}'
    
    def _format_phone(self, phone):
        """Format phone for Airtel (remove +, ensure country code)"""
        clean = phone.replace(' ', '').replace('-', '')
        if clean.startswith('+256'):
            return clean[1:]
        if clean.startswith('256'):
            return clean
        if clean.startswith('0'):
            return '256' + clean[1:]
        return clean


class MobileMoneyService:
    """Unified Mobile Money Service - routes to correct provider"""
    
    def __init__(self, mysql=None):
        self.mysql = mysql
        self.mtn = MTNMoMoAPI()
        self.airtel = AirtelMoneyAPI()
    
    def detect_provider(self, phone):
        """Detect mobile money provider based on phone number prefix"""
        clean = phone.replace(' ', '').replace('-', '').replace('+', '')
        if clean.startswith('256'):
            clean = clean[3:]
        elif clean.startswith('0'):
            clean = clean[1:]
        
        mtn_prefixes = ['77', '78', '76', '70']
        airtel_prefixes = ['70', '75', '79']
        
        if len(clean) >= 2:
            prefix = clean[:2]
            if prefix in mtn_prefixes:
                return 'mtn'
            if prefix in airtel_prefixes:
                return 'airtel'
        
        return 'mtn'
    
    def disburse(self, amount, phone, method, loan_id=None, user_id=None):
        """
        Disburse funds via detected or specified provider
        method: 'mtn', 'airtel', or 'auto'
        Returns: (success, transaction_id, message, provider)
        """
        provider = method if method != 'auto' else self.detect_provider(phone)
        
        if provider == 'mtn':
            success, txn_id, message = self.mtn.disburse(amount, phone)
        elif provider == 'airtel':
            success, txn_id, message = self.airtel.disburse(amount, phone)
        else:
            return False, None, 'Unknown provider', provider
        
        if self.mysql and txn_id:
            self._log_transaction(
                loan_id=loan_id,
                user_id=user_id,
                provider=provider,
                transaction_type='disbursement',
                amount=amount,
                phone=phone,
                external_id=txn_id,
                status='initiated' if success else 'failed',
                message=message
            )
        
        return success, txn_id, message, provider
    
    def collect_payment(self, amount, phone, method, loan_id=None, user_id=None):
        """
        Collect payment via detected or specified provider
        method: 'mtn', 'airtel', or 'auto'
        Returns: (success, transaction_id, message, provider)
        """
        provider = method if method != 'auto' else self.detect_provider(phone)
        
        if provider == 'mtn':
            success, txn_id, message = self.mtn.collect_payment(amount, phone)
        elif provider == 'airtel':
            success, txn_id, message = self.airtel.collect_payment(amount, phone)
        else:
            return False, None, 'Unknown provider', provider
        
        if self.mysql and txn_id:
            self._log_transaction(
                loan_id=loan_id,
                user_id=user_id,
                provider=provider,
                transaction_type='repayment',
                amount=amount,
                phone=phone,
                external_id=txn_id,
                status='initiated' if success else 'failed',
                message=message
            )
        
        return success, txn_id, message, provider
    
    def _log_transaction(self, loan_id, user_id, provider, transaction_type, amount, phone, external_id, status, message):
        """Log mobile money transaction to database"""
        cursor = None
        try:
            cursor = self.mysql.connection.cursor()
            cursor.execute('''
                INSERT INTO mobile_money_transactions 
                (transaction_id, loan_id, user_id, provider, transaction_type, amount, phone_number, 
                 external_reference, status, message, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ''', (str(uuid.uuid4()), loan_id, user_id, provider, transaction_type, amount, phone, external_id, status, message))
            self.mysql.connection.commit()
        except Exception as e:
            logger.error(f'Failed to log mobile money transaction: {e}')
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
    
    def get_transaction_history(self, user_id=None, loan_id=None, limit=50):
        """Get mobile money transaction history"""
        if not self.mysql:
            return []
        cursor = None
        try:
            cursor = self.mysql.connection.cursor()
            if loan_id:
                cursor.execute('''
                    SELECT * FROM mobile_money_transactions 
                    WHERE loan_id = %s ORDER BY created_at DESC LIMIT %s
                ''', (loan_id, limit))
            elif user_id:
                cursor.execute('''
                    SELECT * FROM mobile_money_transactions 
                    WHERE user_id = %s ORDER BY created_at DESC LIMIT %s
                ''', (user_id, limit))
            else:
                cursor.execute('''
                    SELECT * FROM mobile_money_transactions 
                    ORDER BY created_at DESC LIMIT %s
                ''', (limit,))
            results = cursor.fetchall()
            return results
        except Exception:
            return []
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
