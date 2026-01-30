import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RiskTrendChartProps {
    data?: any[];
    className?: string;
}

export function RiskTrendChart({ data = [], className }: RiskTrendChartProps) {
    // Process data for Chart (format timestamp)
    const chartData = data.map(d => ({
        ...d,
        time: format(new Date(d.timestamp), 'HH:mm'), // Format 24h time
        fullDate: format(new Date(d.timestamp), 'MMM d, HH:mm')
    }));

    // Determine color based on latest score
    const latestScore = chartData[chartData.length - 1]?.score || 0;

    // Default dynamic color logic
    let strokeColor = '#10b981'; // green
    if (latestScore > 75) strokeColor = '#ef4444'; // red
    else if (latestScore > 50) strokeColor = '#f59e0b'; // amber

    return (
        <Card className={cn("border-border shadow-sm", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground-secondary uppercase tracking-wider">
                    24-Hour Risk Trend
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                    itemStyle={{ color: strokeColor }}
                                    labelStyle={{ color: '#94a3b8' }}
                                    labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke={strokeColor}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-foreground-secondary text-sm">
                            No trend data available for this period.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
