import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendData {
    timestamp: string;
    score: number;
    cognitive?: number;
    network?: number;
    physical?: number;
}

interface RiskTrendChartProps {
    data: TrendData[];
    showLayers?: boolean;
    district?: string;
}

/**
 * Risk Trend Chart Component
 */
export function RiskTrendChart({ data, showLayers = false, district }: RiskTrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
                No trend data available
            </div>
        );
    }

    const firstScore = data[0]?.score || 0;
    const lastScore = data[data.length - 1]?.score || 0;
    const change = lastScore - firstScore;
    const percentChange = firstScore > 0 ? ((change / firstScore) * 100).toFixed(1) : '0';

    const getTrendIcon = () => {
        if (change > 5) return <TrendingUp className="w-5 h-5 text-red-500" />;
        if (change < -5) return <TrendingDown className="w-5 h-5 text-green-500" />;
        return <Minus className="w-5 h-5 text-slate-500" />;
    };

    return (
        <div className="space-y-4">
            {/* Trend Summary */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        {district ? `${district} Risk Trend` : 'Risk Score Trend'}
                    </h3>
                    <p className="text-sm text-slate-600">
                        Historical risk score progression
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {getTrendIcon()}
                    <div className="text-right">
                        <div className="text-2xl font-bold">
                            {lastScore.toFixed(1)}
                        </div>
                        <div className={`text-sm ${change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-slate-500'}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)} ({percentChange}%)
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Chart */}
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />

                    {/* Threshold Lines */}
                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label="Elevated (60)" />
                    <ReferenceLine y={75} stroke="#f97316" strokeDasharray="3 3" label="High (75)" />
                    <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" label="Critical (90)" />

                    {/* Overall Score */}
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Overall Risk Score"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />

                    {/* Layer Scores */}
                    {showLayers && (
                        <>
                            <Line
                                type="monotone"
                                dataKey="cognitive"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                name="Cognitive"
                                strokeDasharray="5 5"
                            />
                            <Line
                                type="monotone"
                                dataKey="network"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="Network"
                                strokeDasharray="5 5"
                            />
                            <Line
                                type="monotone"
                                dataKey="physical"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                name="Physical"
                                strokeDasharray="5 5"
                            />
                        </>
                    )}
                </LineChart>
            </ResponsiveContainer>

            {/* Data Points Summary */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                    <div className="text-slate-600">First</div>
                    <div className="font-semibold">{firstScore.toFixed(1)}</div>
                </div>
                <div>
                    <div className="text-slate-600">Average</div>
                    <div className="font-semibold">
                        {(data.reduce((sum, d) => sum + d.score, 0) / data.length).toFixed(1)}
                    </div>
                </div>
                <div>
                    <div className="text-slate-600">Latest</div>
                    <div className="font-semibold">{lastScore.toFixed(1)}</div>
                </div>
            </div>
        </div>
    );
}
