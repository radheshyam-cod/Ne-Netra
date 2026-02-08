import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RiskScoreData } from '../services/api';

interface ComparisonChartsProps {
    districts: string[];
    data: Record<string, RiskScoreData>;
}

/**
 * Comparison Charts (Radar and Bar)
 */
export function ComparisonCharts({ districts, data }: ComparisonChartsProps) {
    // Prepare radar chart data
    const radarData = [
        {
            layer: 'Cognitive',
            ...districts.reduce((acc, d) => ({
                ...acc,
                [d]: data[d]?.layer_scores?.cognitive || 0
            }), {})
        },
        {
            layer: 'Network',
            ...districts.reduce((acc, d) => ({
                ...acc,
                [d]: data[d]?.layer_scores?.network || 0
            }), {})
        },
        {
            layer: 'Physical',
            ...districts.reduce((acc, d) => ({
                ...acc,
                [d]: data[d]?.layer_scores?.physical || 0
            }), {})
        },
    ];

    // Prepare bar chart data
    const barData = districts.map(district => ({
        district,
        score: data[district]?.score || 0,
        cognitive: data[district]?.layer_scores?.cognitive || 0,
        network: data[district]?.layer_scores?.network || 0,
        physical: data[district]?.layer_scores?.physical || 0,
    }));

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-6">
            {/* Radar Chart */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Layer Comparison (Radar)</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="layer" />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} />
                        {districts.map((district, idx) => (
                            <Radar
                                key={district}
                                name={district}
                                dataKey={district}
                                stroke={colors[idx % colors.length]}
                                fill={colors[idx % colors.length]}
                                fillOpacity={0.3}
                            />
                        ))}
                        <Legend />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart - Overall Scores */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Risk Score Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="district" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#3b82f6" name="Overall Risk Score" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Stacked Bar Chart - Layer Breakdown */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Layer Score Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="district" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cognitive" stackId="a" fill="#3b82f6" name="Cognitive" />
                        <Bar dataKey="network" stackId="a" fill="#10b981" name="Network" />
                        <Bar dataKey="physical" stackId="a" fill="#f59e0b" name="Physical" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
