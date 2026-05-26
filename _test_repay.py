import MySQLdb, uuid, datetime

conn = MySQLdb.connect(host='localhost', user='yocoin_user', passwd='securepassword123', db='yocoin_db')
cur = conn.cursor()

uid = 'fd860c20-8bfd-482d-b6ac-2f4a8a8b1efa'
loan_id = '1e552570-4049-44bb-981b-6d559e5a6236'

# Get loan's due_date
cur.execute('SELECT due_date FROM loans WHERE loan_id = %s', (loan_id,))
loan = cur.fetchone()
print(f"Loan due_date: {loan[0]}")

repayment_id = str(uuid.uuid4())
try:
    cur.execute("""
        INSERT INTO loan_repayments (repayment_id, loan_id, user_id, amount, due_date, payment_method, payment_date, status)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), 'paid')
    """, (repayment_id, loan_id, uid, 1000.00, loan[0], 'mobile_money'))
    conn.commit()
    print("INSERT succeeded")
    conn.rollback()
except Exception as e:
    conn.rollback()
    print(f"INSERT failed: {e}")

# Also test token_balances update
print("\n=== Testing token_balance UPDATE ===")
try:
    cur.execute('UPDATE token_balances SET balance = balance + 1000 WHERE address = %s', (uid,))
    conn.commit()
    cur.execute('SELECT balance FROM token_balances WHERE address = %s', (uid,))
    print(f"Balance after update: {cur.fetchone()[0]}")
    conn.rollback()
except Exception as e:
    conn.rollback()
    print(f"UPDATE failed: {e}")

# Test the blockchain stuff
print("\n=== Testing blockchain new_block ===")
try:
    from blockchain import Blockchain
    bc = Blockchain(mysql=None)  # No DB to avoid persist_block commit
    from decimal import Decimal
    bc.add_transaction(uid, 'YoCoin System', 1000.0, 'Test')
    proof = bc.proof_of_work(0)
    block = bc.new_block(proof)
    print(f"Block created: index={block.index}, hash={block.hash[:16]}...")
except Exception as e:
    print(f"Blockchain failed: {e}")

cur.close()
conn.close()
