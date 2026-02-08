// Mock API service for GitHub Pages deployment
const MOCK_DATA = {
  // All 169 NE districts (organized by state)
  districts: [
    // Meghalaya (12)
    "East Garo Hills", "West Garo Hills", "North Garo Hills", "South Garo Hills", "South West Garo Hills",
    "East Khasi Hills", "West Khasi Hills", "South West Khasi Hills", "Eastern West Khasi Hills", "Ri-Bhoi",
    "East Jaintia Hills", "West Jaintia Hills",
    // Assam (35)
    "Baksa", "Bajali", "Barpeta", "Bongaigaon", "Chirang", "Dhubri", "Goalpara", "Kamrup", "Kamrup Metropolitan",
    "Kokrajhar", "Nalbari", "South Salmara-Mankachar", "Tamulpur", "Biswanath", "Darrang", "Sonitpur", "Udalguri",
    "Charaideo", "Dhemaji", "Dibrugarh", "Golaghat", "Jorhat", "Lakhimpur", "Majuli", "Sivasagar", "Tinsukia",
    "Dima Hasao", "Hojai", "Morigaon", "Nagaon", "Karbi Anglong", "West Karbi Anglong", "Cachar", "Hailakandi", "Karimganj",
    // Arunachal Pradesh (26)
    "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey",
    "Lepa-Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai",
    "Pakke-Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Dibang Valley",
    "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang",
    // Manipur (16)
    "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong",
    "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul",
    // Mizoram (11)
    "Aizawl", "Champhai", "Khawzawl", "Saitual", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Serchhip", "Saiha", "Hnahthial",
    // Nagaland (17)
    "Chümoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Meluri", "Mokokchung", "Mon", "Niuland",
    "Noklak", "Peren", "Phek", "Shamator", "Tuensang", "Tseminyü", "Wokha", "Zünheboto",
    // Tripura (8)
    "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura",
    // Sikkim (6)
    "East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim", "Pakyong", "Soreng"
  ],

  riskScores: {
    "East Khasi Hills": {
      district: "East Khasi Hills",
      score: 67,
      risk_level: "high",
      trend: "rising",
      primary_trigger: "High Border Sensitivity",
      last_updated: "2 hours ago",
      components: {
        toxicity: 18.5,
        velocity: 15.2,
        geo_sensitivity: 20.0,
        temporal_acceleration: 8.3
      },
      layer_scores: {
        cognitive: 3.7,
        network: 10.0,
        physical: 19.1
      },
      contributing_factors: [
        {
          label: "High Border Sensitivity",
          severity: "critical",
          value: "Score: 20/25"
        },
        {
          label: "Elevated Network Velocity",
          severity: "high",
          value: "15.2 msgs/hr"
        }
      ],
      suggested_actions: [
        {
          priority: "high",
          action: "Consider increasing patrol in hotspot areas",
          rationale: "High risk score with rising trend"
        }
      ],
      hotspots: [
        {
          location: "Market",
          severity: "high",
          incidents: 8,
          type: "market"
        }
      ]
    },
    "Dimapur": {
      district: "Dimapur",
      score: 42,
      risk_level: "medium",
      trend: "stable",
      primary_trigger: "Moderate Network Activity",
      last_updated: "1 hour ago",
      components: {
        toxicity: 12.3,
        velocity: 8.7,
        geo_sensitivity: 15.0,
        temporal_acceleration: 5.2
      },
      layer_scores: {
        cognitive: 2.1,
        network: 6.5,
        physical: 12.8
      },
      contributing_factors: [
        {
          label: "Moderate Network Activity",
          severity: "medium",
          value: "8.7 msgs/hr"
        }
      ],
      suggested_actions: [
        {
          priority: "medium",
          action: "Continue routine monitoring",
          rationale: "Stable medium risk level"
        }
      ],
      hotspots: []
    },
    "Aizawl": {
      district: "Aizawl",
      score: 18,
      risk_level: "low",
      trend: "falling",
      primary_trigger: "Low Activity",
      last_updated: "30 minutes ago",
      components: {
        toxicity: 5.2,
        velocity: 3.1,
        geo_sensitivity: 8.0,
        temporal_acceleration: 1.8
      },
      layer_scores: {
        cognitive: 1.2,
        network: 2.3,
        physical: 6.1
      },
      contributing_factors: [
        {
          label: "Low Network Activity",
          severity: "low",
          value: "3.1 msgs/hr"
        }
      ],
      suggested_actions: [
        {
          priority: "low",
          action: "Maintain baseline monitoring",
          rationale: "Low risk with decreasing trend"
        }
      ],
      hotspots: []
    }
  }
};

// Generate mock history data
const generateMockHistory = (district: string) => {
  const baseScore = MOCK_DATA.riskScores[district]?.score || 20;
  const history = [];

  for (let i = 23; i >= 0; i--) {
    const variation = Math.random() * 20 - 10;
    const score = Math.max(0, Math.min(100, baseScore + variation));
    history.push({
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      score: Math.round(score),
      risk_level: score > 60 ? 'high' : score > 30 ? 'medium' : 'low'
    });
  }

  return history;
};

export const mockApi = {
  async getDistricts() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_DATA.districts;
  },

  async getRiskScore(district: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DATA.riskScores[district] || MOCK_DATA.riskScores["Aizawl"];
  },

  async getRiskHistory(district: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return generateMockHistory(district);
  },

  async getAuditLog(district: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        officer_name: "SP Sharma",
        officer_rank: "Superintendent of Police",
        action: "Risk Assessment Reviewed",
        notes: "Increased patrol deployment in market area",
        risk_score_at_time: MOCK_DATA.riskScores[district]?.score || 20
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        officer_name: "DM Patel",
        officer_rank: "District Magistrate",
        action: "Situation Assessment",
        notes: "Coordinated with local authorities",
        risk_score_at_time: (MOCK_DATA.riskScores[district]?.score || 20) - 5
      }
    ];
  },

  async submitReview(reviewData: any) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true, message: "Review submitted successfully" };
  },

  async ingestData(data: any) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: "Data ingested successfully" };
  },

  async analyzeDistrict(district: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Analysis completed" };
  }
};