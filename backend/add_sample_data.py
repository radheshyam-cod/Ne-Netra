"""
Quick script to add sample data for testing NE districts
Run this to populate the database with sample messages for testing
"""

import requests
import time

BASE_URL = "http://localhost:8000"

# Sample districts from each state
SAMPLE_DISTRICTS = [
    # Assam
    "Kamrup",
    "Kamrup Metropolitan", 
    "Dibrugarh",
    "Jorhat",
    "Guwahati",
    
    # Meghalaya
    "East Khasi Hills",
    "West Khasi Hills",
    
    # Manipur
    "Imphal West",
    "Imphal East",
    
    # Mizoram
    "Aizawl",
    
    # Nagaland
    "Kohima",
    "Dimapur",
]

# Sample messages
SAMPLE_MESSAGES = [
    "Market prices increased significantly today",
    "Heavy rainfall expected in the region",
    "Local festival preparations ongoing", 
    "Transportation strike announced for tomorrow",
    "Border area tension reported",
    "Agricultural produce shortage in markets",
    "Network connectivity issues reported",
    "Emergency response drill conducted successfully",
]

def add_sample_data():
    """Add sample messages for testing"""
    print("Adding sample data to NE-NETRA...")
    
    for district in SAMPLE_DISTRICTS:
        print(f"\n📍 Adding data for {district}...")
        
        # Add 3-5 messages per district
        for i, message in enumerate(SAMPLE_MESSAGES[:5]):
            data = {
                "district": district,
                "text": f"{message} - Sample data {i+1}",
                "source_type": "public_source",
                "geo_sensitivity": "medium"
            }
            
            try:
                response = requests.post(f"{BASE_URL}/ingest", json=data)
                if response.status_code == 200:
                    print(f"  ✓ Message {i+1} added")
                else:
                    print(f"  ✗ Failed: {response.status_code}")
            except Exception as e:
                print(f"  ✗ Error: {e}")
            
            time.sleep(0.1)  # Small delay
        
        # Trigger analysis
        try:
            response = requests.post(f"{BASE_URL}/analyze", json={"district": district})
            if response.status_code == 200:
                result = response.json()
                print(f"  ✓ Analysis complete - Risk Score: {result.get('risk_score', {}).get('score', 'N/A')}")
            else:
                print(f"  ✗ Analysis failed: {response.status_code}")
        except Exception as e:
            print(f"  ✗ Analysis error: {e}")
    
    print("\n✅ Sample data added successfully!")
    print("Refresh your dashboard to see the data.")

if __name__ == "__main__":
    add_sample_data()
