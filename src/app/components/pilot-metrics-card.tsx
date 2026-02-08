import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { BarChart3, AlertCircle } from 'lucide-react';

interface PilotMetricsProps {
    metricsType: string;
    dataScope: string;
    precisionTarget: number;
    falsePositiveTarget: number;
    lastValidationDate: string;
    validationNote: string;
    disclaimer: string;
    pilotDuration: string;
    status: string;
}

export function PilotMetricsCard({
    metricsType,
    dataScope,
    precisionTarget,
    falsePositiveTarget,
    lastValidationDate,
    validationNote,
    disclaimer,
    pilotDuration,
    status
}: PilotMetricsProps) {
    return (
        <Card className="border-border-subtle">
            <CardHeader className="pb-3 bg-card-header/30 border-b border-border">
                <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Pilot Performance Metrics
                </CardTitle>
                <p className="text-xs text-foreground-tertiary mt-1">Read-only · {dataScope}</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {/* Metrics Type Badge */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 border border-blue-500/20">
                        {metricsType === 'target' ? 'Target Metrics' : 'Last Validation'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status === 'active' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-gray-500/10 text-gray-700 border-gray-500/20'
                        } border`}>
                        {status === '

active' ? 'Pilot Active' : status}
                    </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-background-tertiary rounded border border-border-subtle">
                        <p className="text-xs text-foreground-tertiary mb-1">Precision Target</p>
                        <p className="text-2xl font-mono font-bold text-foreground">≥{(precisionTarget * 100).toFixed(0)}%</p>
                    </div>
                    <div className="p-3 bg-background-tertiary rounded border border-border-subtle">
                        <p className="text-xs text-foreground-tertiary mb-1">False Positive Target</p>
                        <p className="text-2xl font-mono font-bold text-foreground">≤{(falsePositiveTarget * 100).toFixed(0)}%</p>
                    </div>
                </div>

                {/* Validation Info */}
                <div className="pt-2 border-t border-border-subtle">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-foreground-tertiary">Last Validation</p>
                        <p className="text-xs font-mono text-foreground">{lastValidationDate}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-foreground-tertiary">Pilot Duration</p>
                        <p className="text-xs font-medium text-foreground">{pilotDuration}</p>
                    </div>
                </div>

                {/* Validation Note */}
                <div className="p-2 bg-blue-500/5 border border-blue-500/10 rounded">
                    <p className="text-xs text-foreground-secondary italic">{validationNote}</p>
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2 p-2.5 rounded bg-amber-500/5 border border-amber-500/10">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                        <span className="font-semibold">Disclaimer:</span> {disclaimer}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
