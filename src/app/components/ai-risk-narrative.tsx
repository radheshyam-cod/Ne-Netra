import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface AIRiskNarrativeProps {
    district: string;
    riskScore: number;
    riskLevel: string;
    signals: any[];
    layerScores?: {
        cognitive: number;
        network: number;
        physical: number;
    };
}

interface NarrativeData {
    summary: string;
    key_factors: string[];
    recommendations: string[];
    confidence: number;
}

/**
 * AI-Powered Risk Narrative Component
 */
export function AIRiskNarrative({ district, riskScore, riskLevel, signals, layerScores }: AIRiskNarrativeProps) {
    const [narrative, setNarrative] = useState<NarrativeData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNarrative();
    }, [district, riskScore]);

    const loadNarrative = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/narrative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    district,
                    risk_score: riskScore,
                    risk_level: riskLevel,
                    signals: signals.slice(0, 5), // Top 5
                    layer_scores: layerScores || {}
                })
            });

            if (response.ok) {
                const data = await response.json();
                setNarrative(data);
            }
        } catch (error) {
            console.error('Failed to load AI narrative:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        AI Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!narrative) return null;

    return (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI-Powered Analysis
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                        {(narrative.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary */}
                <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <p className="text-sm leading-relaxed text-slate-700">
                        {narrative.summary}
                    </p>
                </div>

                {/* Key Factors */}
                {narrative.key_factors.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Key Contributing Factors
                        </h4>
                        <ul className="space-y-1">
                            {narrative.key_factors.map((factor, idx) => (
                                <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                    <span className="text-purple-500 mt-1">•</span>
                                    <span>{factor}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Recommendations */}
                {narrative.recommendations.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Recommended Actions
                        </h4>
                        <ul className="space-y-1">
                            {narrative.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <p className="text-xs text-slate-400 italic">
                    Generated by AI • Review all recommendations before action
                </p>
            </CardContent>
        </Card>
    );
}
