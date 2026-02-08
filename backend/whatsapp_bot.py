"""
WhatsApp Bot - Interactive Commands

Handles WhatsApp messages via Twilio API
"""

from twilio.rest import Client
from typing import Dict, Optional
import os

class WhatsAppBot:
    """WhatsApp Bot for risk queries and alerts"""
    
    def __init__(self, account_sid: str, auth_token: str, from_number: str, db_connection):
        self.client = Client(account_sid, auth_token)
        self.from_number = from_number
        self.db = db_connection
    
    def handle_incoming_message(self, from_number: str, message: str) -> str:
        """Process incoming WhatsApp message and return response"""
        message = message.strip().upper()
        
        # Log interaction
        self._log_interaction(from_number, message)
        
        # Route to appropriate handler
        if message.startswith('RISK'):
            return self._handle_risk_query(message, from_number)
        elif message.startswith('SUBSCRIBE'):
            return self._handle_subscribe(message, from_number)
        elif message == 'STOP' or message == 'UNSUBSCRIBE':
            return self._handle_unsubscribe(from_number)
        elif message == 'HELP' or message == '?':
            return self._handle_help()
        elif message.startswith('ALERTS'):
            return self._handle_alerts_query(message, from_number)
        else:
            return self._handle_unknown(message)
    
    def _handle_risk_query(self, message: str, phone: str) -> str:
        """Handle RISK <district> command"""
        parts = message.split()
        
        if len(parts) < 2:
            return "❌ Please specify a district.\nExample: RISK IMPHAL WEST"
        
        district = ' '.join(parts[1:])
        
        # Get current risk score
        result = self.db.query_one("""
            SELECT score, risk_level 
            FROM risk_scores 
            WHERE district = %s 
            ORDER BY date DESC LIMIT 1
        """, (district,))
        
        if not result:
            return f"❌ District '{district}' not found.\nTry: HELP for available districts"
        
        # Get signal count (24h)
        signal_count = self.db.query_one("""
            SELECT COUNT(*) as count
            FROM signals
            WHERE district = %s 
            AND timestamp >= NOW() - INTERVAL '24 hours'
        """, (district,))['count']
        
        # Format response
        emoji = self._get_risk_emoji(result['risk_level'])
        
        response = f"""
{emoji} *{district}*
Risk Score: *{result['score']}/100* ({result['risk_level'].upper()})
Signals (24h): {signal_count}

Send SUBSCRIBE {district} to get alerts
Send HELP for more commands
        """.strip()
        
        return response
    
    def _handle_subscribe(self, message: str, phone: str) -> str:
        """Handle SUBSCRIBE <district> command"""
        parts = message.split()
        
        if len(parts) < 2:
            return "❌ Please specify a district.\nExample: SUBSCRIBE IMPHAL WEST"
        
        district = ' '.join(parts[1:])
        
        # Check if district exists
        exists = self.db.query_one("""
            SELECT COUNT(*) as count FROM risk_scores WHERE district = %s
        """, (district,))['count'] > 0
        
        if not exists:
            return f"❌ District '{district}' not found."
        
        # Subscribe
        self.db.execute("""
            INSERT INTO sms_subscribers (phone_number, district, is_active)
            VALUES (%s, %s, true)
            ON CONFLICT (phone_number, district) 
            DO UPDATE SET is_active = true
        """, (phone, district))
        
        return f"✅ Subscribed to {district} alerts.\n\nYou'll receive WhatsApp messages when risk level is HIGH or CRITICAL.\n\nSend STOP to unsubscribe."
    
    def _handle_unsubscribe(self, phone: str) -> str:
        """Handle STOP command"""
        self.db.execute("""
            UPDATE sms_subscribers 
            SET is_active = false 
            WHERE phone_number = %s
        """, (phone,))
        
        return "✅ Unsubscribed from all alerts.\n\nSend SUBSCRIBE <district> to re-subscribe anytime."
    
    def _handle_alerts_query(self, message: str, phone: str) -> str:
        """Handle ALERTS command - show recent alerts"""
        alerts = self.db.query("""
            SELECT district, score, risk_level, date
            FROM risk_scores
            WHERE risk_level IN ('high', 'critical')
            AND date >= CURRENT_DATE - INTERVAL '3 days'
            ORDER BY score DESC
            LIMIT 5
        """)
        
        if not alerts:
            return "✅ No critical alerts in the past 3 days."
        
        response = "🚨 *Recent High-Risk Alerts*\n\n"
        for alert in alerts:
            emoji = self._get_risk_emoji(alert['risk_level'])
            response += f"{emoji} {alert['district']}: {alert['score']}/100\n"
        
        response += "\nSend RISK <district> for details"
        return response
    
    def _handle_help(self) -> str:
        """Show available commands"""
        return """
📱 *NE-NETRA WhatsApp Bot*

*Available Commands:*

🔍 RISK <district>
   Get current risk score

🔔 SUBSCRIBE <district>
   Subscribe to high-risk alerts

🛑 STOP
   Unsubscribe from all alerts

🚨 ALERTS
   Recent high-risk alerts

❓ HELP
   Show this message

*Example Districts:*
Imphal West, Imphal East, Churachandpur, Thoubal, Bishnupur

*Need help?* Contact support
        """.strip()
    
    def _handle_unknown(self, message: str) -> str:
        """Handle unknown commands"""
        return"❌ Unknown command.\n Send HELP for available commands."
    
    def send_alert(self, phone: str, district: str, risk_score: int, risk_level: str):
        """Send risk alert via WhatsApp"""
        emoji = self._get_risk_emoji(risk_level)
        
        message = f"""
{emoji} *ALERT: {district}*

Risk Score: *{risk_score}/100* ({risk_level.upper()})

This is an automated alert from NE-NETRA.

Send STOP to unsubscribe
Send RISK {district} for details
        """.strip()
        
        try:
            self.client.messages.create(
                from_=f'whatsapp:{self.from_number}',
                to=f'whatsapp:{phone}',
                body=message
            )
            return True
        except Exception as e:
            print(f"Failed to send WhatsApp: {e}")
            return False
    
    def _get_risk_emoji(self, risk_level: str) -> str:
        """Get emoji for risk level"""
        emojis = {
            'low': '🟢',
            'medium': '🟡',
            'high': '🟠',
            'critical': '🔴'
        }
        return emojis.get(risk_level.lower(), '⚪')
    
    def _log_interaction(self, phone: str, message: str):
        """Log WhatsApp interaction"""
        self.db.execute("""
            INSERT INTO whatsapp_log (phone_number, message, created_at)
            VALUES (%s, %s, NOW())
        """, (phone, message))
