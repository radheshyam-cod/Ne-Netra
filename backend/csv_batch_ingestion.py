"""
CSV Batch Ingestion Script for NE-NETRA
Processes CSV files containing incident data and ingests them into the system
"""

import csv
import sys
from datetime import datetime
from pathlib import Path
import requests
from typing import List, Dict
from incident_ingestion import IncidentIngestionModule, ProcessedSignal


def parse_timestamp(timestamp_str: str) -> datetime:
    """Parse timestamp from various formats"""
    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y",
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(timestamp_str, fmt)
        except ValueError:
            continue
    
    # Default to now if parsing fails
    print(f"Warning: Could not parse timestamp '{timestamp_str}', using current time")
    return datetime.now()


def load_csv(file_path: str) -> List[Dict]:
    """
    Load incidents from CSV file
    
    Expected CSV columns:
    - state (required)
    - district (required)
    - event_summary (required)
    - location (optional)
    - timestamp (optional, will use current time if missing)
    - source_url (optional)
    """
    incidents = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row_num, row in enumerate(reader, start=2):  # Start at 2 (after header)
            try:
                # Required fields
                if not row.get('state') or not row.get('district') or not row.get('event_summary'):
                    print(f"Row {row_num}: Missing required fields (state, district, event_summary)")
                    continue
                
                incident = {
                    'state': row['state'],
                    'district': row['district'],
                    'event_summary': row['event_summary'],
                    'location': row.get('location', '').strip() or None,
                    'timestamp': parse_timestamp(row['timestamp']) if row.get('timestamp') else datetime.now(),
                    'source_url': row.get('source_url', '').strip() or None,
                }
                
                incidents.append(incident)
                
            except Exception as e:
                print(f"Row {row_num}: Error processing - {e}")
                continue
    
    print(f"\nLoaded {len(incidents)} valid incidents from CSV")
    return incidents


def ingest_to_backend(signals: List[ProcessedSignal], backend_url: str = "http://localhost:8000"):
    """Send processed signals to NE-NETRA backend"""
    success_count = 0
    error_count = 0
    
    for signal in signals:
        try:
            # Convert to format expected by /ingest endpoint
            payload = {
                "district": signal.district,
                "text": signal.event_summary,
                "source_type": signal.source_type,
                "geo_sensitivity": signal.geo_sensitivity[0].value if signal.geo_sensitivity else "medium",
                "timestamp": signal.timestamp.isoformat(),
            }
            
            response = requests.post(f"{backend_url}/ingest", json=payload)
            
            if response.status_code == 200:
                success_count += 1
                print(f"✓ Ingested: {signal.district} - {signal.event_summary[:50]}...")
            else:
                error_count += 1
                print(f"✗ Failed: {signal.district} - Status {response.status_code}")
                
        except Exception as e:
            error_count += 1
            print(f"✗ Error: {signal.district} - {e}")
    
    return success_count, error_count


def main():
    """Main batch ingestion pipeline"""
    if len(sys.argv) < 2:
        print("Usage: python csv_batch_ingestion.py <csv_file_path> [backend_url]")
        print("\nExample:")
        print("  python csv_batch_ingestion.py incidents.csv")
        print("  python csv_batch_ingestion.py incidents.csv http://localhost:8000")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    backend_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8000"
    
    # Validate file exists
    if not Path(csv_file).exists():
        print(f"Error: File not found: {csv_file}")
        sys.exit(1)
    
    print("=" * 80)
    print("NE-NETRA Batch Incident Ingestion")
    print("=" * 80)
    print(f"\nInput File: {csv_file}")
    print(f"Backend URL: {backend_url}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n" + "=" * 80)
    
    # Step 1: Load CSV
    print("\n[1/4] Loading incidents from CSV...")
    incidents = load_csv(csv_file)
    
    if not incidents:
        print("No valid incidents found. Exiting.")
        sys.exit(1)
    
    # Step 2: Process with ingestion module
    print(f"\n[2/4] Processing {len(incidents)} incidents...")
    ingestion_module = IncidentIngestionModule()
    signals = ingestion_module.process_batch(incidents)
    
    print(f"Successfully processed: {len(signals)}/{len(incidents)} incidents")
    
    # Step 3: Display summary
    print("\n[3/4] Risk Classification Summary:")
    print("-" * 80)
    
    risk_layer_counts = {"cognitive": 0, "network": 0, "physical": 0}
    polarity_counts = {"escalatory": 0, "stabilizing": 0, "neutral": 0}
    severity_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    
    for signal in signals:
        for layer in signal.risk_layers:
            risk_layer_counts[layer.value] += 1
        polarity_counts[signal.polarity.value] += 1
        severity_counts[signal.severity_score] += 1
    
    print(f"Risk Layers:")
    print(f"  Cognitive: {risk_layer_counts['cognitive']}")
    print(f"  Network:   {risk_layer_counts['network']}")
    print(f"  Physical:  {risk_layer_counts['physical']}")
    
    print(f"\nPolarity:")
    print(f"  Escalatory:  {polarity_counts['escalatory']}")
    print(f"  Stabilizing: {polarity_counts['stabilizing']}")
    print(f"  Neutral:     {polarity_counts['neutral']}")
    
    print(f"\nSeverity Distribution:")
    for sev in range(1, 6):
        bar = "█" * severity_counts[sev]
        print(f"  {sev}/5: {bar} ({severity_counts[sev]})")
    
    # Step 4: Ingest to backend
    print(f"\n[4/4] Sending signals to backend...")
    print("-" * 80)
    
    success, errors = ingest_to_backend(signals, backend_url)
    
    print("\n" + "=" * 80)
    print("INGESTION COMPLETE")
    print("=" * 80)
    print(f"Total Processed: {len(signals)}")
    print(f"Successfully Ingested: {success}")
    print(f"Errors: {errors}")
    print(f"Success Rate: {(success/len(signals)*100):.1f}%")
    print("=" * 80)
    
    # Save processed signals to JSON for audit
    import json
    output_file = f"processed_signals_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(ingestion_module.export_for_storage(signals), f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Audit trail saved to: {output_file}")


if __name__ == "__main__":
    main()
