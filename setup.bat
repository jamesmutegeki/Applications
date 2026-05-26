@echo off
cd /d "%~dp0"
echo Installing dependencies...
call .venv\Scripts\activate.bat
pip install -r requirements.txt
echo.
echo Setting up database (enter MySQL root password when prompted)...
echo C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql -u root -p ^< YoCoin.sql
echo C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql -u root -p yocoin_db ^< migration_v2.sql
echo C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql -u root -p yocoin_db ^< fix_all.sql
echo.
echo Seeding admin user...
python seed_admin.py
echo.
echo Setup complete! Run run.bat to start the app.
pause