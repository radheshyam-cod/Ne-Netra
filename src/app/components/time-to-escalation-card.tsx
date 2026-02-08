import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Clock, AlertTriangle, Info } from 'lucide-react';

interface TimeToEscalationProps {
    window: string;
    basis: string[];
    confidence: string;
    disclaimer: string;
}

export function TimeToEscalationCard({ window, basis, confidence, disclaimer }: TimeToEscalationProps) {
    // Determine color based on window category
    const getUrgencyColor = (window: string) => {
        if (window.includes('IMMINENT')) {
            return {
                bg: 'bg-red-500/10',
                border: 'border-red-500/20',
                text: 'text-red-700',
                icon: 'text-red-600'
            };
        } else if (window.includes('EARLY')) {
            return {
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                text: 'text-amber-700',
                icon: 'text-amber-600'
            };
        } else if (window.includes('MONITOR')) {
            return {
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/20',
                text: 'text-yellow-700',
                icon: 'text-yellow-600'
            };
        } else {
            return {
                bg: 'bg-green-500/10',
                border: 'border-green-500/20',
                text: 'text-green-700',
                icon: 'text-green-600'
            };
        }
    };

    const colors = getUrgencyColor(window);

    return (
        <Card className={`border ${colors.border} ${colors.bg}`}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground-secondary uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Early-Warning Time Window
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Window Category */}
                <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${colors.icon}`} />
                    <div>
                        <p className={`text-2xl font-bold ${colors.text}`}>{window}</p>
                        <p className="text-xs text-foreground-tertiary">
                            Confidence: <span className="font-medium capitalize">{confidence}</span>
                        </p>
                    </div>
                </div>

                {/* Basis Factors */}
                <div className="pt-2 border-t border-border-subtle">
                    <p className="text-xs text-foreground-tertiary mb-1.5">Based on:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {basis.map((factor, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-background-tertiary text-foreground border border-border-subtle"
                            >
                                {factor.replace(/_/g, ' ')}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className={`flex items-start gap-2 p-2 rounded ${colors.bg} border ${colors.border}`}>
                    <Info className="w-4 h-4 mt-0.5 shrink-0 text-foreground-tertiary" />
                    <p className="text-xs text-foreground-secondary italic leading-relaxed">
                        {disclaimer}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
