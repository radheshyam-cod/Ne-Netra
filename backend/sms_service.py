"""
SMS Gateway Service

Send SMS alerts for critical situations and low-connectivity areas.
"""

import os
from typing import List, Optional


class SMSService:
    """SMS sending service using Twilio"""
    
    def __init__(
        self,
        account_sid: Optional[str] = None,
        auth_token: Optional[str] = None,
        from_number: Optional[str] = None
    ):
        """Initialize Twilio SMS client"""
        self.account_sid = account_sid or os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = auth_token or os.getenv('TWILIO_AUTH_TOKEN')
        self.from_number = from_number or os.getenv('TWILIO_PHONE_NUMBER')
        
        try:
            from twilio.rest import Client
            if self.account_sid and self.auth_token:
                self.client = Client(self.account_sid, self.auth_token)
                self.enabled = True
            else:
                self.client = None
                self.enabled = False
        except ImportError:
            self.client = None
            self.enabled = False
    
    def send_sms(self, to: str, message: str) -> bool:
        """Send SMS to a phone number"""
        if not self.enabled:
            print(f"SMS not configured. Would send: {message} to {to}")
            return False
        
        try:
            msg = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=to
            )
            
            print(f"SMS sent: {msg.sid}")
            return True
            
        except Exception as e:
            print(f"SMS sending failed: {e}")
            return False
    
    def send_bulk_sms(self, recipients: List[str], message: str) -> Dict[str, int]:
        """Send SMS to multiple recipients"""
        results = {'sent': 0, 'failed': 0}
        
        for recipient in recipients:
            if self.send_sms(recipient, message):
                results['sent'] += 1
            else:
                results['failed'] += 1
        
        return results


class SMSAlertService:
    """High-level SMS alert service"""
    
    def __init__(self, db_connection, sms_service: SMSService):
        self.db = db_connection
        self.sms = sms_service
        self._ensure_tables()
    
    def _ensure_tables(self):
        """Create SMS subscriber tables"""
        self.db.execute("""
            CREATE TABLE IF NOT EXISTS sms_subscribers (
                id SERIAL PRIMARY KEY,
                phone_number VARCHAR(20) NOT NULL UNIQUE,
                district VARCHAR(100),
                alert_threshold INTEGER DEFAULT 75,  -- Min risk score to alert
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            );
            
            CREATE TABLE IF NOT EXISTS sms_log (
                id SERIAL PRIMARY KEY,
                phone_number VARCHAR(20) NOT NULL,
                message TEXT NOT NULL,
                success BOOLEAN NOT NULL,
                sent_at TIMESTAMP DEFAULT NOW()
            );
        """)
    
    def send_critical_alert(self, district: str, risk_score: float, message: str):
        """Send critical risk alert via SMS"""
        # Get subscribers for this district
        subscribers = self.db.query("""
            SELECT phone_number
            FROM sms_subscribers
            WHERE 
                is_active = true 
                AND (district = %s OR district IS NULL)
                AND alert_threshold <= %s
        """, (district, risk_score))
        
        if not subscribers:
            print(f"No SMS subscribers for {district}")
            return
        
        # Build SMS message (max 160 characters)
        sms_text = f"ALERT: {district} risk at {risk_score}/100. {message[:80]}"
        
        # Send to all subscribers
        for sub in subscribers:
            success = self.sms.send_sms(sub['phone_number'], sms_text)
            self._log_sms(sub['phone_number'], sms_text, success)
    
    def send_info_query_response(self, phone_number: str, district: str):
        """Respond to SMS query like 'RISK IMPHAL'"""
        # Get current risk score
        data = self.db.query_one("""
            SELECT score, risk_level
            FROM risk_scores
            WHERE district = %s AND date = CURRENT_DATE
        """, (district,))
        
        if not data:
            response = f"{district}: No data available"
        else:
            # Get recent signals count
            signal_count = self.db.query_one("""
                SELECT COUNT(*) as count
                FROM signals
                WHERE district = %s AND timestamp >= NOW() - INTERVAL '24 hours'
            """, (district,))
            
            response = (
                f"{district}: {data['score']}/100 ({data['risk_level'].upper()}). "
                f"{signal_count['count']} signals (24h)."
            )
        
        self.sms.send_sms(phone_number, response)
        self._log_sms(phone_number, response, True)
    
    def _log_sms(self, phone_number: str, message: str, success: bool):
        """Log SMS delivery"""
        try:
            self.db.execute("""
                INSERT INTO sms_log (phone_number, message, success)
                VALUES (%s, %s, %s)
            """, (phone_number, message, success))
        except Exception as e:
            print(f"SMS log failed: {e}")
    
    def subscribe(self, phone_number: str, district: Optional[str] = None) -> bool:
        """Subscribe phone number to SMS alerts"""
        try:
            self.db.execute("""
                INSERT INTO sms_subscribers (phone_number, district)
                VALUES (%s, %s)
                ON CONFLICT (phone_number) 
                DO UPDATE SET district = EXCLUDED.district, is_active = true
            """, (phone_number, district))
            
            # Send confirmation
            confirm_msg = f"Subscribed to NE-NETRA alerts{f' for {district}' if district else ''}. Reply STOP to unsubscribe."
            self.sms.send_sms(phone_number, confirm_msg)
            
            return True
        except Exception as e:
            print(f"SMS subscription failed: {e}")
            return False
    
    def unsubscribe(self, phone_number: str) -> bool:
        """Unsubscribe phone number"""
        try:
            self.db.execute("""
                UPDATE sms_subscribers
                SET is_active = false
                WHERE phone_number = %s
            """, (phone_number,))
            
            self.sms.send_sms(phone_number, "Unsubscribed from NE-NETRA alerts.")
            return True
        except Exception as e:
            print(f"SMS unsubscription failed: {e}")
            return False


# SMS Command Handler (for incoming SMS)
class SMSCommandHandler:
    """Handle incoming SMS commands"""
    
    def __init__(self, sms_alert_service: SMSAlertService):
        self.alerts = sms_alert_service
    
    def handle_incoming_sms(self, from_number: str, message: str):
        """Process incoming SMS command"""
        message_upper = message.strip().upper()
        
        # STOP command
        if message_upper == 'STOP':
            self.alerts.unsubscribe(from_number)
        
        # RISK <DISTRICT> command
        elif message_upper.startswith('RISK '):
            district = message[5:].strip().title()
            self.alerts.send_info_query_response(from_number, district)
        
        # SUBSCRIBE <DISTRICT> command
        elif message_upper.startswith('SUBSCRIBE '):
            district = message[10:].strip().title()
            self.alerts.subscribe(from_number, district)
        
        # HELP command
        elif message_upper == 'HELP':
            help_text = (
                "Commands:\n"
                "RISK <district> - Get risk score\n"
                "SUBSCRIBE <district> - Subscribe to alerts\n"
                "STOP - Unsubscribe"
            )
            self.alerts.sms.send_sms(from_number, help_text)
        
        else:
            # Unknown command
            self.alerts.sms.send_sms(from_number, "Unknown command. Reply HELP for commands.")
