"""
Two-Factor Authentication (2FA) Module for YoCoin
Uses TOTP (Time-based One-Time Password) compatible with Google Authenticator, Authy, etc.
"""
import os
import struct
import time
import base64
import hashlib
import hmac
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class TOTP:
    """Implements RFC 6238 TOTP algorithm (no external dependencies)"""
    
    @staticmethod
    def generate_secret(length=20):
        """Generate a random base32 secret"""
        import secrets
        return base64.b32encode(secrets.token_bytes(length)).decode('utf-8').rstrip('=')
    
    @staticmethod
    def generate_provisioning_uri(secret, account_name, issuer='YoCoin'):
        """Generate otpauth:// URI for QR code"""
        import urllib.parse
        secret_b32 = secret.replace(' ', '')
        params = {
            'secret': secret_b32,
            'issuer': issuer,
            'algorithm': 'SHA1',
            'digits': '6',
            'period': '30'
        }
        query = urllib.parse.urlencode(params)
        return f'otpauth://totp/{urllib.parse.quote(issuer)}:{urllib.parse.quote(account_name)}?{query}'
    
    @staticmethod
    def generate_qr_code_data_uri(uri):
        """Generate a data URI for QR code (simple implementation)"""
        try:
            import qrcode
            import io
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(uri)
            qr.make(fit=True)
            img = qr.make_image(fill_color='black', back_color='white')
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            img_bytes = buffer.read()
            img_b64 = base64.b64encode(img_bytes).decode('utf-8')
            return f'data:image/png;base64,{img_b64}'
        except ImportError:
            return None
    
    @staticmethod
    def get_totp_token(secret, time_offset=0):
        """Generate a 6-digit TOTP token"""
        secret_clean = secret.upper().replace(' ', '')
        padding = (8 - len(secret_clean) % 8) % 8
        secret_bytes = base64.b32decode(secret_clean + '=' * padding)
        time_step = int((time.time() + time_offset) / 30)
        time_bytes = struct.pack('>Q', time_step)
        hmac_digest = hmac.new(secret_bytes, time_bytes, hashlib.sha1).digest()
        offset = hmac_digest[-1] & 0x0F
        code = (struct.unpack('>I', hmac_digest[offset:offset+4])[0] & 0x7FFFFFFF) % 1000000
        return f'{code:06d}'
    
    @staticmethod
    def verify_token(secret, token, window=1):
        """Verify a TOTP token with a time window (default +/- 1 step)"""
        if not secret or not token:
            return False
        token = str(token).strip()
        for offset in range(-window, window + 1):
            if TOTP.get_totp_token(secret, offset * 30) == token:
                return True
        return False


class TwoFactorAuth:
    """2FA management for YoCoin users"""
    
    def __init__(self, mysql):
        self.mysql = mysql
    
    def is_enabled(self, user_id):
        """Check if 2FA is enabled for user"""
        cursor = None
        try:
            cursor = self.mysql.connection.cursor()
            cursor.execute('SELECT two_factor_enabled FROM users WHERE user_id = %s', (user_id,))
            result = cursor.fetchone()
            return result and result.get('two_factor_enabled', False)
        except Exception:
            return False
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
    
    def setup_2fa(self, user_id):
        """
        Generate 2FA secret and provisioning URI for user.
        Returns: (secret, provisioning_uri, qr_data_uri)
        """
        cursor = None
        try:
            cursor = self.mysql.connection.cursor()
            cursor.execute('SELECT email FROM users WHERE user_id = %s', (user_id,))
            user = cursor.fetchone()
            if not user:
                return None, None, None
            
            secret = TOTP.generate_secret()
            uri = TOTP.generate_provisioning_uri(secret, user['email'])
            qr_uri = TOTP.generate_qr_code_data_uri(uri)
            
            cursor.execute('UPDATE users SET two_factor_secret = %s WHERE user_id = %s', (secret, user_id))
            self.mysql.connection.commit()
            
            return secret, uri, qr_uri
        except Exception as e:
            logger.error(f'2FA setup error: {e}')
            return None, None, None
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
    
    def verify_setup(self, user_id, token):
        """
        Verify the initial 2FA token to confirm setup.
        Returns: True if valid, enables 2FA
        """
        cursor = None
        try:
            cursor = self.mysql.connection.cursor()
            cursor.execute('SELECT two_factor_secret FROM users WHERE user_id = %s', (user_id,))
            user = cursor.fetchone()
            
            if not user or not user.get('two_factor_secret'):
                return False
            
            if TOTP.verify_token(user['two_factor_secret'], token):
                cursor.execute('UPDATE users SET two_factor_enabled = TRUE WHERE user_id = %s', (user_id,))
                self.mysql.connection.commit()
                
                from audit import log_action
                log_action(self.mysql, '2fa_enabled', user_id, 'user', user_id, '2FA enabled', None)
                return True
            return False
        except Exception as e:
            logger.error(f'2FA verify setup error: {e}')
            return False
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
    
    def verify_login(self, user_id, token):
        """
        Verify 2FA token during login.
        Returns: True if valid
        """
        cursor = None
        try:
            cursor = self.mysql.connection.cursor()
            cursor.execute('SELECT two_factor_secret, two_factor_enabled FROM users WHERE user_id = %s', (user_id,))
            user = cursor.fetchone()
            
            if not user or not user.get('two_factor_enabled') or not user.get('two_factor_secret'):
                return True
            
            if TOTP.verify_token(user['two_factor_secret'], token):
                return True
            
            logger.warning(f'2FA verification failed for user {user_id}')
            return False
        except Exception as e:
            logger.error(f'2FA login verify error: {e}')
            return False
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
    
    def disable_2fa(self, user_id, token):
        """
        Disable 2FA after verifying current token.
        Returns: True if disabled successfully
        """
        cursor = None
        try:
            if not self.verify_login(user_id, token):
                return False
            
            cursor = self.mysql.connection.cursor()
            cursor.execute('''
                UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL 
                WHERE user_id = %s
            ''', (user_id,))
            self.mysql.connection.commit()
            
            from audit import log_action
            log_action(self.mysql, '2fa_disabled', user_id, 'user', user_id, '2FA disabled', None)
            return True
        except Exception as e:
            logger.error(f'2FA disable error: {e}')
            return False
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
    
    def generate_backup_codes(self, user_id, count=8):
        """
        Generate backup codes for 2FA recovery.
        Returns: list of backup codes
        """
        import secrets
        codes = []
        for _ in range(count):
            code = secrets.token_hex(4).upper()
            codes.append(code)
        
        cursor = None
        try:
            cursor = self.mysql.connection.cursor()
            cursor.execute('DELETE FROM two_factor_backup_codes WHERE user_id = %s', (user_id,))
            for code in codes:
                hashed = hashlib.sha256(code.encode()).hexdigest()
                cursor.execute('''
                    INSERT INTO two_factor_backup_codes (user_id, code_hash, created_at)
                    VALUES (%s, %s, NOW())
                ''', (user_id, hashed))
            self.mysql.connection.commit()
        except Exception as e:
            logger.error(f'Backup code generation error: {e}')
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
        
        return codes
    
    def verify_backup_code(self, user_id, code):
        """
        Verify a backup code (single-use).
        Returns: True if valid
        """
        cursor = None
        try:
            code_hash = hashlib.sha256(code.strip().upper().encode()).hexdigest()
            cursor = self.mysql.connection.cursor()
            cursor.execute('''
                SELECT id FROM two_factor_backup_codes 
                WHERE user_id = %s AND code_hash = %s AND is_used = FALSE
            ''', (user_id, code_hash))
            result = cursor.fetchone()
            
            if result:
                cursor.execute('UPDATE two_factor_backup_codes SET is_used = TRUE, used_at = NOW() WHERE id = %s', (result['id'],))
                self.mysql.connection.commit()
                return True
            
            return False
        except Exception as e:
            logger.error(f'Backup code verify error: {e}')
            return False
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
