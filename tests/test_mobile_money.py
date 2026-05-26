"""Tests for mobile money module"""
import unittest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mobile_money import MTNMoMoAPI, AirtelMoneyAPI, MobileMoneyService

class TestMTNMoMoAPI(unittest.TestCase):
    def setUp(self):
        self.api = MTNMoMoAPI()
    
    def test_format_phone_mtn(self):
        self.assertEqual(self.api._format_phone('+256772123456'), '256772123456')
        self.assertEqual(self.api._format_phone('0772123456'), '256772123456')
        self.assertEqual(self.api._format_phone('256772123456'), '256772123456')
    
    def test_disburse_not_configured(self):
        success, txn_id, message = self.api.disburse(10000, '+256772123456')
        self.assertFalse(success)
        self.assertIn('not configured', message.lower())
    
    def test_collect_not_configured(self):
        success, txn_id, message = self.api.collect_payment(10000, '+256772123456')
        self.assertFalse(success)
        self.assertIn('not configured', message.lower())

class TestAirtelMoneyAPI(unittest.TestCase):
    def setUp(self):
        self.api = AirtelMoneyAPI()
    
    def test_format_phone_airtel(self):
        self.assertEqual(self.api._format_phone('+256702123456'), '256702123456')
        self.assertEqual(self.api._format_phone('0702123456'), '256702123456')
    
    def test_disburse_not_configured(self):
        success, txn_id, message = self.api.disburse(10000, '+256702123456')
        self.assertFalse(success)
        self.assertIn('not configured', message.lower())

class TestMobileMoneyService(unittest.TestCase):
    def setUp(self):
        self.service = MobileMoneyService()
    
    def test_detect_mtn(self):
        self.assertEqual(self.service.detect_provider('+256772123456'), 'mtn')
        self.assertEqual(self.service.detect_provider('+256782123456'), 'mtn')
    
    def test_detect_airtel(self):
        self.assertEqual(self.service.detect_provider('+256752123456'), 'airtel')
        self.assertEqual(self.service.detect_provider('+256792123456'), 'airtel')
    
    def test_disburse_not_configured(self):
        success, txn_id, message, provider = self.service.disburse(
            10000, '+256772123456', 'mtn'
        )
        self.assertFalse(success)
        self.assertEqual(provider, 'mtn')
    
    def test_collect_not_configured(self):
        success, txn_id, message, provider = self.service.collect_payment(
            10000, '+256752123456', 'airtel'
        )
        self.assertFalse(success)
        self.assertEqual(provider, 'airtel')

if __name__ == '__main__':
    unittest.main()
