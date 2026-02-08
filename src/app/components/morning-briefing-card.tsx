import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Sparkles, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { Skeleton } from '@/app/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface BriefingData {
    briefing: string;
    urgent_alerts: string[];
    outlook: string;
}

interface MorningBriefingCardProps {
    district: string;
    className?: string;
}

export function MorningBriefingCard({ district, className }: MorningBriefingCardProps) {
    const [data, setData] = useState<BriefingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchBriefing() {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/ai/briefing/${district}`);
                if (!response.ok) throw new Error('Failed to fetch briefing');
                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error(err);
                setError('Unable to load intelligence briefing');
            } finally {
                setLoading(false);
            }
        }

        if (district) {
            fetchBriefing();
        }
    }, [district]);

    if (loading) {
        return (
            <Card className={cn("overflow-hidden border-primary/20 bg-primary/5", className)}>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        Intelligence Briefing
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-3/4" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className={cn("border-border/50", className)}>
                <CardContent className="p-6 flex items-center justify-center text-foreground-tertiary text-sm">
                    <Info className="w-4 h-4 mr-2" />
                    {error || 'No briefing available'}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background relative group transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5",
            className
        )}>
            {/* Ambient background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary font-bold tracking-tight">
                        <Sparkles className="w-5 h-5" />
                        Intelligence Briefing
                    </CardTitle>
                    <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-semibold uppercase tracking-widest animate-pulse">
                        Live AI Insights
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Main Briefing Text */}
                <div className="relative">
                    <p className="text-foreground leading-relaxed text-[15px] font-medium italic">
                        "{data.briefing}"
                    </p>
                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary/30 rounded-full" />
                </div>

                {/* Urgent Alerts Section */}
                {data.urgent_alerts.length > 0 && data.urgent_alerts[0] !== "No urgent flash alerts at this time" && (
                    <div className="space-y-2 pt-2">
                        <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />
                            Urgent Flash Alerts
                        </h4>
                        <div className="grid gap-2">
                            {data.urgent_alerts.map((alert, idx) => (
                                <div key={idx} className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
                                    {alert}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Outlook Section */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary/70" />
                        <span className="text-[11px] text-foreground-secondary font-semibold uppercase tracking-wider">
                            Temporal Outlook:
                        </span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                        {data.outlook}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
