"""
Database Seeder for NE-NETRA
Populates the database with synthetic data for all supported NE districts.
"""
from database import init_db, SessionLocal, Message, RiskScore
from sample_data import DISTRICTS, DEMO_SCENARIOS, generate_scenario_data
from intelligence import RiskIntelligence
from governance import PIIRedaction
import json
import random

def seed_db():
    print("🌱 Initializing Database...")
    init_db()
    
    db = SessionLocal()
    ai_engine = RiskIntelligence()
    
    # Clean up existing data (Optional: for clean slate)
    # db.query(Message).delete()
    # db.query(RiskScore).delete()
    # db.commit()
    
    print(f"🚀 Seeding data for {len(DISTRICTS)} districts...")
    
    total_messages = 0
    
    for district in DISTRICTS:
        # Determine scenario
        scenario = 'baseline' # Default
        
        # Check if mapped in DEMO_SCENARIOS
        for key, config in DEMO_SCENARIOS.items():
            if config['district'] == district:
                scenario = config['scenario']
                print(f"  - {district}: Applying '{scenario}' scenario")
                break
        else:
            # Random variation for others
            if random.random() < 0.2:
                scenario = 'mixed'
                print(f"  - {district}: Applying 'mixed' variation")
            else:
                print(f"  - {district}: Baseline")

        # Generate messages
        raw_messages = generate_scenario_data(
            district=district,
            scenario=scenario,
            days_back=3,
            messages_per_day=random.randint(8, 15)
        )
        
        # Process and Insert Messages
        db_messages = []
        message_dicts = [] # For analysis
        
        for msg in raw_messages:
            sanitized_text = PIIRedaction.redact(msg['text'])
            
            # Analyze
            sentiment = ai_engine.analyze_sentiment(sanitized_text)
            toxicity = ai_engine.analyze_toxicity(sanitized_text)
            
            db_msg = Message(
                district=district,
                text=sanitized_text,
                source_type=msg['source_type'],
                geo_sensitivity=msg['geo_sensitivity'],
                timestamp=msg['timestamp'], # string format? convert if needed?
                # SQLAlchemy usually handles iso format strings for DateTime if driver supports, 
                # but better to parse if needed. Sample data returns isoformat string.
                # However, our other code passes strings or objects. 
                # Let's assume SQLite/SQLAlchemy is lenient or we stick to strings 
                # if the column allows. Database model says DateTime.
                # Let's parse it safely.
            )
            # Parse timestamp string to datetime
            from datetime import datetime
            try:
                dt = datetime.fromisoformat(msg['timestamp'])
                db_msg.timestamp = dt
            except:
                pass

            db_msg.sentiment_score = sentiment
            db_msg.toxicity_score = toxicity
            db_msg.processed = True
            
            db.add(db_msg)
            db_messages.append(db_msg)
            
            message_dicts.append({
                'text': sanitized_text,
                'timestamp': dt, 
                'geo_sensitivity': msg['geo_sensitivity'],
                'source_type': msg['source_type']
            })
            
            total_messages += 1

        db.commit()
        
        # Calculate and Store Multiple Historical Risk Scores for Trend Chart
        # Generate 12-24 historical data points spread over the last 24 hours
        from datetime import datetime, timedelta
        
        num_historical_points = random.randint(12, 24)
        current_time = datetime.utcnow()
        time_interval = 24 * 60 / num_historical_points  # minutes between each point
        
        weights = {'w1': 1.0, 'w2': 1.0, 'w3': 1.0}
        
        # Generate base score for this district based on scenario
        base_analysis = ai_engine.calculate_composite_risk_score(
            messages=message_dicts,
            district=district,
            weights=weights
        )
        base_score = base_analysis['score']
        
        # Create historical trend with variations
        for i in range(num_historical_points):
            # Calculate timestamp for this point (going backwards in time)
            point_time = current_time - timedelta(minutes=(num_historical_points - i - 1) * time_interval)
            
            # Add some variation around the base score
            variation = random.uniform(-10, 10)  # +/- 10 points variation
            score = max(0, min(100, base_score + variation))
            
            # Determine risk level based on score
            if score >= 75:
                risk_level = 'critical'
            elif score >= 50:
                risk_level = 'high'
            elif score >= 25:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            # Create historical risk score entry
            risk_score = RiskScore(
                district=district,
                score=score,
                risk_level=risk_level,
                trend=base_analysis['trend'],
                primary_trigger=base_analysis['primary_trigger'],
                sentiment_component=base_analysis['components']['sentiment'],
                toxicity_component=base_analysis['components']['toxicity'],
                velocity_component=base_analysis['components']['velocity'],
                geo_sensitivity_component=base_analysis['components']['geo_sensitivity'],
                suggested_actions=json.dumps(base_analysis['suggested_actions']),
                hotspots=json.dumps(base_analysis['hotspots']),
                timestamp=point_time
            )
            
            db.add(risk_score)
        
        db.commit()
    
    print(f"✅ Seeding Complete. Added {total_messages} messages across {len(DISTRICTS)} districts.")
    db.close()

if __name__ == "__main__":
    seed_db()
