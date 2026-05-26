"""Integration tests for YoCoin Flask application"""
import unittest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from YoCoin import app

class TestFlaskRoutes(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        self.client = app.test_client()
    
    def test_home_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
    
    def test_login_page(self):
        response = self.client.get('/login')
        self.assertEqual(response.status_code, 200)
    
    def test_register_page(self):
        response = self.client.get('/register')
        self.assertEqual(response.status_code, 200)
    
    def test_terms_page(self):
        response = self.client.get('/terms')
        self.assertEqual(response.status_code, 200)
    
    def test_privacy_page(self):
        response = self.client.get('/privacy')
        self.assertEqual(response.status_code, 200)
    
    def test_help_page(self):
        response = self.client.get('/help')
        self.assertEqual(response.status_code, 200)
    
    def test_dashboard_requires_login(self):
        response = self.client.get('/dashboard')
        self.assertEqual(response.status_code, 302)
    
    def test_apply_loan_requires_login(self):
        response = self.client.get('/apply_loan')
        self.assertEqual(response.status_code, 302)
    
    def test_profile_requires_login(self):
        response = self.client.get('/profile')
        self.assertEqual(response.status_code, 302)
    
    def test_admin_requires_login(self):
        response = self.client.get('/admin')
        self.assertEqual(response.status_code, 302)
    
    def test_kyc_upload_requires_login(self):
        response = self.client.get('/kyc/upload')
        self.assertEqual(response.status_code, 302)
    
    def test_repayment_requires_login(self):
        response = self.client.get('/repayment')
        self.assertEqual(response.status_code, 302)
    
    def test_logout_redirects(self):
        response = self.client.get('/logout')
        self.assertEqual(response.status_code, 302)
    
    def test_password_reset_page(self):
        response = self.client.get('/password-reset')
        self.assertEqual(response.status_code, 200)

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()
    
    def test_notifications_requires_login(self):
        response = self.client.get('/api/notifications')
        self.assertEqual(response.status_code, 302)

class TestFormValidation(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        self.client = app.test_client()
    
    def test_login_invalid_email(self):
        response = self.client.post('/login', data={
            'email': 'not-an-email',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 200)
    
    def test_register_missing_fields(self):
        response = self.client.post('/register', data={})
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()
