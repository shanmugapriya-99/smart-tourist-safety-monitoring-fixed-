"""
Blockchain Implementation for Smart Tourist Safety & Digital ID System
Simulated Proof-of-Authority/Proof-of-Work SHA-256 Blockchain for Academic Project Demonstration.
Records tamper-evident hashes of:
1. Tourist Digital ID issuance and verification
2. Emergency SOS Incident triggers and responses
3. Critical Geo-fence breach logs
"""
import hashlib
import json
import time
from datetime import datetime

class Block:
    def __init__(self, index, timestamp, data, previous_hash, nonce=0, block_hash=None):
        self.index = index
        self.timestamp = timestamp or datetime.utcnow().isoformat()
        self.data = data  # Dictionary containing transaction payload (Digital ID, Incident Hash, etc.)
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.hash = block_hash or self.calculate_hash()

    def calculate_hash(self):
        """Calculates SHA-256 hash of the block contents"""
        # Ensure consistent serialized data string
        data_string = json.dumps(self.data, sort_keys=True)
        block_string = f"{self.index}{self.timestamp}{data_string}{self.previous_hash}{self.nonce}"
        return hashlib.sha256(block_string.encode('utf-8')).hexdigest()

    def mine_block(self, difficulty=2):
        """Simple Proof-of-Work mining for demonstration"""
        target = "0" * difficulty
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
        return self.hash

    def to_dict(self):
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
            "hash": self.hash
        }


class SafetyBlockchain:
    def __init__(self, difficulty=2):
        self.difficulty = difficulty
        self.chain = []
        self.create_genesis_block()

    def create_genesis_block(self):
        """Creates the initial genesis block"""
        genesis_data = {
            "type": "GENESIS",
            "system": "Smart Tourist Safety & Digital ID Network",
            "version": "1.0.0-Academic-Demo",
            "authority": "Global Tourist Safety Command Center",
            "message": "Genesis Block Initialized. Digital IDs and Incident logs are tamper-evident."
        }
        genesis_block = Block(0, "2026-01-01T00:00:00Z", genesis_data, "0" * 64, nonce=0)
        genesis_block.mine_block(self.difficulty)
        self.chain.append(genesis_block)

    def get_latest_block(self):
        return self.chain[-1]

    def add_block(self, data):
        """Mines and appends a new block with the given payload"""
        prev_block = self.get_latest_block()
        new_block = Block(
            index=len(self.chain),
            timestamp=datetime.utcnow().isoformat(),
            data=data,
            previous_hash=prev_block.hash
        )
        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)
        return new_block

    def record_digital_id(self, tourist_id, name_hash, phone_hash, issue_date):
        """Mints a digital identity verification record onto the blockchain"""
        payload = {
            "type": "DIGITAL_ID_ISSUANCE",
            "tourist_id": tourist_id,
            "identity_hash": hashlib.sha256(f"{tourist_id}:{name_hash}:{phone_hash}".encode()).hexdigest(),
            "issued_at": issue_date,
            "verification_status": "VERIFIED_ACTIVE"
        }
        return self.add_block(payload)

    def record_sos_incident(self, incident_id, tourist_id, latitude, longitude, incident_type, severity):
        """Records an SOS emergency event immutably onto the ledger"""
        payload = {
            "type": "SOS_INCIDENT_RECORD",
            "incident_id": incident_id,
            "tourist_id": tourist_id,
            "coordinates_hash": hashlib.sha256(f"{latitude},{longitude}".encode()).hexdigest(),
            "incident_type": incident_type,
            "severity": severity,
            "timestamp": datetime.utcnow().isoformat()
        }
        return self.add_block(payload)

    def record_incident_resolution(self, incident_id, responder_name, notes):
        """Records the resolution of an emergency on the blockchain"""
        payload = {
            "type": "INCIDENT_RESOLUTION",
            "incident_id": incident_id,
            "responder": responder_name,
            "resolution_notes_hash": hashlib.sha256(notes.encode()).hexdigest(),
            "resolved_at": datetime.utcnow().isoformat()
        }
        return self.add_block(payload)

    def is_chain_valid(self):
        """
        Cryptographically validates the entire blockchain integrity.
        Returns (is_valid: bool, error_message: str or None, corrupted_index: int or None)
        """
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            # 1. Recalculate hash of current block
            expected_hash = current.calculate_hash()
            if current.hash != expected_hash:
                return False, f"Block #{current.index} data has been TAMPERED! Hash mismatch.", current.index

            # 2. Check if previous_hash pointer matches
            if current.previous_hash != previous.hash:
                return False, f"Block #{current.index} previous_hash pointer broken! Expected {previous.hash[:16]}..., found {current.previous_hash[:16]}...", current.index

        return True, "Blockchain integrity verified. All cryptographic hashes and link pointers match.", None

    def tamper_block_for_demo(self, block_index, fake_data_key="tampered", fake_value="ILLEGAL_MODIFICATION"):
        """
        Academic demonstration helper: artificially modifies a block's data without remining,
        demonstrating how `is_chain_valid()` immediately flags the fraud.
        """
        if 0 <= block_index < len(self.chain):
            self.chain[block_index].data[fake_data_key] = fake_value
            return True, f"Block #{block_index} data artificially modified for demonstration."
        return False, "Invalid block index."

    def repair_chain_recompute(self):
        """Re-mines all blocks to restore valid chain status after demo tampering"""
        for i in range(1, len(self.chain)):
            self.chain[i].previous_hash = self.chain[i-1].hash
            self.chain[i].nonce = 0
            self.chain[i].mine_block(self.difficulty)
        return True, "Chain repaired and re-hashed."

    def to_list(self):
        return [b.to_dict() for b in self.chain]

    def load_from_list(self, block_list):
        if not block_list:
            return
        self.chain = []
        for b_dict in block_list:
            b = Block(
                index=b_dict["index"],
                timestamp=b_dict["timestamp"],
                data=b_dict["data"],
                previous_hash=b_dict["previous_hash"],
                nonce=b_dict.get("nonce", 0),
                block_hash=b_dict.get("hash")
            )
            self.chain.append(b)


# Global singleton instance for the backend process
safety_blockchain = SafetyBlockchain(difficulty=2)
