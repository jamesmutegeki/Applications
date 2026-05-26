"""Tests for TOTP and 2FA module"""
import unittest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from two_factor import TOTP

class TestTOTP(unittest.TestCase):
    def test_generate_secret(self):
        secret = TOTP.generate_secret()
        self.assertIsInstance(secret, str)
        self.assertGreater(len(secret), 0)
        
        secret2 = TOTP.generate_secret()
        self.assertNotEqual(secret, secret2)
    
    def test_token_generation(self):
        secret = TOTP.generate_secret()
        token = TOTP.get_totp_token(secret)
        self.assertIsInstance(token, str)
        self.assertEqual(len(token), 6)
        self.assertTrue(token.isdigit())
    
    def test_token_verification(self):
        secret = TOTP.generate_secret()
        token = TOTP.get_totp_token(secret)
        self.assertTrue(TOTP.verify_token(secret, token))
    
    def test_invalid_token(self):
        secret = TOTP.generate_secret()
        self.assertFalse(TOTP.verify_token(secret, '000000'))
        self.assertFalse(TOTP.verify_token(secret, '123456'))
    
    def test_empty_secret(self):
        self.assertFalse(TOTP.verify_token('', '123456'))
        self.assertFalse(TOTP.verify_token(None, '123456'))
    
    def test_empty_token(self):
        secret = TOTP.generate_secret()
        self.assertFalse(TOTP.verify_token(secret, ''))
        self.assertFalse(TOTP.verify_token(secret, None))
    
    def test_provisioning_uri(self):
        secret = TOTP.generate_secret()
        uri = TOTP.generate_provisioning_uri(secret, 'test@example.com', 'YoCoin')
        self.assertIn('otpauth://totp/', uri)
        self.assertIn('secret=', uri)
        self.assertIn('issuer=YoCoin', uri)
    
    def test_time_window(self):
        secret = TOTP.generate_secret()
        current_token = TOTP.get_totp_token(secret)
        self.assertTrue(TOTP.verify_token(secret, current_token))
        
        off_token = TOTP.get_totp_token(secret, 60)
        self.assertFalse(TOTP.verify_token(secret, off_token))

if __name__ == '__main__':
    unittest.main()
