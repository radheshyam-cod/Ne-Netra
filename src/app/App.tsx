import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiService, RiskScoreData, AuditLogEntry } from '@/app/services/api';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { ToastProvider } from '@/app/components/ui/toast';
import { BackToTopButton } from '@/app/components/back-to-top';

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import('@/app/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const IngestPage = lazy(() => import('@/app/pages/IngestPage').then(m => ({ default: m.IngestPage })));
const RiskAnalysisPage = lazy(() => import('@/app/pages/RiskAnalysisPage').then(m => ({ default: m.RiskAnalysisPage })));
const MapPage = lazy(() => import('@/app/pages/MapPage').then(m => ({ default: m.MapPage })));
const ActionsPage = lazy(() => import('@/app/pages/ActionsPage').then(m => ({ default: m.ActionsPage })));
const ReviewPage = lazy(() => import('@/app/pages/ReviewPage').then(m => ({ default: m.ReviewPage })));
const AuditPage = lazy(() => import('@/app/pages/AuditPage').then(m => ({ default: m.AuditPage })));

import { AlertCircle } from 'lucide-react';

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse text-foreground-secondary">Loading...</div>
  </div>
);

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [riskData, setRiskData] = useState<RiskScoreData | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [riskHistory, setRiskHistory] = useState<any[]>([]);
  const [districtStats, setDistrictStats] = useState<any>(null); // Use existing type if available or any
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(true);

  // Check API health on mount
  useEffect(() => {
    const checkAPI = async () => {
      const available = await apiService.healthCheck();
      setApiAvailable(available);

      if (!available) {
        setError('Backend API not available. Please start the backend server.');
        setLoading(false);
      }
    };

    checkAPI();
  }, []);

  // Load districts on mount
  useEffect(() => {
    if (!apiAvailable) return;

    const loadDistricts = async () => {
      try {
        const districtList = await apiService.getDistricts();

        // Handle both array and object response formats
        const districts = Array.isArray(districtList) ? districtList : districtList;

        setDistricts(districts);

        if (districts.length > 0) {
          setSelectedDistrict(districts[0]);
        } else {
          // Don't show error - all 169 districts are configured
          console.log('Districts loaded:', districts.length);
        }
      } catch (err) {
        console.error('Failed to load districts:', err);
        // Fallback to empty array - user can still navigate
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    };

    loadDistricts();
  }, [apiAvailable]);

  // Load data when district changes
  useEffect(() => {
    if (!selectedDistrict || !apiAvailable) return;

    const loadDistrictData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load risk score
        const risk = await apiService.getRiskScore(selectedDistrict);
        setRiskData(risk);

        // Load audit log
        const logs = await apiService.getAuditLog(selectedDistrict);
        setAuditLog(logs);

        // Load history
        const history = await apiService.getRiskHistory(selectedDistrict);
        setRiskHistory(history);

        // Load stats
        const stats = await apiService.getDistrictStats(selectedDistrict);
        setDistrictStats(stats);

      } catch (err) {
        setError(`Failed to load data for ${selectedDistrict}. ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDistrictData();
  }, [selectedDistrict, apiAvailable]);

  // Handle data refresh (e.g. after ingest)
  const handleRefresh = () => {
    if (selectedDistrict) {
      setLoading(true);
      Promise.all([
        apiService.getRiskScore(selectedDistrict),
        apiService.getAuditLog(selectedDistrict),
        apiService.getRiskHistory(selectedDistrict),
        apiService.getDistrictStats(selectedDistrict)
      ]).then(([risk, logs, history, stats]) => {
        setRiskData(risk);
        setAuditLog(logs);
        setRiskHistory(history);
        setDistrictStats(stats);
      }).finally(() => setLoading(false));
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (reviewData: any) => {
    try {
      await apiService.submitReview(reviewData);

      // Reload audit log
      const logs = await apiService.getAuditLog(selectedDistrict);
      setAuditLog(logs);

      return true;
    } catch (err) {
      console.error('Failed to submit review:', err);
      return false;
    }
  };

  // Global Error State (Critical)
  if (!apiAvailable) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
        <div className="max-w-md space-y-6 text-center">
          <AlertCircle className="w-16 h-16 text-severity-high mx-auto" />
          <h2 className="text-xl font-bold">System Offline</h2>
          <p className="text-foreground-secondary">Backend service is unreachable.</p>
        </div>
      </div>
    );
  }

  // Non-critical data loading error (Toast/Banner could be better, but simple alert for now)
  if (error && !loading && !riskData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
        <div className="max-w-md space-y-6 text-center">
          <AlertCircle className="w-16 h-16 text-severity-medium mx-auto" />
          <h2 className="text-xl font-bold">Data Loading Issue</h2>
          <p className="text-foreground-secondary">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary-hover"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={
            <AppLayout
              districts={districts}
              selectedDistrict={selectedDistrict}
              onDistrictChange={setSelectedDistrict}
            />
          }>
            <Route path="/" element={
              <DashboardPage
                riskData={riskData}
                stats={districtStats}
                loading={loading}
                selectedDistrict={selectedDistrict}
              />
            } />
            <Route path="/ingest" element={
              <IngestPage
                districts={districts}
                onIngestComplete={handleRefresh}
              />
            } />
            <Route path="/analysis" element={
              <RiskAnalysisPage riskData={riskData} history={riskHistory} loading={loading} selectedDistrict={selectedDistrict} />
            } />
            <Route path="/map" element={
              <MapPage
                riskData={riskData}
                selectedDistrict={selectedDistrict}
              />
            } />
            <Route path="/actions" element={
              <ActionsPage riskData={riskData} />
            } />
            <Route path="/review" element={
              <ReviewPage
                selectedDistrict={selectedDistrict}
                auditLog={auditLog}
                onReviewSubmit={handleReviewSubmit}
              />
            } />
            <Route path="/audit" element={
              <AuditPage auditLog={auditLog} selectedDistrict={selectedDistrict} />
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
      <BackToTopButton />
    </BrowserRouter>
  );
}

// Wrap the default export with ToastProvider
function AppWithProviders() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}

export { AppWithProviders as default };
