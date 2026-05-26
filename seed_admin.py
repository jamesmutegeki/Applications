"""
Seed Admin User for YoCoin
Run: python seed_admin.py
Creates admin@yocoin.ug with password: Admin@123
"""
import os
import uuid
import bcrypt
import MySQLdb
from dotenv import load_dotenv

load_dotenv('YoCoin.env')

ADMIN_EMAIL = 'admin@yocoin.ug'
ADMIN_PASSWORD = 'Admin@123'

def seed_admin():
    conn = MySQLdb.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'yocoin_user'),
        passwd=os.getenv('DB_PASSWORD', 'securepassword123'),
        db=os.getenv('DB_NAME', 'yocoin_db')
    )
    cursor = conn.cursor()
    
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (ADMIN_EMAIL,))
    existing = cursor.fetchone()
    
    if existing:
        admin_id = existing[0]
        print(f"Admin user already exists: {ADMIN_EMAIL} (ID: {admin_id})")
    else:
        admin_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO users (user_id, name, email, phone, region, national_id, kyc_status, credit_score, is_verified)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (admin_id, 'System Admin', ADMIN_EMAIL, '+256700000001', 'Central', 'ADMIN0000000000001', 'verified', 750, True))
        
        hashed = bcrypt.hashpw(ADMIN_PASSWORD.encode('utf-8'), bcrypt.gensalt(rounds=4))
        cursor.execute('''
            INSERT INTO user_auth (user_id, password_hash, salt, recovery_question, recovery_answer_hash)
            VALUES (%s, %s, %s, %s, %s)
        ''', (admin_id, hashed.decode(), '', 'What city were you born in?', bcrypt.hashpw(b'kampala', bcrypt.gensalt(rounds=4)).decode()))
        
        cursor.execute('INSERT INTO token_balances (address, balance) VALUES (%s, 0)', (admin_id,))
        cursor.execute('INSERT INTO admins (user_id, role) VALUES (%s, %s)', (admin_id, 'admin'))
        conn.commit()
        print(f"Admin user created: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    
    cursor.close()
    conn.close()
    print("\nAdmin Credentials:")
    print(f"  Email:    {ADMIN_EMAIL}")
    print(f"  Password: {ADMIN_PASSWORD}")
    print(f"  URL:      http://localhost:5000/login")

if __name__ == '__main__':
    seed_admin()
