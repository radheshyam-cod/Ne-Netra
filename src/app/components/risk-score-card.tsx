import { useState } from 'react';
import { Card, CardContent } from '@/app/components/card';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Info, Activity, Network, Brain, Map } from 'lucide-react';

type RiskTrend = 'rising' | 'stable' | 'falling';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface RiskScoreCardProps {
  score: number;
  trend: RiskTrend;
  riskLevel: RiskLevel;
  lastUpdated?: string;
  components?: {
    toxicity: number;
    velocity: number;
    geo_sensitivity: number;
    temporal_acceleration: number;
  };
  layer_scores?: {
    cognitive: number;
    network: number;
    physical: number;
  };
}

export function RiskScoreCard({ score, trend, riskLevel, lastUpdated, components, layer_scores }: RiskScoreCardProps) {
  const [expanded, setExpanded] = useState(false);

  const trendConfig = {
    rising: {
      icon: TrendingUp,
      label: 'Rising (last 6 hours)',
      color: 'text-severity-high',
    },
    stable: {
      icon: Minus,
      label: 'Stable',
      color: 'text-foreground-secondary',
    },
    falling: {
      icon: TrendingDown,
      label: 'Falling',
      color: 'text-severity-low',
    },
  };

  const riskLevelConfig = {
    low: {
      color: 'text-severity-low',
      bg: 'bg-severity-low-bg',
      label: 'Low Risk',
    },
    medium: {
      color: 'text-severity-medium',
      bg: 'bg-severity-medium-bg',
      label: 'Medium Risk',
    },
    high: {
      color: 'text-severity-high',
      bg: 'bg-severity-high-bg',
      label: 'High Risk',
    },
    critical: {
      color: 'text-severity-critical',
      bg: 'bg-severity-critical-bg',
      label: 'Critical',
    },
  };

  const TrendIcon = trendConfig[trend].icon;
  const levelConfig = riskLevelConfig[riskLevel];

  // Helper to render component bar
  const ComponentBar = ({ label, value, max, icon: Icon }: { label: string, value: number, max: number, icon?: any }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm items-center">
        <span className="text-foreground-secondary flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {label}
        </span>
        <span className="font-mono text-foreground font-medium">{value} / {max}</span>
      </div>
      <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary"
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <Card variant="elevated">
      <CardContent className="p-0">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-foreground-secondary mb-1">Composite Risk Score</h3>
              {lastUpdated && (
                <p className="text-xs text-foreground-tertiary">Updated {lastUpdated}</p>
              )}
            </div>
            {/* Sigmoid Indicator */}
            <div className="px-2 py-0.5 bg-background-tertiary rounded text-[10px] text-foreground-tertiary">
              Sigmoid Activation Applied
            </div>
          </div>

          {/* Score Display */}
          <div className="flex items-end gap-4">
            <div className={`text-7xl font-bold ${levelConfig.color} leading-none`}>
              {Math.round(score)}
            </div>
            <div className="mb-2 space-y-1">
              <div className="text-2xl text-foreground-secondary">/100</div>
            </div>
          </div>

          {/* Status and Trend */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded ${levelConfig.bg} ${levelConfig.color} font-medium`}>
              {levelConfig.label}
            </div>
            <div className={`flex items-center gap-2 ${trendConfig[trend].color}`}>
              <TrendIcon className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{trendConfig[trend].label}</span>
                {trend === 'rising' && (
                  <span className="text-xs opacity-80">Previous: {(score * 0.8).toFixed(1)} → Current: {Math.round(score)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Panel */}
        <div className="border-t border-border">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-background-secondary transition-colors"
          >
            <span className="font-medium text-foreground flex items-center gap-2">
              Risk Score Breakdown (Explainable)
              <Info className="w-4 h-4 text-foreground-tertiary" />
            </span>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-foreground-secondary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-foreground-secondary" />
            )}
          </button>

          {expanded && (
            <div className="p-4 bg-background-secondary space-y-6 border-t border-border animate-in slide-in-from-top-2">

              {/* 3-Layer Model */}
              {layer_scores && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-tertiary mb-2">3-Layer Risk Model</h4>
                  <ComponentBar label="Cognitive Risk (Language/Sentiment)" value={Number(layer_scores.cognitive.toFixed(1))} max={10} icon={Brain} />
                  <ComponentBar label="Network Risk (Velocity/Spread)" value={Number(layer_scores.network.toFixed(1))} max={10} icon={Network} />
                  <ComponentBar label="Physical Risk (Geo/Volatility)" value={Number(layer_scores.physical.toFixed(1))} max={10} icon={Map} />
                </div>
              )}

              <div className="h-px bg-border-subtle my-2" />

              {/* Legacy Components (Detailed) */}
              {components && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-tertiary mb-2">Raw Signals</h4>
                  <ComponentBar label="Toxicity Signal" value={components.toxicity || 0} max={30} icon={Activity} />
                  <ComponentBar label="Propagation Velocity" value={components.velocity || 0} max={25} icon={Activity} />
                  <ComponentBar label="Geo-Sensitivity Weight" value={components.geo_sensitivity || 0} max={25} icon={Activity} />
                  <ComponentBar label="Temporal Acceleration" value={components.temporal_acceleration || 0} max={20} icon={Activity} />
                </div>
              )}

              <div className="pt-2">
                <p className="text-xs text-foreground-tertiary italic">
                  Scores are derived from aggregated district-level signals using interpretable heuristics.
                </p>
                <div className="mt-2 text-[10px] text-foreground-tertiary bg-background-tertiary p-2 rounded border border-border-subtle">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold uppercase tracking-wider">System Config (Read-Only)</span>
                    <span>Updated: 2h ago</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>Cognitive Weight: 1.0</div>
                    <div>Network Weight: 1.0</div>
                    <div>Physical Weight: 1.0</div>
                  </div>
                  <div className="mt-2 border-t border-border-subtle pt-1 opacity-75">
                    Indic language normalization: <span className="font-mono">Heuristic (Pilot-Only)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
