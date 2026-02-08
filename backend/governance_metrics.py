"""
Governance Dashboard - Compliance Metrics

Tracks DPDP compliance, data age, access patterns
"""

from typing import Dict, List
from datetime import datetime, timedelta

class GovernanceMetrics:
    """Calculate compliance and governance metrics"""
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    def get_compliance_score(self) -> Dict:
        """Calculate overall compliance score"""
        metrics = {}
        
        # 1. Data retention compliance
        metrics['data_retention'] = self._check_data_retention()
        
        # 2. Access control compliance
        metrics['access_control'] = self._check_access_control()
        
        # 3. Audit trail completeness
        metrics['audit_trail'] = self._check_audit_trail()
        
        # 4. PII protection
        metrics['pii_protection'] = self._check_pii_protection()
        
        # 5. Encryption compliance
        metrics['encryption'] = self._check_encryption()
        
        # Calculate overall score (weighted average)
        weights = {
            'data_retention': 0.25,
            'access_control': 0.30,
            'audit_trail': 0.20,
            'pii_protection': 0.15,
            'encryption': 0.10
        }
        
        overall_score = sum(
            metrics[key]['score'] * weights[key] 
            for key in weights.keys()
        )
        
        return {
            'overall_score': round(overall_score, 1),
            'grade': self._get_grade(overall_score),
            'metrics': metrics,
            'last_updated': datetime.now().isoformat()
        }
    
    def _check_data_retention(self) -> Dict:
        """Check if data retention policies are enforced"""
        # Policy: Signals > 6 months should be archived
        old_signals = self.db.query_one("""
            SELECT COUNT(*) as count
            FROM signals
            WHERE timestamp < NOW() - INTERVAL '6 months'
            AND archived = false
        """)
        
        total_old = old_signals['count']
        
        if total_old == 0:
            score = 100
        else:
            # Should be < 5% noncompliant
            score = max(0, 100 - (total_old * 2))
        
        return {
            'score': score,
            'status': 'compliant' if score >= 95 else 'needs_attention',
            'details': {
                'unarchived_old_records': total_old,
                'policy': 'Archive signals older than 6 months'
            }
        }
    
    def _check_access_control(self) -> Dict:
        """Check access control violations"""
        # Check for unauthorized access attempts
        violations = self.db.query_one("""
            SELECT COUNT(*) as count
            FROM audit_trail
            WHERE action = 'access_denied'
            AND timestamp >= NOW() - INTERVAL '30 days'
        """)
        
        # Check for users with excessive permissions
        over_permissioned = self.db.query_one("""
            SELECT COUNT(*) as count
            FROM user_permissions up
            JOIN users u ON u.id = up.user_id
            WHERE up.permission_level > u.required_level
        """)
        
        total_issues = violations['count'] + (over_permissioned['count'] * 10)
        score = max(0, 100 - total_issues)
        
        return {
            'score': score,
            'status': 'compliant' if score >= 90 else 'review_required',
            'details': {
                'access_violations_30d': violations['count'],
                'over_permissioned_users': over_permissioned['count']
            }
        }
    
    def _check_audit_trail(self) -> Dict:
        """Check audit trail completeness"""
        # All critical actions should be logged
        critical_actions = self.db.query_one("""
            SELECT COUNT(*) as count
            FROM actions
            WHERE status = 'completed'
            AND created_at >= NOW() - INTERVAL '30 days'
        """)
        
        logged_actions = self.db.query_one("""
            SELECT COUNT(*) as count
            FROM audit_trail
            WHERE action_type IN ('action_created', 'action_completed')
            AND timestamp >= NOW() - INTERVAL '30 days'
        """)
        
        if critical_actions['count'] == 0:
            score = 100
        else:
            coverage = (logged_actions['count'] / critical_actions['count']) * 100
            score = min(100, coverage)
        
        return {
            'score': round(score, 1),
            'status': 'compliant' if score >= 98 else 'incomplete',
            'details': {
                'coverage_percentage': round(score, 1),
                'logged_actions': logged_actions['count'],
                'total_actions': critical_actions['count']
            }
        }
    
    def _check_pii_protection(self) -> Dict:
        """Check PII detection and protection"""
        # Check if PII scanning is running
        last_scan = self.db.query_one("""
            SELECT MAX(timestamp) as last_scan
            FROM pii_scan_log
        """)
        
        days_since_scan = (datetime.now() - last_scan['last_scan']).days if last_scan['last_scan'] else 999
        
        # Should scan weekly
        if days_since_scan <= 7:
            score = 100
        elif days_since_scan <= 14:
            score = 80
        else:
            score = 50
        
        # Check for detected PII in public fields
        exposed_pii = self.db.query_one("""
            SELECT COUNT(*) as count
            FROM pii_detections
            WHERE field_visibility = 'public'
            AND resolved = false
        """)
        
        score -= exposed_pii['count'] * 5
        score = max(0, score)
        
        return {
            'score': score,
            'status': 'compliant' if score >= 90 else 'action_required',
            'details': {
                'days_since_last_scan': days_since_scan,
                'exposed_pii_count': exposed_pii['count']
            }
        }
    
    def _check_encryption(self) -> Dict:
        """Check encryption compliance"""
        # Check if sensitive fields are encrypted
        unencrypted = self.db.query_one("""
            SELECT COUNT(*) as count
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND column_name IN ('password', 'api_key', 'token')
            AND data_type != 'bytea'  # Should be encrypted (bytea type)
        """)
        
        score = 100 if unencrypted['count'] == 0 else 60
        
        return {
            'score': score,
            'status': 'compliant' if score == 100 else 'review_encryption',
            'details': {
                'unencrypted_sensitive_fields': unencrypted['count']
            }
        }
    
    def _get_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 95:
            return 'A+'
        elif score >= 90:
            return 'A'
        elif score >= 85:
            return 'B+'
        elif score >= 80:
            return 'B'
        elif score >= 75:
            return 'C+'
        elif score >= 70:
            return 'C'
        else:
            return 'F'
    
    def generate_compliance_report(self) -> str:
        """Generate human-readable compliance report"""
        metrics = self.get_compliance_score()
        
        report = f"""
# NE-NETRA Compliance Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## Overall Compliance Score: {metrics['overall_score']}/100 (Grade: {metrics['grade']})

### Data Retention: {metrics['metrics']['data_retention']['score']}/100
Status: {metrics['metrics']['data_retention']['status']}
- Unarchived old records: {metrics['metrics']['data_retention']['details']['unarchived_old_records']}

### Access Control: {metrics['metrics']['access_control']['score']}/100
Status: {metrics['metrics']['access_control']['status']}
- Access violations (30d): {metrics['metrics']['access_control']['details']['access_violations_30d']}
- Over-permissioned users: {metrics['metrics']['access_control']['details']['over_permissioned_users']}

### Audit Trail: {metrics['metrics']['audit_trail']['score']}/100
Status: {metrics['metrics']['audit_trail']['status']}
- Coverage: {metrics['metrics']['audit_trail']['details']['coverage_percentage']}%

### PII Protection: {metrics['metrics']['pii_protection']['score']}/100
Status: {metrics['metrics']['pii_protection']['status']}
- Days since scan: {metrics['metrics']['pii_protection']['details']['days_since_last_scan']}
- Exposed PII: {metrics['metrics']['pii_protection']['details']['exposed_pii_count']}

### Encryption: {metrics['metrics']['encryption']['score']}/100
Status: {metrics['metrics']['encryption']['status']}
        """
        
        return report.strip()
