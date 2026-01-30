"""
Synthetic Sample Data for NE-NETRA Prototype

IMPORTANT: ALL DATA IS SYNTHETIC AND FOR DEMONSTRATION PURPOSES ONLY
No real individuals, locations (except district names), or events
"""
from datetime import datetime, timedelta
import random

# North-East India Districts
DISTRICTS = [
    # Assam
    'Kamrup Metropolitan', 'Dibrugarh', 'Jorhat', 'Sivasagar', 'Tinsukia', 'Cachar',
    # Arunachal Pradesh
    'Papum Pare', 'Tawang', 'West Kameng', 'Changlang',
    # Manipur
    'Imphal West', 'Imphal East', 'Churachandpur', 'Thoubal',
    # Meghalaya
    'East Khasi Hills', 'West Garo Hills', 'Ri Bhoi',
    # Mizoram
    'Aizawl', 'Lunglei', 'Champhai',
    # Nagaland
    'Kohima', 'Dimapur', 'Mokokchung',
    # Sikkim
    'Gangtok', 'Namchi', 'Gyalshing',
    # Tripura
    'West Tripura', 'Gomati', 'North Tripura'
]

# Geo-sensitivity types
GEO_TYPES = ['normal', 'market', 'highway', 'sensitive_zone']

# SYNTHETIC TEXT SAMPLES - SCENARIO 1: Low Risk (Baseline Activity)
LOW_RISK_SAMPLES = [
    "Local festival preparations going well. Community cooperation is good.",
    "Traffic update: Highway construction work ongoing near main junction.",
    "Small business owners meeting scheduled for next week to discuss market issues.",
    "Local school annual function was a great success. Parents appreciate efforts.",
    "Municipal services complaint: street lights need repair in some areas.",
    "Weather forecast shows heavy rain expected this week. Stay safe everyone.",
    "New government scheme for small traders announced. Application process simple.",
    "Community health camp organized at district hospital next month.",
    "Local cricket tournament finals this Sunday. Good luck to both teams.",
    "Public library extended hours during exam season. Good initiative.",
]

# SYNTHETIC TEXT SAMPLES - SCENARIO 2: Medium Risk (Elevated Tension)
MEDIUM_RISK_SAMPLES = [
    "Protest planned against new market regulations. Traders are frustrated.",
    "Tension in market area after dispute over vendor licenses. Situation monitored.",
    "Local groups express anger over infrastructure delays. Demands immediate action.",
    "Clash between two student groups at college. Minor injuries reported.",
    "Public outrage over water supply issues. Multiple complaints filed.",
    "Highway blockade threatened if road repair not done soon. Commuters worried.",
    "Traders strike possible next week. Negotiation talks ongoing.",
    "Social media posts show growing frustration with administrative delays.",
    "Demand for immediate solution to electricity problem. Public patience running low.",
    "Conflict over land dispute continues. Community leaders trying to mediate.",
]

# SYNTHETIC TEXT SAMPLES - SCENARIO 3: High Risk (Escalation Indicators)
HIGH_RISK_SAMPLES = [
    "Tomorrow we gather at market square to demand action. Spread this message widely.",
    "Enough is enough. Time to take matters into our own hands. Share maximum.",
    "Massive protest today at 5pm. Everyone must join. Urgent call to action.",
    "They won't listen to requests. We need to show strength. Tonight is the time.",
    "Forward this to everyone: Rally at highway junction. Numbers matter. Come prepared.",
    "This injustice will not be tolerated anymore. Immediate response required from all.",
    "Organize and mobilize. Meeting point shared separately. Share this urgently.",
    "Violence is the only language they understand. Enough of peaceful methods.",
    "Burn all applications if demands not met by tomorrow. Final warning issued.",
    "Attack on our community will be answered. Gather at sensitive zone immediately.",
]

# SYNTHETIC TEXT SAMPLES - SCENARIO 4: Critical Risk (Coordinated Escalation)
CRITICAL_RISK_SAMPLES = [
    "Tomorrow night we strike. Gather weapons. Target locations shared in group. Spread word.",
    "Kill the proposal. Destroy all opposition. This is war now. Everyone participate urgently.",
    "Riot preparation complete. Time is tonight 10pm. Spread this message to maximum people.",
    "Burn everything if demands not met. Violence is inevitable. Share widely and gather.",
    "Attack planned for tomorrow. All groups coordinate. Meet at sensitive zone with weapons.",
    "Revenge will be taken. Gather tonight. Bring everyone. This ends now with force.",
    "Emergency mobilization. Tonight we fight. Share this everywhere immediately. No mercy.",
    "Coordinated action across all zones. Destroy government property. Time is now.",
    "Maximum damage strategy. All hands needed. Tonight we show them consequences.",
    "Final call to arms. Violence necessary. Gather all supporters. Attack at dawn.",
]


def generate_scenario_data(
    district: str,
    scenario: str = 'low',
    days_back: int = 2,
    messages_per_day: int = 10
):
    """
    Generate synthetic message data for different risk scenarios
    
    Scenarios:
    - 'low': Baseline activity
    - 'medium': Elevated tension
    - 'high': Escalation indicators
    - 'critical': Coordinated escalation
    - 'mixed': Realistic mix with gradual escalation
    """
    messages = []
    
    # Select sample pool based on scenario
    if scenario == 'low':
        sample_pool = LOW_RISK_SAMPLES
        geo_weights = [0.7, 0.2, 0.05, 0.05]  # Mostly normal
    elif scenario == 'medium':
        sample_pool = MEDIUM_RISK_SAMPLES
        geo_weights = [0.5, 0.3, 0.15, 0.05]  # More market/highway
    elif scenario == 'high':
        sample_pool = HIGH_RISK_SAMPLES
        geo_weights = [0.3, 0.3, 0.2, 0.2]  # More sensitive zones
    elif scenario == 'critical':
        sample_pool = CRITICAL_RISK_SAMPLES
        geo_weights = [0.2, 0.2, 0.3, 0.3]  # High sensitive zones
    elif scenario == 'mixed':
        # Gradual escalation over time
        return generate_mixed_scenario_data(district, days_back, messages_per_day)
    else:
        sample_pool = LOW_RISK_SAMPLES
        geo_weights = [0.7, 0.2, 0.05, 0.05]
    
    # Generate messages
    for day in range(days_back):
        day_offset = days_back - day - 1
        base_time = datetime.utcnow() - timedelta(days=day_offset)
        
        for msg_num in range(messages_per_day):
            # Random time within the day
            hour_offset = random.randint(0, 23)
            minute_offset = random.randint(0, 59)
            timestamp = base_time.replace(hour=hour_offset, minute=minute_offset)
            
            # Select random message
            text = random.choice(sample_pool)
            
            # Select geo-sensitivity based on weights
            geo_type = random.choices(GEO_TYPES, weights=geo_weights)[0]
            
            messages.append({
                'district': district,
                'text': text,
                'source_type': 'synthetic',
                'geo_sensitivity': geo_type,
                'timestamp': timestamp.isoformat()
            })
    
    return messages


def generate_mixed_scenario_data(
    district: str,
    days_back: int = 3,
    messages_per_day: int = 15
):
    """
    Generate realistic mixed scenario with gradual escalation
    Simulates: Normal → Tension → Escalation pattern
    """
    messages = []
    
    total_days = days_back
    
    for day in range(total_days):
        day_offset = total_days - day - 1
        base_time = datetime.utcnow() - timedelta(days=day_offset)
        
        # Determine scenario mix for this day
        if day == 0:  # Oldest day - mostly low risk
            scenario_mix = [
                (LOW_RISK_SAMPLES, 0.8),
                (MEDIUM_RISK_SAMPLES, 0.2),
            ]
            msgs_this_day = messages_per_day
        elif day < total_days - 1:  # Middle days - increasing tension
            scenario_mix = [
                (LOW_RISK_SAMPLES, 0.4),
                (MEDIUM_RISK_SAMPLES, 0.5),
                (HIGH_RISK_SAMPLES, 0.1),
            ]
            msgs_this_day = int(messages_per_day * 1.3)  # Increasing volume
        else:  # Recent day - high escalation
            scenario_mix = [
                (MEDIUM_RISK_SAMPLES, 0.3),
                (HIGH_RISK_SAMPLES, 0.6),
                (CRITICAL_RISK_SAMPLES, 0.1),
            ]
            msgs_this_day = int(messages_per_day * 1.5)  # High volume
        
        for msg_num in range(msgs_this_day):
            # Random time within the day
            hour_offset = random.randint(0, 23)
            minute_offset = random.randint(0, 59)
            timestamp = base_time.replace(hour=hour_offset, minute=minute_offset)
            
            # Select sample pool based on weights
            sample_pool = random.choices(
                [s[0] for s in scenario_mix],
                weights=[s[1] for s in scenario_mix]
            )[0]
            
            text = random.choice(sample_pool)
            
            # Geo-sensitivity increases with risk
            if sample_pool == CRITICAL_RISK_SAMPLES or sample_pool == HIGH_RISK_SAMPLES:
                geo_weights = [0.2, 0.3, 0.2, 0.3]
            elif sample_pool == MEDIUM_RISK_SAMPLES:
                geo_weights = [0.4, 0.3, 0.2, 0.1]
            else:
                geo_weights = [0.7, 0.2, 0.05, 0.05]
            
            geo_type = random.choices(GEO_TYPES, weights=geo_weights)[0]
            
            messages.append({
                'district': district,
                'text': text,
                'source_type': 'synthetic',
                'geo_sensitivity': geo_type,
                'timestamp': timestamp.isoformat()
            })
    
    return messages


# Pre-defined demo scenarios
DEMO_SCENARIOS = {
    'baseline': {
        'name': 'Baseline Activity (Low Risk)',
        'description': 'Normal day-to-day activity in Aizawl. No significant risk indicators.',
        'district': 'Aizawl',
        'scenario': 'low',
        'expected_score_range': (10, 25)
    },
    'tension': {
        'name': 'Elevated Tension (Medium Risk)',
        'description': 'Increased complaints in Dimapur. Situation monitored.',
        'district': 'Dimapur',
        'scenario': 'medium',
        'expected_score_range': (30, 50)
    },
    'escalation': {
        'name': 'Escalation Detected (High Risk)',
        'description': 'Coordinated messaging in Imphal West with escalatory language.',
        'district': 'Imphal West',
        'scenario': 'high',
        'expected_score_range': (55, 75)
    },
    'critical': {
        'name': 'Critical Alert (Critical Risk)',
        'description': 'Imminent threat detected in East Khasi Hills. Immediate review required.',
        'district': 'East Khasi Hills',
        'scenario': 'critical',
        'expected_score_range': (80, 95)
    },
    'realistic': {
        'name': 'Realistic Escalation Pattern',
        'description': 'Gradual escalation in Agartala (Normal → Tension → High Risk)',
        'district': 'West Tripura',
        'scenario': 'mixed',
        'expected_score_range': (60, 75)
    }
}


if __name__ == "__main__":
    # Example: Generate and print sample data
    print("NE-NETRA Synthetic Data Generator")
    print("=" * 50)
    print("\nDEMO SCENARIOS AVAILABLE:\n")
    
    for key, scenario in DEMO_SCENARIOS.items():
        print(f"{key.upper()}:")
        print(f"  Name: {scenario['name']}")
        print(f"  Description: {scenario['description']}")
        print(f"  District: {scenario['district']}")
        print(f"  Expected Score: {scenario['expected_score_range'][0]}-{scenario['expected_score_range'][1]}")
        print()
    
    # Generate sample for 'realistic' scenario
    print("\nGenerating sample data for REALISTIC scenario...")
    messages = generate_scenario_data(
        district='Tinsukia',
        scenario='mixed',
        days_back=3,
        messages_per_day=15
    )
    
    print(f"Generated {len(messages)} synthetic messages")
    print(f"\nSample messages:")
    for i, msg in enumerate(messages[:5], 1):
        print(f"\n{i}. {msg['text']}")
        print(f"   Geo: {msg['geo_sensitivity']}, Time: {msg['timestamp']}")
