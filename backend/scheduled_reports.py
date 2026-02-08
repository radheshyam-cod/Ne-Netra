"""
Scheduled Report Generator

Automated PDF/email reports sent on schedule.
"""

import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication


class EmailService:
    """Email sending service"""
    
    def __init__(
        self,
        smtp_host: str = None,
        smtp_port: int = 587,
        smtp_user: str = None,
        smtp_password: str = None
    ):
        """Initialize email service"""
        self.smtp_host = smtp_host or os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = smtp_port
        self.smtp_user = smtp_user or os.getenv('SMTP_USER')
        self.smtp_password = smtp_password or os.getenv('SMTP_PASSWORD')
        self.enabled = self.smtp_user and self.smtp_password
    
    def send_email(
        self,
        to: List[str],
        subject: str,
        body_html: str,
        attachments: List[Dict] = None
    ) -> bool:
        """Send email with optional attachments"""
        if not self.enabled:
            print("Email service not configured")
            return False
        
        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = ', '.join(to)
            msg['Subject'] = subject
            
            # Add HTML body
            msg.attach(MIMEText(body_html, 'html'))
            
            # Add attachments
            if attachments:
                for attachment in attachments:
                    part = MIMEApplication(attachment['data'], Name=attachment['filename'])
                    part['Content-Disposition'] = f'attachment; filename="{attachment["filename"]}"'
                    msg.attach(part)
            
            # Send
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            print(f"Email sent to {to}")
            return True
            
        except Exception as e:
            print(f"Email sending failed: {e}")
            return False


class ReportGenerator:
    """Automated report generation"""
    
    def __init__(self, db_connection, email_service: EmailService):
        self.db = db_connection
        self.email = email_service
    
    def generate_daily_digest(self) -> Dict:
        """Generate daily digest for all high-risk districts"""
        # Get high-risk districts
        districts = self.db.query("""
            SELECT district, score, risk_level
            FROM risk_scores
            WHERE date = CURRENT_DATE AND score >= 60
            ORDER BY score DESC
        """)
        
        if not districts:
            return {"districts": 0, "message": "No high-risk districts"}
        
        # Build HTML report
        html = self._build_daily_digest_html(districts)
        
        # Get subscriber list
        subscribers = self._get_subscribers('daily_digest')
        
        # Send email
        subject = f"NE-NETRA Daily Digest - {datetime.now().strftime('%Y-%m-%d')}"
        success = self.email.send_email(
            to=subscribers,
            subject=subject,
            body_html=html
        )
        
        return {
            "districts": len(districts),
            "subscribers": len(subscribers),
            "sent": success
        }
    
    def generate_weekly_report(self, district: str) -> bool:
        """Generate comprehensive weekly PDF report"""
        from .pdf_export import exportDistrictToPDF  # From Phase 2
        
        # Get week's data
        data = self.db.query_one("""
            SELECT 
                district,
                score as risk_score,
                risk_level,
                (SELECT json_agg(s.*) FROM signals s 
                 WHERE s.district = %s AND s.timestamp >= NOW() - INTERVAL '7 days') as signals,
                (SELECT json_agg(a.*) FROM actions a 
                 WHERE a.district = %s) as actions
            FROM risk_scores
            WHERE district = %s AND date = CURRENT_DATE
        """, (district, district, district))
        
        if not data:
            return False
        
        # Generate PDF
        pdf_data = exportDistrictToPDF(data)
        
        # Get subscribers for this district
        subscribers = self._get_subscribers('weekly_report', district)
        
        # Send email with PDF
        subject = f"Weekly Risk Report: {district} - {datetime.now().strftime('%Y-%m-%d')}"
        html = self._build_weekly_report_email(district, data)
        
        success = self.email.send_email(
            to=subscribers,
            subject=subject,
            body_html=html,
            attachments=[{
                'filename': f'{district}_weekly_report.pdf',
                'data': pdf_data
            }]
        )
        
        return success
    
    def _build_daily_digest_html(self, districts: List[Dict]) -> str:
        """Build HTML for daily digest"""
        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                .header {{ background: #1e40af; color: white; padding: 20px; }}
                .district {{ border: 1px solid #ddd; margin: 10px 0; padding: 15px; }}
                .high {{ background: #fef2f2; border-left: 4px solid #ef4444; }}
                .medium {{ background: #fffbeb; border-left: 4px solid #f59e0b; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>NE-NETRA Daily Digest</h1>
                <p>{datetime.now().strftime('%B %d, %Y')}</p>
            </div>
            
            <div style="padding: 20px;">
                <h2>High-Risk Districts ({len(districts)})</h2>
                
                {''.join([f'''
                <div class="district {self._get_risk_class(d['risk_level'])}">
                    <h3>{d['district']}</h3>
                    <p><strong>Risk Score:</strong> {d['score']}/100</p>
                    <p><strong>Level:</strong> {d['risk_level'].upper()}</p>
                </div>
                ''' for d in districts])}
                
                <p style="margin-top: 30px; color: #666;">
                    <em>This is an automated report from NE-NETRA. 
                    Login to the dashboard for detailed analysis.</em>
                </p>
            </div>
        </body>
        </html>
        """
        return html
    
    def _build_weekly_report_email(self, district: str, data: Dict) -> str:
        """Build HTML for weekly report email"""
        signal_count = len(data.get('signals', []))
        action_count = len(data.get('actions', []))
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Weekly Risk Report: {district}</h2>
            <p><strong>Period:</strong> {(datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')} to {datetime.now().strftime('%Y-%m-%d')}</p>
            
            <h3>Summary</h3>
            <ul>
                <li>Current Risk Score: <strong>{data['risk_score']}/100</strong></li>
                <li>Risk Level: <strong>{data['risk_level'].upper()}</strong></li>
                <li>Signals Analyzed: <strong>{signal_count}</strong></li>
                <li>Active Actions: <strong>{action_count}</strong></li>
            </ul>
            
            <p>Please find the detailed PDF report attached.</p>
            
            <p style="color: #666; margin-top: 30px;">
                <em>This is an automated weekly report from NE-NETRA.</em>
            </p>
        </body>
        </html>
        """
        return html
    
    def _get_risk_class(self, risk_level: str) -> str:
        """Get CSS class for risk level"""
        if risk_level in ['critical', 'high']:
            return 'high'
        return 'medium'
    
    def _get_subscribers(self, report_type: str, district: str = None) -> List[str]:
        """Get email subscribers for report type"""
        # Query subscribers from database
        query = """
            SELECT email FROM report_subscribers
            WHERE report_type = %s AND is_active = true
        """
        params = [report_type]
        
        if district:
            query += " AND (district = %s OR district IS NULL)"
            params.append(district)
        
        results = self.db.query(query, params)
        return [r['email'] for r in results]
