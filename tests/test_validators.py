"""Tests for validators module"""
import unittest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from validators import validate_uganda_phone, validate_national_id, validate_password_strength

class TestPhoneValidation(unittest.TestCase):
    def test_valid_formats(self):
        valid_numbers = [
            ('+256772123456', '+256772123456'),
            ('0772123456', '+256772123456'),
            ('256772123456', '+256772123456'),
            ('+256702123456', '+256702123456'),
            ('+256782123456', '+256782123456'),
        ]
        for number, expected in valid_numbers:
            valid, normalized = validate_uganda_phone(number)
            self.assertTrue(valid, f'{number} should be valid')
            self.assertEqual(normalized, expected)
    
    def test_invalid_formats(self):
        invalid_numbers = [
            '123456',
            '+1234567890',
            'abcdefghij',
            '',
            '+256',
            '0',
        ]
        for number in invalid_numbers:
            valid, _ = validate_uganda_phone(number)
            self.assertFalse(valid, f'{number} should be invalid')

class TestNationalIDValidation(unittest.TestCase):
    def test_valid_formats(self):
        valid_ids = [
            'CM1234567890AB',
            'CF1234567890AB',
        ]
        for nid in valid_ids:
            valid, _ = validate_national_id(nid)
            self.assertTrue(valid, f'{nid} should be valid')
    
    def test_invalid_formats(self):
        invalid_ids = [
            '123456',
            'AB123',
            '',
        ]
        for nid in invalid_ids:
            valid, _ = validate_national_id(nid)
            self.assertFalse(valid, f'{nid} should be invalid')

class TestPasswordValidation(unittest.TestCase):
    def test_strong_passwords(self):
        strong = [
            'SecurePass123!',
            'MyP@ssw0rd2024',
            'Str0ng!Pass#Word',
        ]
        for pw in strong:
            valid, issues = validate_password_strength(pw)
            self.assertTrue(valid, f'{pw} should be valid')
            self.assertEqual(len(issues), 0)
    
    def test_weak_passwords(self):
        weak = [
            'short',
            'alllowercase',
            '12345678',
            'nouppercase123!',
        ]
        for pw in weak:
            valid, issues = validate_password_strength(pw)
            self.assertFalse(valid, f'{pw} should be invalid')
            self.assertGreater(len(issues), 0)

if __name__ == '__main__':
    unittest.main()
