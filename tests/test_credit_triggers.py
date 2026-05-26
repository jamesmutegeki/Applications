"""Tests for credit score triggers module"""
import unittest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from credit_triggers import (
    _on_repayment, _on_default, _on_loan_approved, _on_loan_rejected,
    _on_kyc_verified, _on_loan_repaid, _on_late_payment
)

class MockCursor:
    def __init__(self, results=None):
        self._results = results or {}
        self._rowcount = 0
    
    def execute(self, query, params=None):
        pass
    
    def fetchone(self):
        return {'cnt': 0, 'streak': 0}

class TestCreditTriggers(unittest.TestCase):
    def test_on_repayment_on_time(self):
        cursor = MockCursor()
        score = _on_repayment(cursor, 'user1', 600, {
            'amount': 50000,
            'loan_amount': 100000,
            'was_on_time': True,
            'days_early': 0
        })
        self.assertGreater(score, 600)
    
    def test_on_repayment_late(self):
        cursor = MockCursor()
        score = _on_repayment(cursor, 'user1', 600, {
            'amount': 50000,
            'loan_amount': 100000,
            'was_on_time': False
        })
        self.assertLess(score, 600)
    
    def test_on_default(self):
        cursor = MockCursor()
        score = _on_default(cursor, 'user1', 600, {
            'loan_amount': 100000,
            'days_overdue': 15
        })
        self.assertLess(score, 600)
    
    def test_on_loan_approved_first(self):
        cursor = MockCursor({'cnt': 0})
        score = _on_loan_approved(cursor, 'user1', 600, {})
        self.assertGreaterEqual(score, 600)
    
    def test_on_kyc_verified(self):
        cursor = MockCursor()
        score = _on_kyc_verified(cursor, 'user1', 600)
        self.assertEqual(score, 610)
    
    def test_on_loan_repaid(self):
        cursor = MockCursor()
        score = _on_loan_repaid(cursor, 'user1', 600, {})
        self.assertGreater(score, 600)
    
    def test_on_late_payment(self):
        cursor = MockCursor()
        score = _on_late_payment(cursor, 'user1', 600, {'days_late': 5})
        self.assertLess(score, 600)
    
    def test_score_bounds(self):
        cursor = MockCursor()
        score_high = _on_repayment(cursor, 'user1', 840, {
            'amount': 100000,
            'loan_amount': 100000,
            'was_on_time': True,
            'days_early': 0
        })
        self.assertLessEqual(score_high, 855)
        
        score_low = _on_default(cursor, 'user1', 310, {
            'loan_amount': 100000,
            'days_overdue': 30
        })
        self.assertLess(score_low, 310)

if __name__ == '__main__':
    unittest.main()
