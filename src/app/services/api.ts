/**
 * API Service for NE-NETRA Frontend
 * Handles all backend communication
 * Supports Offline-First via OfflineManager
 */

import { offlineManager } from './offline-manager';
import { mockApi } from './mock-api';

const NGROK_URL = 'https://ne-netra-backend.loca.lt'; // Stable localtunnel URL

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/api'
  : NGROK_URL;

// Always use mock API when not on localhost
// const USE_MOCK = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
const USE_MOCK = false;

export interface RiskScoreData {
  district: string;
  score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  trend: 'rising' | 'stable' | 'falling';
  primary_trigger: string;
  timestamp: string;
  components: {
    toxicity: number;
    velocity: number;
    geo_sensitivity: number;
    temporal_acceleration: number;
  };
  layer_scores?: {
    cognitive: number;
    network: number;
    physical: number;
  };
  contributing_factors: Array<{
    label: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    value: string;
  }>;
  suggested_actions: Array<{
    id: string; // Added for React keys
    priority: 'low' | 'medium' | 'high';
    action: string;
    rationale: string;
  }>;
  hotspots: Array<{
    location: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    incidents: number;
    type: string;
  }>;
}

export interface AuditLogEntry {
  id: number;
  district: string;
  officer_name: string;
  action: string;
  timestamp: string;
}

export interface DistrictStats {
  district: string;
  total_messages: number;
  current_risk_score: number | null;
  current_risk_level: string | null;
  reviews_submitted: number;
}

export interface MessageIngest {
  district: string;
  text: string;
  source_type?: string;
  geo_sensitivity?: string;
  timestamp?: string;
}

export interface OfficerReviewInput {
  district: string;
  risk_score_id: number;
  officer_name: string;
  officer_rank: string;
  reviewed: boolean;
  notes: string;
  action_taken?: string;
}

class APIService {
  /**
   * Get risk score for a district
   */
  async getRiskScore(district: string): Promise<RiskScoreData> {
    if (USE_MOCK) {
      return mockApi.getRiskScore(district);
    }

    const response = await fetch(`${API_BASE_URL}/risk-score/${encodeURIComponent(district)}`, {
      headers: {
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch risk score: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get audit log for a district
   */
  async getAuditLog(district: string, limit: number = 10): Promise<AuditLogEntry[]> {
    if (USE_MOCK) {
      return mockApi.getAuditLog(district);
    }

    const response = await fetch(
      `${API_BASE_URL}/audit-log/${encodeURIComponent(district)}?limit=${limit}`, {
      headers: {
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
      }
    }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch audit log: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get historical risk scores for trend chart
   */
  async getRiskHistory(district: string): Promise<{ timestamp: string; score: number; risk_level: string }[]> {
    if (USE_MOCK) {
      return mockApi.getRiskHistory(district);
    }

    const response = await fetch(`${API_BASE_URL}/risk-history/${encodeURIComponent(district)}`, {
      headers: {
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch risk history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get list of available districts
   */
  async getDistricts(): Promise<string[]> {
    if (USE_MOCK) {
      return mockApi.getDistricts();
    }

    const response = await fetch(`${API_BASE_URL}/districts`, {
      headers: {
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch districts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.districts;
  }

  /**
   * Get statistics for a district
   */
  async getDistrictStats(district: string): Promise<DistrictStats> {
    const response = await fetch(`${API_BASE_URL}/stats/${encodeURIComponent(district)}`, {
      headers: {
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch district stats: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Submit officer review (Supports Offline)
   */
  async submitReview(review: OfficerReviewInput): Promise<{ status: string; review_id: number }> {
    if (USE_MOCK) {
      return mockApi.submitReview(review);
    }

    if (!navigator.onLine) {
      console.log('Offline mode: Queuing review submission');
      await offlineManager.queueRequest(
        `${API_BASE_URL}/review`,
        'POST',
        review
      );
      // Simulate success
      return { status: 'queued_offline', review_id: Date.now() };
    }

    const response = await fetch(`${API_BASE_URL}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(review),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit review: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Ingest a message (Supports Offline)
   */
  async ingestMessage(message: MessageIngest): Promise<any> {
    if (USE_MOCK) {
      return mockApi.ingestData(message);
    }

    if (!navigator.onLine) {
      console.log('Offline mode: Queuing message ingestion');
      await offlineManager.queueRequest(
        `${API_BASE_URL}/ingest`,
        'POST',
        message
      );
      return { status: 'queued_offline', message_id: Date.now(), district: message.district };
    }

    const response = await fetch(`${API_BASE_URL}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Failed to ingest message: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Trigger analysis for a district
   */
  async analyzeDistrict(district: string): Promise<any> {
    if (USE_MOCK) {
      return mockApi.analyzeDistrict(district);
    }

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ district }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze district: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check if API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new APIService();
