import { lazy, Suspense } from 'react';
import { RiskScoreData, DistrictStats } from '@/app/services/api';
import { RiskScoreCard } from '@/app/components/risk-score-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
// Lazy load the heavy map component
const RiskMap = lazy(() => import('@/app/components/risk-map').then(m => ({ default: m.RiskMap })));
import { AlertCircle, MessageSquare, MonitorCheck } from 'lucide-react';
// Note: We'll borrow SeverityDot from existing component or create new utility
import { Skeleton } from '@/app/components/ui/skeleton';
import { MorningBriefingCard } from '@/app/components/morning-briefing-card';
import { ActionPlaybookCard } from '@/app/components/action-playbook-card';
import { SeverityDot } from '@/app/components/severity-indicator';
import { Breadcrumbs } from '@/app/components/breadcrumbs';

interface DashboardPageProps {
    riskData: RiskScoreData | null;
    stats?: DistrictStats | null;
    loading: boolean;
    selectedDistrict: string;
}

export function DashboardPage({ riskData, stats, loading, selectedDistrict }: DashboardPageProps) {
    const renderSkeletons = () => (
        <div className="space-y-6">
            <Skeleton className="h-[200px] rounded-lg" /> {/* Morning Briefing Skeleton */}

            {/* Skeleton for Mid Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-[320px] rounded-lg" />
                <Skeleton className="lg:col-span-2 h-[320px] rounded-lg" />
            </div>
            {/* Skeleton for Map/Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-[350px] rounded-lg" />
                <div className="space-y-4">
                    <Skeleton className="h-[108px] rounded-lg" />
                    <Skeleton className="h-[108px] rounded-lg" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <Breadcrumbs />

            {loading ? renderSkeletons() : (
                <>
                    {!riskData ? (
                        <div className="flex flex-col items-center justify-center p-12 py-24 text-center border border-dashed border-border rounded-lg bg-card/50">
                            <div className="rounded-full bg-background-tertiary p-3 mb-4">
                                <AlertCircle className="w-6 h-6 text-foreground-tertiary" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No Intelligence Data</h3>
                            <p className="text-foreground-secondary max-w-sm mt-2">
                                Select a district with active data or ingest new intelligence to generate a risk profile.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* NEW: High-level Intelligence Briefing */}
                            <MorningBriefingCard district={selectedDistrict} className="mb-2" />

                            {/* Middle Tier: Risk Context & Playbook */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 flex flex-col gap-6">
                                    <RiskScoreCard
                                        score={riskData.score}
                                        trend={riskData.trend}
                                        riskLevel={riskData.risk_level}
                                        lastUpdated={new Date(riskData.timestamp).toLocaleTimeString()}
                                        components={riskData.components}
                                        layer_scores={riskData.layer_scores}
                                        district={selectedDistrict}
                                        primary_trigger={riskData.primary_trigger}
                                        className="flex-1"
                                    />

                                    {/* Hotspot Summary (Compact) */}
                                    <Card className="border-border-subtle">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs font-bold text-foreground-secondary uppercase tracking-widest">
                                                Active Hotspots Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {(riskData.hotspots || []).slice(0, 4).map((hotspot, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2.5 bg-background-tertiary rounded border border-border-subtle">
                                                        <div className="flex items-center gap-2.5">
                                                            <SeverityDot level={hotspot.severity} size="sm" />
                                                            <span className="text-sm font-medium text-foreground">{hotspot.location}</span>
                                                        </div>
                                                        <span className="text-[10px] text-foreground-tertiary font-mono">
                                                            {hotspot.incidents} Signals
                                                        </span>
                                                    </div>
                                                ))}
                                                {(riskData.hotspots?.length || 0) === 0 && (
                                                    <div className="col-span-2 text-xs text-foreground-tertiary italic">
                                                        No active hotspots detected in this district.
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="lg:col-span-1">
                                    <ActionPlaybookCard district={selectedDistrict} />
                                </div>
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
                                        <Suspense fallback={
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-foreground-secondary text-sm">Loading map...</div>
                                            </div>
                                        }>
                                            <RiskMap
                                                district={selectedDistrict}
                                                velocity={riskData.components?.velocity || 0}
                                            />
                                        </Suspense>
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
                        </>
                    )}
                </>
            )}
        </div>
    );
}
