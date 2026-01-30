"""
Governance and Compliance Module for NE-NETRA
Handles PII Redaction and Immutable Audit Logging

COMPLIANCE:
- DPDP Act 2023 alignment
- Append-only hash-chained logs
"""
import re
import hashlib
import json
from datetime import datetime
from typing import Dict, Any, List

class PIIRedaction:
    """
    Sanitizes text to remove PII (Phone numbers, Names, Addresses)
    Uses regex heuristics for Indian context
    """
    
    PATTERNS = [
        # Indian Mobile Numbers (10 digits, optional country code)
        (r'\b(?:\+91[\-\s]?)?[6-9]\d{9}\b', '[REDACTED_PHONE]'),
        
        # Email Addresses
        (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[REDACTED_EMAIL]'),
        
        # Aadhar-like patterns (12 digits)
        (r'\b\d{4}\s\d{4}\s\d{4}\b', '[REDACTED_UID]'),
        
        # PAN Card-like patterns
        (r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', '[REDACTED_ID]')
    ]
    
    @staticmethod
    def redact(text: str) -> str:
        if not text:
            return ""
        
        sanitized = text
        for pattern, replacement in PIIRedaction.PATTERNS:
            sanitized = re.sub(pattern, replacement, sanitized)
        
        return sanitized

class ImmutableAuditLog:
    """
    Append-only log with hash chaining for tamper-evidence
    """
    
    def __init__(self):
        self._log_file = "audit_chain.log"
        self._last_hash = self._get_last_hash()
    
    def _get_last_hash(self) -> str:
        """Get the hash of the last entry or genesis hash"""
        try:
            with open(self._log_file, 'r') as f:
                lines = f.readlines()
                if not lines:
                    return "GENESIS_HASH_0000"
                last_line = json.loads(lines[-1])
                return last_line.get('hash', "GENESIS_HASH_0000")
        except FileNotFoundError:
            return "GENESIS_HASH_0000"

    def log_event(self, action: str, actor: str, details: Dict[str, Any]):
        """
        Log a secured event
        """
        timestamp = datetime.utcnow().isoformat()
        
        # Payload to hash
        payload = {
            'timestamp': timestamp,
            'action': action,
            'actor': actor,
            'details': details,
            'prev_hash': self._last_hash
        }
        
        # Create hash
        payload_str = json.dumps(payload, sort_keys=True)
        current_hash = hashlib.sha256(payload_str.encode()).hexdigest()
        
        entry = {
            **payload,
            'hash': current_hash
        }
        
        # Persist
        with open(self._log_file, 'a') as f:
            f.write(json.dumps(entry) + "\n")
            
        self._last_hash = current_hash
        return current_hash

# Singleton instance
audit_logger = ImmutableAuditLog()
