import { RiskScoreData, DistrictStats } from '@/app/services/api';
import { RiskScoreCard } from '@/app/components/risk-score-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { RiskMap } from '@/app/components/risk-map';
import { AlertCircle, MessageSquare, MonitorCheck } from 'lucide-react';
// Note: We'll borrow SeverityDot from existing component or create new utility
import { SeverityDot } from '@/app/components/severity-indicator';

import { Skeleton } from '@/app/components/ui/skeleton';

interface DashboardPageProps {
    riskData: RiskScoreData | null;
    stats?: DistrictStats | null;
    loading: boolean;
    selectedDistrict: string;
}

export function DashboardPage({ riskData, stats, loading, selectedDistrict }: DashboardPageProps) {
    if (loading) {
        return (
            <div className="space-y-6">
                {/* Skeleton for Top Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-[180px] rounded-lg" />
                    <Skeleton className="lg:col-span-2 h-[180px] rounded-lg" />
                </div>
                {/* Skeleton for Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-[300px] rounded-lg" />
                    <div className="space-y-4">
                        <Skeleton className="h-[140px] rounded-lg" />
                        <Skeleton className="h-[140px] rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!riskData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 py-24 text-center border border-dashed border-border rounded-lg bg-card/50">
                <div className="rounded-full bg-background-tertiary p-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-foreground-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No Intelligence Data</h3>
                <p className="text-foreground-secondary max-w-sm mt-2">
                    Select a district with active data or ingest new intelligence to generate a risk profile.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Row: Risk Score & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Primary Metric */}
                <div className="lg:col-span-1">
                    <RiskScoreCard
                        score={riskData.score}
                        trend={riskData.trend}
                        riskLevel={riskData.risk_level}
                        lastUpdated={new Date(riskData.timestamp).toLocaleTimeString()}
                    />
                </div>

                {/* Hotspot Summary (Compact) */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-foreground-secondary uppercase tracking-wider">
                            Active Hotspots
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(riskData.hotspots || []).slice(0, 4).map((hotspot, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-background-tertiary rounded border border-border-subtle">
                                    <div className="flex items-center gap-3">
                                        <SeverityDot level={hotspot.severity} size="sm" />
                                        <span className="font-medium text-foreground">{hotspot.location}</span>
                                    </div>
                                    <span className="text-xs text-foreground-tertiary tabular-nums">
                                        {hotspot.incidents} Signals
                                    </span>
                                </div>
                            ))}
                            {(riskData.hotspots?.length || 0) === 0 && (
                                <div className="col-span-2 text-sm text-foreground-tertiary italic">
                                    No active hotspots detected in this district.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Map Preview & Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Preview (Small) */}
                <Card className="lg:col-span-2 overflow-hidden border-border-subtle">
                    <CardHeader className="bg-card-header/50 border-b border-border pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium text-foreground">Geographic Risk Preview</CardTitle>
                            <span className="text-xs text-foreground-tertiary uppercase tracking-wider">Live H3 Layer</span>
                        </div>
                    </CardHeader>
                    <div className="h-[250px] relative bg-background-tertiary">
                        <RiskMap
                            district={selectedDistrict}
                            velocity={riskData.components?.velocity || 0}
                        />
                    </div>
                </Card>

                {/* District Statistics */}
                <div className="grid grid-cols-1 gap-4">
                    <Card className="p-4 flex items-center gap-4 border-border-subtle bg-card/50">
                        <div className="p-3 bg-primary/10 rounded text-primary">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-foreground-secondary uppercase tracking-wider">Signals Analyzed</p>
                            <p className="text-2xl font-mono font-bold text-foreground">
                                {stats?.total_messages || 0}
                            </p>
                        </div>
                    </Card>

                    <Card className="p-4 flex items-center gap-4 border-border-subtle bg-card/50">
                        <div className="p-3 bg-primary/10 rounded text-primary">
                            <MonitorCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-foreground-secondary uppercase tracking-wider">Officer Reviews</p>
                            <p className="text-2xl font-mono font-bold text-foreground">
                                {stats?.reviews_submitted || 0}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
