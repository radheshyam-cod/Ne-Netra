import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/card';
import { SeverityDot } from '@/app/components/severity-indicator';
import { AlertTriangle } from 'lucide-react';

interface Factor {
  label: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  value?: string;
}

interface RiskExplanationPanelProps {
  primaryTrigger: string;
  contributingFactors: Factor[];
}

export function RiskExplanationPanel({ primaryTrigger, contributingFactors }: RiskExplanationPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Trigger */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-severity-high" />
            <h4 className="text-foreground">Primary Trigger</h4>
          </div>
          <div className="pl-6 p-4 bg-severity-high-bg border-l-4 border-severity-high rounded">
            <p className="text-severity-high-foreground">{primaryTrigger}</p>
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="space-y-3">
          <h4 className="text-foreground">Contributing Factors</h4>
          <div className="space-y-3">
            {contributingFactors.map((factor, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-background-secondary rounded border border-border-subtle">
                <SeverityDot level={factor.severity} className="mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground-secondary">{factor.label}</p>
                  {factor.value && (
                    <p className="text-xs text-foreground-tertiary mt-1">{factor.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
