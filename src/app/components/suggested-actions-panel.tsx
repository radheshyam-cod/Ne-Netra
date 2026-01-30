import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/card';
import { Badge } from '@/app/components/status-badge';
import { Lightbulb } from 'lucide-react';

interface Action {
  id: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  rationale: string;
}

interface SuggestedActionsPanelProps {
  actions: Action[];
}

export function SuggestedActionsPanel({ actions }: SuggestedActionsPanelProps) {
  const priorityConfig = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Suggested Actions</CardTitle>
          <Badge variant="outline">Decision Support</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div
              key={action.id || index}
              className="p-4 bg-background-secondary rounded border border-border-subtle space-y-2"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Lightbulb className="w-4 h-4 text-primary flex-shrink-0" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-foreground font-medium">
                      {/* Governance: Prefix with advisory language */}
                      {action.action.startsWith('Consider') || action.action.startsWith('Advisory')
                        ? action.action
                        : `Consider ${action.action.charAt(0).toLowerCase() + action.action.slice(1)}`}
                    </p>
                    <Badge variant="neutral" className="flex-shrink-0">
                      {priorityConfig[action.priority]}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground-secondary">{action.rationale}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-background-tertiary border border-border rounded flex items-center gap-2">
          <Badge variant="outline" className="shrink-0 border-primary text-primary">Advisory Only</Badge>
          <p className="text-xs text-foreground-tertiary">
            These are AI-generated advisories. Final decisions require human authorization.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
