import { useState } from 'react';
import { RiskMap } from '@/app/components/risk-map';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { SeverityDot } from '@/app/components/severity-indicator';
import { RiskScoreData } from '@/app/services/api';
import { Cuboid, MapPin, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapPageProps {
    riskData: RiskScoreData | null;
    selectedDistrict: string;
}

export function MapPage({ riskData, selectedDistrict }: MapPageProps) {
    const [layerMode, setLayerMode] = useState<'hex' | 'heatmap' | 'markers'>('hex');

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Geographic Risk Map</h2>
                    <p className="text-foreground-secondary mt-1">
                        Spatial distribution of risk signals using H3 hexagonal clustering.
                    </p>
                </div>
                {/* Layer Control */}
                <div className="flex p-1 bg-background-tertiary rounded-lg border border-border-subtle">
                    <button
                        onClick={() => setLayerMode('hex')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                            layerMode === 'hex' ? "bg-card shadow text-foreground" : "text-foreground-tertiary hover:text-foreground hover:bg-background-secondary"
                        )}
                    >
                        <Cuboid className="w-4 h-4" /> Hexagon
                    </button>
                    <button
                        onClick={() => setLayerMode('heatmap')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                            layerMode === 'heatmap' ? "bg-card shadow text-foreground" : "text-foreground-tertiary hover:text-foreground hover:bg-background-secondary"
                        )}
                    >
                        <Activity className="w-4 h-4" /> Heatmap
                    </button>
                    <button
                        onClick={() => setLayerMode('markers')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                            layerMode === 'markers' ? "bg-card shadow text-foreground" : "text-foreground-tertiary hover:text-foreground hover:bg-background-secondary"
                        )}
                    >
                        <MapPin className="w-4 h-4" /> Markers
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Map Container - Takes up more space */}
                <Card className="lg:col-span-2 flex flex-col overflow-hidden border-border">
                    <div className="flex-1 relative bg-background-tertiary">
                        <RiskMap
                            district={selectedDistrict}
                            velocity={riskData?.components?.velocity || 0}
                            layerMode={layerMode}
                        />
                    </div>
                </Card>

                {/* Hotspot Sidebar */}
                <Card className="flex flex-col overflow-hidden">
                    <CardHeader>
                        <CardTitle>Identified Hotspots</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-3">
                            {(riskData?.hotspots || []).map((hotspot, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 bg-background-tertiary rounded border border-border-subtle hover:border-border transition-colors cursor-default"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <SeverityDot level={hotspot.severity} />
                                        <span className="text-xs uppercase font-medium text-foreground-tertiary tracking-wider">{hotspot.severity}</span>
                                    </div>
                                    <p className="text-foreground font-medium">{hotspot.location}</p>
                                    <p className="text-sm text-foreground-secondary mt-1">
                                        {hotspot.incidents} Signals Detected
                                    </p>
                                </div>
                            ))}
                            {(!riskData?.hotspots || riskData.hotspots.length === 0) && (
                                <div className="text-center py-8 text-foreground-tertiary">
                                    No hotspots detected.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
