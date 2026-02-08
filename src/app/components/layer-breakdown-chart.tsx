import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Info, Layers } from 'lucide-react';

interface LayerBreakdownProps {
    cognitive: number;
    network: number;
    physical: number;
    district?: string;
}

export function LayerBreakdownChart({ cognitive, network, physical, district }: LayerBreakdownProps) {
    const data = [
        { layer: 'Cognitive', score: cognitive, fullName: 'Cognitive Risk (Language/Toxicity)' },
        { layer: 'Network', score: network, fullName: 'Network Risk (Velocity/Spread)' },
        { layer: 'Physical', score: physical, fullName: 'Physical Risk (Geo/Volatility)' }
    ];

    // Calculate total for percentage display
    const total = cognitive + network + physical;

    // Get color based on score
    const getColor = (score: number) => {
        if (score >= 7) return '#dc2626'; // red-600
        if (score >= 5) return '#f59e0b'; // amber-500
        if (score >= 3) return '#eab308'; // yellow-500
        return '#22c55e'; // green-500
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = total > 0 ? ((data.score / total) * 100).toFixed(1) : '0.0';
            return (
                <div className="bg-card border border-border rounded p-2 shadow-lg">
                    <p className="text-xs font-medium text-foreground">{data.fullName}</p>
                    <p className="text-sm font-bold text-primary">{data.score.toFixed(2)}/10</p>
                    <p className="text-xs text-foreground-tertiary">{percentage}% of total</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="border-border-subtle">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground-secondary uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    3-Layer Risk Model Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Chart */}
                <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                            <XAxis type="number" domain={[0, 10]} stroke="#94a3b8" fontSize={11} />
                            <YAxis
                                type="category"
                                dataKey="layer"
                                stroke="#94a3b8"
                                fontSize={12}
                                width={70}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Percentage Contributions */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle">
                    {data.map((layer) => {
                        const percentage = total > 0 ? ((layer.score / total) * 100).toFixed(1) : '0.0';
                        return (
                            <div key={layer.layer} className="text-center">
                                <p className="text-xs text-foreground-tertiary">{layer.layer}</p>
                                <p className="text-sm font-bold text-foreground">{percentage}%</p>
                            </div>
                        );
                    })}
                </div>

                {/* Weighting Explanation */}
                <div className="flex items-start gap-2 p-2 rounded bg-blue-500/5 border border-blue-500/10">
                    <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                        <span className="font-semibold">Layer Weighting:</span> Equal weighting (1:1:1) applied by default.
                        Physical layer may be weighted higher in sensitive districts based on geo-sensitivity.
                        {district && ` Current district: ${district}`}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
