"""
Complete North-Eastern States District Configuration
All 8 NE States with comprehensive district coverage

Total Districts: 169
- Meghalaya: 12 districts
- Assam: 35 districts
- Arunachal Pradesh: 26 districts
- Manipur: 16 districts
- Mizoram: 11 districts
- Nagaland: 17 districts
- Tripura: 8 districts
- Sikkim: 6 districts (special status - added for border monitoring)
"""

# State-wise district organization
NE_STATES_DISTRICTS = {
    'Meghalaya': {
        'districts': [
            'East Garo Hills', 'West Garo Hills', 'North Garo Hills', 
            'South Garo Hills', 'South West Garo Hills',
            'East Khasi Hills', 'West Khasi Hills', 'South West Khasi Hills', 
            'Eastern West Khasi Hills', 'Ri-Bhoi',
            'East Jaintia Hills', 'West Jaintia Hills'
        ],
        'total': 12
    },
    'Assam': {
        'districts': [
            # Bodoland/Western Region
            'Baksa', 'Bajali', 'Barpeta', 'Bongaigaon', 'Chirang', 'Dhubri', 
            'Goalpara', 'Kamrup', 'Kamrup Metropolitan', 'Kokrajhar', 'Nalbari', 
            'South Salmara-Mankachar', 'Tamulpur',
            # North Bank
            'Biswanath', 'Darrang', 'Sonitpur', 'Udalguri',
            # Upper Assam
            'Charaideo', 'Dhemaji', 'Dibrugarh', 'Golaghat', 'Jorhat', 
            'Lakhimpur', 'Majuli', 'Sivasagar', 'Tinsukia',
            # Central Assam
            'Dima Hasao', 'Hojai', 'Morigaon', 'Nagaon',
            # Hill Districts
            'Karbi Anglong', 'West Karbi Anglong',
            # Barak Valley
            'Cachar', 'Hailakandi', 'Karimganj'
        ],
        'total': 35
    },
    'Arunachal Pradesh': {
        'districts': [
            'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 
            'Kamle', 'Kra Daadi', 'Kurung Kumey', 'Lepa-Rada', 'Lohit', 
            'Longding', 'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri', 
            'Namsai', 'Pakke-Kessang', 'Papum Pare', 'Shi Yomi', 'Siang', 
            'Tawang', 'Tirap', 'Upper Dibang Valley', 'Upper Siang', 
            'Upper Subansiri', 'West Kameng', 'West Siang'
        ],
        'total': 26
    },
    'Manipur': {
        'districts': [
            'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 
            'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 
            'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'
        ],
        'total': 16
    },
    'Mizoram': {
        'districts': [
            'Aizawl', 'Champhai', 'Khawzawl', 'Saitual', 'Kolasib', 
            'Lawngtlai', 'Lunglei', 'Mamit', 'Serchhip', 'Saiha', 'Hnahthial'
        ],
        'total': 11
    },
    'Nagaland': {
        'districts': [
            'Chümoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 
            'Meluri', 'Mokokchung', 'Mon', 'Niuland', 'Noklak', 
            'Peren', 'Phek', 'Shamator', 'Tuensang', 'Tseminyü', 'Wokha', 'Zünheboto'
        ],
        'total': 17
    },
    'Tripura': {
        'districts': [
            'Dhalai', 'Gomati', 'Khowai', 'North Tripura', 
            'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'
        ],
        'total': 8
    },
    'Sikkim': {
        'districts': [
            'East Sikkim', 'North Sikkim', 'South Sikkim', 
            'West Sikkim', 'Pakyong', 'Soreng'
        ],
        'total': 6
    }
}

# Enhanced district-specific modifiers with realistic NE context
DISTRICT_MODIFIERS_COMPREHENSIVE = {
    # MEGHALAYA
    'East Garo Hills': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'West Garo Hills': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'North Garo Hills': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'South Garo Hills': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.15},
    'South West Garo Hills': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'East Khasi Hills': {'border_sensitivity': 'medium', 'market_density': 'dense', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'West Khasi Hills': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'South West Khasi Hills': {'border_sensitivity': 'medium', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.1},
    'Eastern West Khasi Hills': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.15},
    'Ri-Bhoi': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.1},
    'East Jaintia Hills': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.15},
    'West Jaintia Hills': {'border_sensitivity': 'medium', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.1},
    
    # ASSAM - Bodoland/Western
    'Baksa': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Bajali': {'border_sensitivity': 'low', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.1},
    'Barpeta': {'border_sensitivity': 'low', 'market_density': 'dense', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.15},
    'Bongaigaon': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': False, 'modifier_multiplier': 1.05},
    'Chirang': {'border_sensitivity': 'medium', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Dhubri': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Goalpara': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Kamrup': {'border_sensitivity': 'low', 'market_density': 'dense', 'ethnic_sensitivity': False, 'modifier_multiplier': 1.2},
    'Kamrup Metropolitan': {'border_sensitivity': 'low', 'market_density': 'dense', 'ethnic_sensitivity': False, 'modifier_multiplier': 1.3},
    'Kokrajhar': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Nalbari': {'border_sensitivity': 'low', 'market_density': 'moderate', 'ethnic_sensitivity': False, 'modifier_multiplier': 1.0},
    'South Salmara-Mankachar': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Tamulpur': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.15},
    
    # ASSAM - North Bank
    'Biswanath': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.1},
    'Darrang': {'border_sensitivity': 'low', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.1},
    'Sonitpur': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Udalguri': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.15},
    
    # ASSAM - Upper Assam
    'Charaideo': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': False, 'modifier_multiplier': 1.05},
    'Dhemaji': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Dibrugarh': {'border_sensitivity': 'high', 'market_density': 'dense', 'ethnic_sensitivity': False, 'modifier_multiplier': 1.3},
    'Golaghat': {'border_sensitivity': 'low', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.1},
    'Jorhat': {'border_sensitivity': 'low', 'market_density': 'dense', 'ethnic_sensitivity': False, 'modifier_multiplier': 1.15},
    'Lakhimpur': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Majuli': {'border_sensitivity': 'low', 'market_density': 'sparse', 'ethnic_sensitivity': False, 'modifier_multiplier': 1.0},
    'Sivasagar': {'border_sensitivity': 'low', 'market_density': 'moderate', 'ethnic_sensitivity': False, 'modifier_multiplier': 1.05},
    'Tinsukia': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': False, 'modifier_multiplier': 1.25},
    
    # ASSAM - Central
    'Dima Hasao': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Hojai': {'border_sensitivity': 'low', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.1},
    'Morigaon': {'border_sensitivity': 'low', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.05},
    'Nagaon': {'border_sensitivity': 'low', 'market_density': 'dense', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.15},
    
    # ASSAM - Hill Districts
    'Karbi Anglong': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'West Karbi Anglong': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    
    # ASSAM - Barak Valley
    'Cachar': {'border_sensitivity': 'high', 'market_density': 'dense', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Hailakandi': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Karimganj': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    
    # ARUNACHAL PRADESH - All high border sensitivity
    'Anjaw': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.4},
    'Changlang': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Dibang Valley': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.35},
    'East Kameng': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'East Siang': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Kamle': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Kra Daadi': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Kurung Kumey': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Lepa-Rada': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Lohit': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.35},
    'Longding': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Lower Dibang Valley': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Lower Siang': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Lower Subansiri': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Namsai': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Pakke-Kessang': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Papum Pare': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Shi Yomi': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Siang': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Tawang': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.4},
    'Tirap': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Upper Dibang Valley': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.35},
    'Upper Siang': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Upper Subansiri': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'West Kameng': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.35},
    'West Siang': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    
    # MANIPUR
    'Bishnupur': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Chandel': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.35},
    'Churachandpur': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Imphal East': {'border_sensitivity': 'medium', 'market_density': 'dense', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Imphal West': {'border_sensitivity': 'medium', 'market_density': 'dense', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Jiribam': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Kakching': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Kamjong': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Kangpokpi': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Noney': {'border_sensitivity': 'medium', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Pherzawl': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Senapati': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Tamenglong': {'border_sensitivity': 'medium', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Tengnoupal': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Thoubal': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Ukhrul': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    
    # MIZORAM - High border sensitivity
    'Aizawl': {'border_sensitivity': 'medium', 'market_density': 'dense', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Champhai': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.35},
    'Khawzawl': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Saitual': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Kolasib': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Lawngtlai': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.35},
    'Lunglei': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Mamit': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Serchhip': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Saiha': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.35},
    'Hnahthial': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    
    # NAGALAND
    'Chümoukedima': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Dimapur': {'border_sensitivity': 'medium', 'market_density': 'dense', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Kiphire': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Kohima': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Longleng': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Meluri': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Mokokchung': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Mon': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.35},
    'Niuland': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Noklak': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Peren': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Phek': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Shamator': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Tuensang': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Tseminyü': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Wokha': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Zünheboto': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    
    # TRIPURA
    'Dhalai': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Gomati': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    'Khowai': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.15},
    'North Tripura': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Sepahijala': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.15},
    'South Tripura': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Unakoti': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'West Tripura': {'border_sensitivity': 'medium', 'market_density': 'dense', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.2},
    
    # SIKKIM - High border sensitivity (China border)
    'East Sikkim': {'border_sensitivity': 'high', 'market_density': 'dense', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'North Sikkim': {'border_sensitivity': 'high', 'market_density': 'sparse', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.4},
    'South Sikkim': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'West Sikkim': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.3},
    'Pakyong': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    'Soreng': {'border_sensitivity': 'high', 'market_density': 'moderate', 'ethnic_sensitivity': True, 'modifier_multiplier': 1.25},
    
    # Default fallback
    'Default': {'border_sensitivity': 'medium', 'market_density': 'moderate', 'ethnic_sensitivity': False, 'modifier_multiplier': 1.0}
}

# Cross-district adjacency map for spillover calculations (sample - needs completion)
DISTRICT_ADJACENCY_COMPREHENSIVE = {
    # ASSAM - Major districts with adjacencies
    'Kamrup': ['Nalbari', 'Kamrup Metropolitan', 'Morigaon', 'Goalpara'],
    'Kamrup Metropolitan': ['Kamrup', 'Nalbari', 'Darrang'],
    'Dibrugarh': ['Tinsukia', 'Sibsagar', 'Charaideo'],
    'Tinsukia': ['Dibrugarh', 'Charaideo', 'Lohit'],  # Cross-state to Arunachal
    'Nalbari': ['Kamrup', 'Barpeta', 'Baksa'],
    'Kokrajhar': ['Dhubri', 'Chirang', 'Bongaigaon'],
    'Golaghat': ['Jorhat', 'Nagaon', 'Karbi Anglong'],
    'Nagaon': ['Morigaon', 'Hojai', 'Golaghat', 'Karbi Anglong'],
    'Sonitpur': ['Biswanath', 'Lakhimpur', 'Udalguri', 'West Kameng'],  # Cross-state to Arunachal
    
    # Cross-state adjacencies
    'Cachar': ['Hailakandi', 'Karimganj', 'Jiribam'],  # To Manipur
    'Dhubri': ['Kokrajhar', 'South Salmara-Mankachar', 'West Garo Hills'],  # To Meghalaya
    
    # MEGHALAYA
    'East Khasi Hills': ['West Khasi Hills', 'Ri-Bhoi', 'East Jaintia Hills'],
    'West Garo Hills': ['South Garo Hills', 'East Garo Hills', 'Dhubri'],  # To Assam
    
    # ARUNACHAL PRADESH
    'Papum Pare': ['East Kameng', 'Kurung Kumey', 'Lower Subansiri'],
    'Lohit': ['Anjaw', 'Namsai', 'Tinsukia'],  # To Assam
    'Tawang': ['West Kameng', 'East Kameng'],
    
    # MANIPUR
    'Imphal West': ['Imphal East', 'Kangpokpi', 'Bishnupur'],
    'Churachandpur': ['Bishnupur', 'Chandel', 'Pherzawl'],
    
    # Default
    'Default': []
}

# Helper function to get all districts as a flat list
def get_all_districts():
    """Returns flat list of all 169 NE districts"""
    all_districts = []
    for state, data in NE_STATES_DISTRICTS.items():
        all_districts.extend(data['districts'])
    return all_districts

# Helper function to get state from district
def get_state_from_district(district_name):
    """Returns the state for a given district name"""
    for state, data in NE_STATES_DISTRICTS.items():
        if district_name in data['districts']:
            return state
    return None
