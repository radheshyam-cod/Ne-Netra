import React, { useState } from 'react';
import { HelpCircle, AlertCircle, TrendingUp, Clock, Layers, Shield } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/app/components/ui/dialog';

interface AlertNarrativeProps {
    riskData: {
        score: number;
        risk_level: string;
        trend: string;
        primary_trigger?: string;
        layer_scores?: {
            cognitive: number;
            network: number;
            physical: number;
        };
        time_to_escalation?: {
            category: string;
            basis_factors?: string[];
            confidence?: string;
        };
        threshold_info?: {
            label: string;
            range: string;
        };
        district?: string;
    };
    variant?: 'icon' | 'button' | 'inline';
}

export function AlertNarrative({ riskData, variant = 'icon' }: AlertNarrativeProps) {
    const [open, setOpen] = useState(false);

    // Generate narrative explanation
    const generateNarrative = () => {
        const { score, primary_trigger, trend } = riskData;

        let severity = 'baseline';
        if (score >= 75) severity = 'critical';
        else if (score >= 60) severity = 'high';
        else if (score >= 30) severity = 'elevated';

        return {
            headline: getHeadline(severity, trend),
            explanation: getExplanation(severity, primary_trigger),
            actionContext: getActionContext(severity),
            timeContext: getTimeContext(),
            dataContext: getDataContext(),
        };
    };

    const getHeadline = (severity: string, trend: string) => {
        const trendText = trend === 'rising' ? 'increasing' : trend === 'falling' ? 'decreasing' : 'stable';

        const headlines = {
            critical: `🔴 Critical Priority Alert with ${trendText} trend`,
            high: `🟠 High Priority Signal with ${trendText} trend`,
            elevated: `🟡 Elevated Attention Signal with ${trendText} trend`,
            baseline: `🟢 Baseline Monitoring with ${trendText} trend`,
        };

        return headlines[severity as keyof typeof headlines] || headlines.baseline;
    };

    const getExplanation = (severity: string, trigger?: string) => {
        const triggerText = trigger || 'multiple factors';

        return `This ${severity}-level signal is shown because the AI analysis detected ${triggerText.toLowerCase()} 
    in aggregated district-level data. The system combines three independent layers (Cognitive, Network, Physical) 
    to calculate an advisory risk score.`;
    };

    const getActionContext = (severity: string) => {
        const contexts = {
            critical: 'This score suggests immediate officer review and consideration of coordinated response measures.',
            high: 'This score warrants priority attention and proactive monitoring by district authorities.',
            elevated: 'This score indicates the need for enhanced situational awareness and routine oversight.',
            baseline: 'This score reflects normal conditions requiring standard monitoring protocols.',
        };

        return contexts[severity as keyof typeof contexts] || contexts.baseline;
    };

    const getTimeContext = () => {
        if (!riskData.time_to_escalation) {
            return 'Time-to-escalation analysis is being calculated.';
        }

        const { category, confidence } = riskData.time_to_escalation;
        const confidenceText = confidence || 'medium';

        const timeContexts = {
            IMMINENT: `Escalation window: Next 2 hours (${confidenceText} confidence). This is a heuristic early-warning indicator, not a prediction.`,
            EARLY: `Escalation window: 2-4 hours (${confidenceText} confidence). Provides advance notice for preparation.`,
            MONITOR: `Escalation window: 4-6 hours (${confidenceText} confidence). Continue routine monitoring.`,
            BASELINE: 'No immediate escalation expected within 6-hour window. Maintain baseline protocols.',
        };

        return timeContexts[category as keyof typeof timeContexts] || timeContexts.BASELINE;
    };

    const getDataContext = () => {
        return `All analysis is performed on district-level aggregated data only. No individual tracking or surveillance. 
    This system provides decision support for human authorities - final decisions always remain with trained officers.`;
    };

    const narrative = generateNarrative();

    // Layer breakdown visualization
    const LayerBreakdown = () => {
        if (!riskData.layer_scores) return null;

        const { cognitive, network, physical } = riskData.layer_scores;
        const total = cognitive + network + physical;

        const layers = [
            { name: 'Cognitive Layer', value: cognitive, color: 'bg-blue-500', desc: 'Language patterns, sentiment, discourse themes' },
            { name: 'Network Layer', value: network, color: 'bg-purple-500', desc: 'Message velocity, diffusion patterns, temporal dynamics' },
            { name: 'Physical Layer', value: physical, color: 'bg-orange-500', desc: 'Geographic sensitivity, border proximity, market density' },
        ];

        return (
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Three-Layer Risk Model
                </h4>
                {layers.map((layer) => {
                    const percentage = total > 0 ? (layer.value / total) * 100 : 0;
                    return (
                        <div key={layer.name} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-foreground-secondary font-medium">{layer.name}</span>
                                <span className="text-foreground tabular-nums">{percentage.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${layer.color} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-foreground-tertiary">{layer.desc}</p>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Trigger button based on variant
    const TriggerButton = React.forwardRef<HTMLButtonElement>((props, ref) => {
        if (variant === 'icon') {
            return (
                <Button
                    ref={ref}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-background-tertiary"
                    aria-label="Why am I seeing this?"
                    {...props}
                >
                    <HelpCircle className="h-4 w-4 text-foreground-secondary" />
                </Button>
            );
        }

        if (variant === 'button') {
            return (
                <Button ref={ref} variant="outline" size="sm" className="gap-2" {...props}>
                    <HelpCircle className="h-4 w-4" />
                    Why am I seeing this?
                </Button>
            );
        }

        // inline variant
        return (
            <button ref={ref} className="inline-flex items-center gap-1 text-xs text-primary hover:underline" {...props}>
                <HelpCircle className="h-3 w-3" />
                Why am I seeing this?
            </button>
        );
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <TriggerButton />
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        Why Am I Seeing This Alert?
                    </DialogTitle>
                    <DialogDescription>
                        Transparency breakdown of this risk assessment
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Headline */}
                    <Card className="p-4 border-l-4 border-l-primary bg-background-secondary">
                        <h3 className="text-base font-semibold text-foreground mb-2">
                            {narrative.headline}
                        </h3>
                        <p className="text-sm text-foreground-secondary leading-relaxed">
                            {narrative.explanation}
                        </p>
                    </Card>

                    {/* Layer Breakdown */}
                    <Card className="p-4">
                        <LayerBreakdown />
                    </Card>

                    {/* Time Context */}
                    <Card className="p-4">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4" />
                            Escalation Time Window
                        </h4>
                        <p className="text-sm text-foreground-secondary leading-relaxed">
                            {narrative.timeContext}
                        </p>
                        {riskData.time_to_escalation?.basis_factors && (
                            <div className="mt-3 space-y-1">
                                <p className="text-xs font-medium text-foreground-tertiary">Basis factors:</p>
                                <ul className="text-xs text-foreground-tertiary space-y-0.5 ml-4">
                                    {riskData.time_to_escalation.basis_factors.map((factor, idx) => (
                                        <li key={idx} className="list-disc">{factor}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>

                    {/* Action Context */}
                    <Card className="p-4">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4" />
                            What This Means For You
                        </h4>
                        <p className="text-sm text-foreground-secondary leading-relaxed">
                            {narrative.actionContext}
                        </p>
                    </Card>

                    {/* Compliance & Data Context */}
                    <Card className="p-4 bg-background-tertiary border-border">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4" />
                            Data & Compliance
                        </h4>
                        <p className="text-sm text-foreground-secondary leading-relaxed">
                            {narrative.dataContext}
                        </p>
                        <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-foreground-tertiary">
                                ✓ DPDP Act 2023 aligned · ✓ No individual surveillance · ✓ District-level aggregation only · ✓ Human-in-the-loop governance
                            </p>
                        </div>
                    </Card>

                    {/* Threshold Info if available */}
                    {riskData.threshold_info && (
                        <div className="text-xs text-foreground-tertiary bg-background-secondary p-3 rounded-md border border-border">
                            <strong>Threshold:</strong> {riskData.threshold_info.label} ({riskData.threshold_info.range})
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
