import hashlib
import json
from time import time
from typing import List, Dict, Any, Optional
import uuid

class Block:
    def __init__(self, index: int, timestamp: float, transactions: List[Dict], proof: int, previous_hash: str):
        self.index = index
        self.timestamp = timestamp
        self.transactions = transactions
        self.proof = proof
        self.previous_hash = previous_hash
        self.hash = self.compute_hash()

    def compute_hash(self) -> str:
        block_dict = {
            'index': self.index,
            'timestamp': self.timestamp,
            'transactions': self.transactions,
            'proof': self.proof,
            'previous_hash': self.previous_hash
        }
        return hashlib.sha256(json.dumps(block_dict, sort_keys=True).encode()).hexdigest()

    def to_dict(self) -> Dict:
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'transactions': self.transactions,
            'proof': self.proof,
            'previous_hash': self.previous_hash,
            'hash': self.hash
        }

class Blockchain:
    def __init__(self, mysql=None):
        self.mysql = mysql
        self.chain: List[Block] = []
        self.current_transactions: List[Dict] = []
        self._load_from_db()
        if not self.chain:
            self.new_block(previous_hash='1', proof=100)

    def _load_from_db(self):
        """Load blockchain state from database on startup"""
        if not self.mysql:
            return
        try:
            cursor = self.mysql.connection.cursor()
            cursor.execute('SELECT block_index, block_hash, previous_hash, proof, timestamp FROM blockchain_blocks ORDER BY block_index ASC')
            blocks = cursor.fetchall()

            for block_data in blocks:
                cursor.execute('''
                    SELECT transaction_id, sender_address, recipient_address, amount, message, timestamp
                    FROM blockchain_transactions WHERE block_index = %s ORDER BY transaction_id ASC
                ''', (block_data['block_index'],))
                transactions = cursor.fetchall()

                tx_list = []
                for tx in transactions:
                    tx_list.append({
                        'tx_id': tx['transaction_id'],
                        'sender': tx['sender_address'],
                        'recipient': tx['recipient_address'],
                        'amount': float(tx['amount']),
                        'message': tx['message'] or ''
                    })

                block = Block(
                    index=block_data['block_index'],
                    timestamp=block_data['timestamp'].timestamp() if hasattr(block_data['timestamp'], 'timestamp') else time(),
                    transactions=tx_list,
                    proof=block_data['proof'],
                    previous_hash=block_data['previous_hash']
                )
                self.chain.append(block)

            cursor.close()
        except Exception:
            pass

    def persist_block(self, block: Block):
        """Persist a new block and its transactions to the database"""
        if not self.mysql:
            return
        try:
            cursor = self.mysql.connection.cursor()
            cursor.execute('''
                INSERT INTO blockchain_blocks (block_index, block_hash, previous_hash, proof, timestamp)
                VALUES (%s, %s, %s, %s, FROM_UNIXTIME(%s))
            ''', (block.index, block.hash, block.previous_hash, block.proof, block.timestamp))

            for tx in block.transactions:
                tx_hash = hashlib.sha256(json.dumps(tx, sort_keys=True).encode()).hexdigest()
                cursor.execute('''
                    INSERT INTO blockchain_transactions
                    (transaction_id, block_index, sender_address, recipient_address, amount, message, transaction_hash, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, FROM_UNIXTIME(%s))
                ''', (
                    tx.get('tx_id', str(uuid.uuid4())),
                    block.index,
                    tx['sender'],
                    tx['recipient'],
                    tx['amount'],
                    tx.get('message', ''),
                    tx_hash,
                    block.timestamp
                ))

            self.mysql.connection.commit()
            cursor.close()
        except Exception as e:
            self.mysql.connection.rollback()
            raise e

    def new_block(self, proof: int, previous_hash: str = None) -> Block:
        block = Block(
            index=len(self.chain) + 1,
            timestamp=time(),
            transactions=self.current_transactions.copy(),
            proof=proof,
            previous_hash=previous_hash or self.last_block.hash if self.chain else '1'
        )
        self.current_transactions = []
        self.chain.append(block)
        self.persist_block(block)
        return block

    @staticmethod
    def hash_block(block: Block) -> str:
        return block.compute_hash()

    @property
    def last_block(self) -> Block:
        return self.chain[-1]

    def add_transaction(self, sender: str, recipient: str, amount: float, message: str = '') -> str:
        tx_id = str(uuid.uuid4())
        self.current_transactions.append({
            'tx_id': tx_id,
            'sender': sender,
            'recipient': recipient,
            'amount': amount,
            'message': message
        })
        return tx_id

    def proof_of_work(self, last_proof: int) -> int:
        target = '0000'
        proof = 0
        while not hashlib.sha256(f'{last_proof}{proof}'.encode()).hexdigest().startswith(target):
            proof += 1
        return proof

    def verify_chain(self) -> bool:
        """Verify the integrity of the blockchain"""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            if current.previous_hash != previous.hash:
                return False

            if current.hash != current.compute_hash():
                return False

        return True

    def get_balance(self, address: str) -> float:
        """Calculate balance for an address from blockchain transactions"""
        balance = 0.0
        for block in self.chain:
            for tx in block.transactions:
                if tx['sender'] == address:
                    balance -= tx['amount']
                if tx['recipient'] == address:
                    balance += tx['amount']
        return balance
