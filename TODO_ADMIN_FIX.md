# Admin fix & error pass (notes)

## What was discovered
- `/admin` route uses `admin_required()` which checks `session['role'] == 'admin'`.
- `login()` previously never set `session['role']`, so admin access would always fail.
- `YoCoin.sql` does not include an admins table.

## Implemented approach
- Source-of-truth: separate `admins` table (Option C).
- `login()` now queries `admins` to set `session['role']`.

## Required follow-ups
1. Add `admins` table to `YoCoin.sql`.
2. Run migration / recreate DB.
3. Seed at least one admin user in `admins`.
4. Test `/admin` and `/admin/users`.

## Known schema mismatches to check after admin works
- `users.image_file` referenced in code but not present in shown `YoCoin.sql`.
- `loans.rejection_reason` referenced in code but not present in shown `YoCoin.sql`.

