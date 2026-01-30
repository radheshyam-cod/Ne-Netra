import { RiskExplanationPanel } from '@/app/components/risk-explanation-panel';
import { RiskScoreData } from '@/app/services/api';
import { RiskTrendChart } from '@/app/components/charts/RiskTrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Brain, Network, Map, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Button } from '@/app/components/ui/button';
import { exportRiskAnalysisPDF, exportRiskHistoryCSV } from '@/app/utils/export';


interface RiskAnalysisPageProps {
    riskData: RiskScoreData | null;
    history?: any[];
    loading?: boolean;
    selectedDistrict?: string;
}

export function RiskAnalysisPage({ riskData, history = [], loading = false, selectedDistrict = 'Unknown' }: RiskAnalysisPageProps) {
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-end justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-12 w-24" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6 lg:col-span-2">
                        <Skeleton className="h-[250px] w-full" />
                        <Skeleton className="h-[400px] w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-[300px] w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!riskData) {
        return <div className="text-foreground-secondary">Select a district to view analysis.</div>;
    }

    const { layer_scores } = riskData;

    // Calculate Volatility (Standard Deviation)
    const scores = history.map(h => h.score);
    const mean = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (scores.length || 1);
    const stdDev = Math.sqrt(variance);

    const handleExportPDF = () => {
        exportRiskAnalysisPDF(selectedDistrict, riskData, history);
    };

    const handleExportHistoryCSV = () => {
        exportRiskHistoryCSV(selectedDistrict, history);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Risk Analysis Breakdown</h2>
                    <p className="text-foreground-secondary mt-1">
                        Detailed factor analysis and explainable AI reasoning for the current risk score.
                    </p>
                </div>
                <div className="flex items-center gap-3">{scores.length > 1 && (
                    <div className="text-right">
                        <p className="text-xs text-foreground-secondary uppercase tracking-wider"> volatility index (σ)</p>
                        <p className={cn("text-xl font-mono font-bold", stdDev > 15 ? "text-red-400" : "text-emerald-400")}>
                            {stdDev.toFixed(2)}
                        </p>
                    </div>
                )}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleExportPDF}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </Button>
                        <Button
                            onClick={handleExportHistoryCSV}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Trend Chart & Model Breakdown */}
                <div className="space-y-6 lg:col-span-2">
                    <RiskTrendChart data={history} />

                    <RiskExplanationPanel
                        primaryTrigger={riskData.primary_trigger}
                        contributingFactors={riskData.contributing_factors}
                    />
                </div>

                {/* Right Col: 3-Layer Visuals */}
                <div className="space-y-6">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-base">3-Layer Model Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Layer 1 */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-foreground-secondary">
                                        <Brain className="w-4 h-4 text-blue-400" />
                                        Cognitive Layer
                                    </div>
                                    <span className="font-mono font-bold text-foreground">
                                        {layer_scores?.cognitive || 0}/10
                                    </span>
                                </div>
                                <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-500"
                                        style={{ width: `${((layer_scores?.cognitive || 0) / 10) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-foreground-tertiary">Sentiment, Toxicity, Code-switching</p>
                            </div>

                            {/* Layer 2 */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-foreground-secondary">
                                        <Network className="w-4 h-4 text-amber-400" />
                                        Network Layer
                                    </div>
                                    <span className="font-mono font-bold text-foreground">
                                        {layer_scores?.network || 0}/10
                                    </span>
                                </div>
                                <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 transition-all duration-500"
                                        style={{ width: `${((layer_scores?.network || 0) / 10) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-foreground-tertiary">Velocity, Viral Spread, Echo Chambers</p>
                            </div>

                            {/* Layer 3 */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-foreground-secondary">
                                        <Map className="w-4 h-4 text-red-400" />
                                        Physical Layer
                                    </div>
                                    <span className="font-mono font-bold text-foreground">
                                        {layer_scores?.physical || 0}/10
                                    </span>
                                </div>
                                <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 transition-all duration-500"
                                        style={{ width: `${((layer_scores?.physical || 0) / 10) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-foreground-tertiary">Geo-location, Sensitive Zones, History</p>
                            </div>

                        </CardContent>
                    </Card>

                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-xs text-foreground-secondary">
                        <strong className="block mb-1 text-primary">Explainability Note:</strong>
                        The NE-NETRA model weighs the <strong>Physical Layer</strong> 20% higher in sensitive border districts.
                    </div>
                </div>
            </div>
        </div>
    );
}
