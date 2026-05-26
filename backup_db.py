#!/usr/bin/env python3
"""
Database Backup Script for YoCoin
Run via cron: 0 2 * * * /path/to/python /path/to/backup_db.py
"""
import os
import subprocess
import gzip
import shutil
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

BACKUP_DIR = os.path.join(os.path.dirname(__file__), 'backups')
RETENTION_DAYS = 30

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'yocoin_user')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'securepassword123')
DB_NAME = os.getenv('DB_NAME', 'yocoin_db')

def create_backup():
    """Create a compressed database backup"""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = os.path.join(BACKUP_DIR, f'yocoin_backup_{timestamp}.sql')
    compressed_file = backup_file + '.gz'
    
    env = os.environ.copy()
    env['MYSQL_PWD'] = DB_PASSWORD
    
    try:
        cmd = [
            'mysqldump',
            '-h', DB_HOST,
            '-u', DB_USER,
            '--single-transaction',
            '--routines',
            '--triggers',
            DB_NAME
        ]
        
        with open(backup_file, 'w') as f:
            subprocess.run(cmd, stdout=f, env=env, check=True)
        
        with open(backup_file, 'rb') as f_in:
            with gzip.open(compressed_file, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        os.remove(backup_file)
        
        file_size = os.path.getsize(compressed_file) / (1024 * 1024)
        print(f'Backup created: {compressed_file} ({file_size:.2f} MB)')
        
        cleanup_old_backups()
        
        return True
    except subprocess.CalledProcessError as e:
        print(f'Backup failed: {e}')
        if os.path.exists(backup_file):
            os.remove(backup_file)
        return False
    except Exception as e:
        print(f'Backup error: {e}')
        return False

def cleanup_old_backups():
    """Remove backups older than retention period"""
    cutoff = datetime.now() - timedelta(days=RETENTION_DAYS)
    
    for filename in os.listdir(BACKUP_DIR):
        if filename.startswith('yocoin_backup_') and filename.endswith('.sql.gz'):
            filepath = os.path.join(BACKUP_DIR, filename)
            file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
            if file_time < cutoff:
                os.remove(filepath)
                print(f'Removed old backup: {filename}')

def restore_backup(backup_file):
    """Restore database from a backup file"""
    env = os.environ.copy()
    env['MYSQL_PWD'] = DB_PASSWORD
    
    try:
        if backup_file.endswith('.gz'):
            with gzip.open(backup_file, 'rb') as f:
                subprocess.run(
                    ['mysql', '-h', DB_HOST, '-u', DB_USER, DB_NAME],
                    stdin=f, env=env, check=True
                )
        else:
            with open(backup_file, 'r') as f:
                subprocess.run(
                    ['mysql', '-h', DB_HOST, '-u', DB_USER, DB_NAME],
                    stdin=f, env=env, check=True
                )
        print(f'Restored from: {backup_file}')
        return True
    except Exception as e:
        print(f'Restore failed: {e}')
        return False

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'restore':
        if len(sys.argv) < 3:
            print('Usage: python backup_db.py restore <backup_file>')
            sys.exit(1)
        restore_backup(sys.argv[2])
    else:
        create_backup()
