"""
AI-Powered Risk Narrative Generator

Generates human-readable explanations for risk scores using LLM.
"""

from typing import List, Dict, Optional
import os
from datetime import datetime
import json

try:
    import google.generativeai as genai
except ImportError:
    genai = None

class AIRiskNarrative:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize with Google Gemini API"""
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if genai and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
            
    async def generate_narrative(
        self,
        district: str,
        risk_score: float,
        risk_level: str,
        signals: List[Dict],
        layer_scores: Dict[str, float]
    ) -> Dict:
        """
        Generate AI narrative explaining the risk score
        
        Returns:
            {
                'summary': str,
                'key_factors': List[str],
                'recommendations': List[str],
                'confidence': float
            }
        """
        if not self.model:
            return self._fallback_narrative(district, risk_score, risk_level, signals)
        
        # Prepare context
        signal_summaries = [
            f"- {s.get('event_summary', 'N/A')} (Severity: {s.get('severity_score', 'N/A')})"
            for s in signals[:5]  # Top 5 signals
        ]
        
        prompt = f"""You are an intelligence analyst specializing in risk assessment for Northeast India.

District: {district}
Current Risk Score: {risk_score}/100 ({risk_level.upper()} risk)
Layer Scores:
- Cognitive: {layer_scores.get('cognitive', 0):.1f}/10
- Network: {layer_scores.get('network', 0):.1f}/10
- Physical: {layer_scores.get('physical', 0):.1f}/10

Recent Signals:
{chr(10).join(signal_summaries)}

Generate a concise risk analysis with:
1. A 2-3 sentence summary explaining WHY the risk is at this level
2. 3-5 key contributing factors
3. 3-5 actionable recommendations

Format as JSON:
{{
    "summary": "...",
    "key_factors": ["factor1", "factor2", ...],
    "recommendations": ["rec1", "rec2", ...]
}}"""

        try:
            response = self.model.generate_content(prompt)
            result = self._parse_llm_response(response.text)
            result['confidence'] = 0.85  # LLM-based confidence
            return result
            
        except Exception as e:
            print(f"LLM generation failed: {e}")
            return self._fallback_narrative(district, risk_score, risk_level, signals)
    
    async def generate_morning_briefing(
        self,
        district: str,
        risk_score: float,
        risk_level: str,
        signals: List[Dict],
        stats: Dict
    ) -> Dict:
        """
        Generate a high-level 'Morning Briefing' for a district
        
        Returns:
            {
                'briefing': str,
                'urgent_alerts': List[str],
                'outlook': str
            }
        """
        if not self.model:
            return self._fallback_briefing(district, risk_score, risk_level, signals)
        
        signal_text = "\n".join([f"- {s.get('event_summary', 'Signal')}" for s in signals[:3]])
        
        prompt = f"""You are a senior intelligence director briefing the District Magistrate.
        
District: {district}
Current State: {risk_score}/100 ({risk_level.upper()} Risk)
Signals Analyzed: {stats.get('total_messages', 0)}
Recent Review Count: {stats.get('reviews_submitted', 0)}

Significant Indicators:
{signal_text}

Provide:
1. A single paragraph (max 4 sentences) summarizing the 24-hour situation.
2. 2-3 specific "Urgent Flash Alerts" if applicable.
3. A 1-sentence "Temporal Outlook" (stable, deteriorating, or improving).

Format as JSON:
{{
    "briefing": "...",
    "urgent_alerts": ["...", "..."],
    "outlook": "..."
}}"""

        try:
            response = self.model.generate_content(prompt)
            return self._parse_llm_response(response.text)
        except Exception as e:
            print(f"Morning briefing generation failed: {e}")
            return self._fallback_briefing(district, risk_score, risk_level, signals)

    def _fallback_briefing(self, district: str, score: float, level: str, signals: List[Dict]) -> Dict:
        """Fallback for morning briefing"""
        alerts = []
        if score > 70:
            alerts.append(f"CRITICAL: {district} risk score is significantly elevated at {score:.0f}")
        
        if any(s.get('severity', 0) >= 4 for s in signals):
            alerts.append("High-severity incidents detected in the last 24 hours")
            
        return {
            "briefing": f"Intelligence report for {district}. The current risk status is {level.upper()} with a score of {score:.1f}. Active monitoring of {len(signals)} signals is ongoing. The situation requires continuous human-in-the-loop oversight.",
            "urgent_alerts": alerts or ["No urgent flash alerts at this time"],
            "outlook": "Cautionary monitoring advised for the next 12-24 hours."
        }

    async def generate_action_playbook(
        self,
        district: str,
        risk_score: float,
        risk_level: str,
        primary_trigger: str,
        indicators: List[str]
    ) -> Dict:
        """
        Generate a situational 'Action Playbook' (SOP) for district response
        """
        if not self.model:
            return self._fallback_playbook(district, risk_level)
            
        prompt = f"""You are a crisis management expert assisting the Civil Administration.
        
District: {district}
Risk Situation: {risk_score}/100 ({risk_level.upper()})
Primary Trigger: {primary_trigger}
Key Indicators: {', '.join(indicators)}

Based on the National/State Disaster Management guidelines, generate a "Tactical Action Playbook".
Include:
1. "Immediate Priorities" (3 points)
2. "Administrative Protocols" (e.g. Sec 144, Internet, etc. - 2 points)
3. "Public Communication Strategy" (1 point)

Format as JSON:
{{
    "title": "...",
    "priorities": ["...", "...", "..."],
    "protocols": ["...", "..."],
    "comm_strategy": "..."
}}"""

        try:
            response = self.model.generate_content(prompt)
            return self._parse_llm_response(response.text)
        except Exception as e:
            print(f"Playbook generation failed: {e}")
            return self._fallback_playbook(district, risk_level)

    def _fallback_playbook(self, district: str, level: str) -> Dict:
        """Fallback for action playbook"""
        if level in ['high', 'critical']:
            return {
                "title": f"Enhanced Response Protocol - {district}",
                "priorities": [
                    "Activate Sector Officers for micro-level monitoring",
                    "Verify authenticity of viral triggers in sensitive zones",
                    "Pre-position rapid response teams near identified hotspots"
                ],
                "protocols": [
                    "Evaluate requirement for Section 144 BNSS in specific clusters",
                    "Alert cyber cell for active misinformation tracking"
                ],
                "comm_strategy": "Issue verified situational updates via official handles to counter rumors."
            }
        return {
            "title": f"Standard Monitoring Protocol - {district}",
            "priorities": [
                "Continue routine signal analysis",
                "Update daily risk assessment log",
                "Maintain baseline contact with local peace committees"
            ],
            "protocols": [
                "No restricted protocols activated",
                "Ensure signal ingestion pipelines are functional"
            ],
            "comm_strategy": "Maintain standard public information flow."
        }
        """Parse LLM JSON response"""
        try:
            # Extract JSON from markdown code blocks if present
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0]
            elif '```' in text:
                text = text.split('```')[1].split('```')[0]
            
            return json.loads(text.strip())
        except:
            # Fallback parsing
            return {
                'summary': text[:200],
                'briefing': text[:200],  # For morning briefing
                'key_factors': ['LLM response parsing failed'],
                'recommendations': ['Review signals manually'],
                'urgent_alerts': ['Check logs'],
                'outlook': 'Uncertain'
            }
    
    def _fallback_narrative(
        self,
        district: str,
        risk_score: float,
        risk_level: str,
        signals: List[Dict]
    ) -> Dict:
        """Rule-based fallback when LLM unavailable"""
        signal_count = len(signals)
        high_severity_count = len([s for s in signals if s.get('severity_score', 0) >= 4])
        
        summary = f"{district} is at {risk_level} risk ({risk_score:.0f}/100) based on {signal_count} recent signals"
        if high_severity_count > 0:
            summary += f", including {high_severity_count} high-severity incidents"
        summary += "."
        
        key_factors = []
        if signal_count > 10:
            key_factors.append(f"High signal volume ({signal_count} incidents)")
        if high_severity_count > 0:
            key_factors.append(f"{high_severity_count} high-severity events detected")
        
        # Add layer-specific factors
        key_factors.append("Multiple risk layers active")
        
        recommendations = [
            "Monitor signal trends closely",
            "Deploy additional intelligence resources",
            "Coordinate with local authorities"
        ]
        
        if risk_score > 75:
            recommendations.insert(0, "URGENT: Immediate response recommended")
        
        return {
            'summary': summary,
            'key_factors': key_factors[:5],
            'recommendations': recommendations[:5],
            'confidence': 0.65  # Lower confidence for rule-based
        }
