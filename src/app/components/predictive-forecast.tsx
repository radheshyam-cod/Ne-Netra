import { useEffect, useState } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface PredictiveForecastProps {
    district: string;
    historicalData: Array<{
        date: string;
        risk_score: number;
        signal_count: number;
        avg_severity: number;
    }>;
}

interface Prediction {
    date: string;
    score: number;
    confidence_low: number;
    confidence_high: number;
}

interface ForecastData {
    predictions: Prediction[];
    trend: 'rising' | 'falling' | 'stable';
    peak_day: number;
    average: number;
}

/**
 * 7-Day Predictive Forecast Component
 */
export function PredictiveForecast({ district, historicalData }: PredictiveForecastProps) {
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (historicalData.length > 30) { // Need enough history
            loadForecast();
        }
    }, [district, historicalData]);

    const loadForecast = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    district,
                    historical_data: historicalData
                })
            });

            if (response.ok) {
                const data = await response.json();
                setForecast(data);
            }
        } catch (error) {
            console.error('Failed to load forecast:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>7-Day Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="text-slate-500">Loading prediction...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!forecast) return null;

    const getTrendIcon = () => {
        switch (forecast.trend) {
            case 'rising':
                return <TrendingUp className="w-4 h-4 text-red-500" />;
            case 'falling':
                return <TrendingUp className="w-4 h-4 text-green-500 transform rotate-180" />;
            default:
                return <TrendingUp className="w-4 h-4 text-slate-500 transform rotate-90" />;
        }
    };

    const getTrendColor = () => {
        switch (forecast.trend) {
            case 'rising': return 'text-red-600 bg-red-50';
            case 'falling': return 'text-green-600 bg-green-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    // Prepare chart data
    const chartData = forecast.predictions.map(p => ({
        date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: p.score,
        low: p.confidence_low,
        high: p.confidence_high
    }));

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        7-Day Predictive Forecast
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {getTrendIcon()}
                        <Badge className={getTrendColor()}>
                            {forecast.trend.toUpperCase()}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Forecast Chart */}
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />

                        {/* Confidence interval */}
                        <Area
                            type="monotone"
                            dataKey="low"
                            stackId="1"
                            stroke="none"
                            fill="#e0e7ff"
                            fillOpacity={0.3}
                        />
                        <Area
                            type="monotone"
                            dataKey="high"
                            stackId="1"
                            stroke="none"
                            fill="#e0e7ff"
                            fillOpacity={0.3}
                        />

                        {/* Predicted score */}
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            name="Predicted Score"
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Insights */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">
                            {forecast.average.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">Avg Forecast</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-orange-600">
                            Day {forecast.peak_day}
                        </div>
                        <div className="text-xs text-slate-500">Peak Risk Day</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-purple-600">
                            {forecast.predictions[6].score.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">7-Day Score</div>
                    </div>
                </div>

                {/* Warning if peak is high */}
                {forecast.predictions[forecast.peak_day - 1].score > 75 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <strong>High Risk Forecast:</strong> Model predicts elevated risk on Day {forecast.peak_day}.
                            Recommend proactive measures.
                        </div>
                    </div>
                )}

                <p className="text-xs text-slate-400 italic mt-4">
                    ML Prediction • Based on {historicalData.length} days of historical data
                </p>
            </CardContent>
        </Card>
    );
}
