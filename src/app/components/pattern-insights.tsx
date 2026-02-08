import { useEffect, useState } from 'react';
import { Lightbulb, Calendar, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface PatternInsightsProps {
    district: string;
    historicalData: Array<{
        date: string;
        risk_score: number;
        signal_count?: number;
        incident_count?: number;
    }>;
}

interface Pattern {
    type: 'seasonal' | 'spillover' | 'trigger_sequence';
    description: string;
    confidence: number;
    historical_matches: number;
    example: string;
}

/**
 * Pattern Recognition Dashboard Component
 */
export function PatternInsights({ district, historicalData }: PatternInsightsProps) {
    const [patterns, setPatterns] = useState<Pattern[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (historicalData.length >= 90) { // Need 3+ months
            loadPatterns();
        }
    }, [district, historicalData]);

    const loadPatterns = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/patterns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    district,
                    historical_data: historicalData
                })
            });

            if (response.ok) {
                const data = await response.json();
                setPatterns(data.patterns || []);
            }
        } catch (error) {
            console.error('Failed to load patterns:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPatternIcon = (type: Pattern['type']) => {
        switch (type) {
            case 'seasonal': return <Calendar className="w-4 h-4" />;
            case 'trigger_sequence': return <Zap className="w-4 h-4" />;
            case 'spillover': return <TrendingUp className="w-4 h-4" />;
        }
    };

    const getPatternColor = (confidence: number) => {
        if (confidence >= 0.8) return 'bg-green-100 text-green-700 border-green-200';
        if (confidence >= 0.6) return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Pattern Insights
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-slate-500">Analyzing historical patterns...</div>
                </CardContent>
            </Card>
        );
    }

    if (patterns.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Pattern Insights
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-slate-500">
                        No significant patterns detected yet. More historical data needed (90+ days).
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Pattern Insights
                    <Badge variant="outline" className="ml-auto">
                        {patterns.length} patterns found
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {patterns.map((pattern, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-lg border ${getPatternColor(pattern.confidence)}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {getPatternIcon(pattern.type)}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-medium leading-relaxed">
                                            {pattern.description}
                                        </p>
                                        <Badge variant="outline" className="text-xs flex-shrink-0">
                                            {(pattern.confidence * 100).toFixed(0)}%
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <span className="font-medium">{pattern.historical_matches}</span>
                                            historical matches
                                        </span>
                                        <span className="text-slate-400">•</span>
                                        <span className="italic">{pattern.example}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-slate-400 italic mt-4">
                    Pattern Analysis • Based on {historicalData.length} days of data
                </p>
            </CardContent>
        </Card>
    );
}
