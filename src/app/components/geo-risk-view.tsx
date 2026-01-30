import { RiskMap } from '@/app/components/risk-map';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/card';
import { SeverityDot } from '@/app/components/severity-indicator';

interface Hotspot {
  id?: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  incidents: number;
}

interface GeoRiskViewProps {
  hotspots: Hotspot[];
  selectedDistrict?: string;
  velocity?: number;
}

export function GeoRiskView({ hotspots, selectedDistrict, velocity }: GeoRiskViewProps) {
  return (
    <div className="space-y-4">
      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle>District Risk Map (H3 Hexagon Layer)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <RiskMap district={selectedDistrict} velocity={velocity} />
        </CardContent>
      </Card>


      {/* Hotspot List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Hotspots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {hotspots.map((hotspot) => (
              <div
                key={hotspot.location}
                className="flex items-center justify-between p-3 bg-background-secondary hover:bg-background-tertiary rounded border border-border-subtle cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <SeverityDot level={hotspot.severity} size="md" />
                  <div>
                    <p className="text-foreground font-medium">{hotspot.location}</p>
                    <p className="text-xs text-foreground-tertiary">
                      {hotspot.incidents} incident{hotspot.incidents !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground-secondary uppercase tracking-wide">
                    {hotspot.severity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle">
            <p className="text-xs text-foreground-tertiary">
              Counts represent aggregated synthetic signals, not verified incidents or individual reports.
            </p>
          </div>
        </CardContent>
      </Card>
    </div >
  );
}
