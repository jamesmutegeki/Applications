from validators import validate_uganda_phone, validate_national_id, validate_password_strength
from credit_scoring import get_score_tier
from loan_manager import generate_repayment_schedule, get_days_until_due
from security import sanitize_input

v, n = validate_uganda_phone('+256712345678')
print(f'Phone +256: valid={v}, normalized={n}')
assert v is True

v, n = validate_uganda_phone('0712345678')
print(f'Phone 0XXX: valid={v}, normalized={n}')
assert v is True

v, e = validate_national_id('CM91412102ABCDEFG')
print(f'National ID: valid={v}')
assert v is True

v, issues = validate_password_strength('StrongPass123')
print(f'Password: valid={v}, issues={issues}')
assert v is True

tier = get_score_tier(750)
print(f'Score 750: tier={tier["tier"]}')
assert tier["tier"] == "Excellent"

schedule = generate_repayment_schedule(1000000, 5.0, 12)
print(f'Schedule: {len(schedule)} installments, monthly={schedule[0]["amount"]}')
assert len(schedule) == 12

result = sanitize_input('<script>alert(1)</script>')
print(f'Sanitized: {result}')
assert '<script>' not in result

print('\nAll tests passed!')
