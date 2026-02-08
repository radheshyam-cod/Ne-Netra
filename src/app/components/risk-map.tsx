import { useEffect, useState } from 'react';
// @ts-ignore
import DeckGL from '@deck.gl/react';
// @ts-ignore
import { H3HexagonLayer } from '@deck.gl/geo-layers';
// @ts-ignore
import { ScatterplotLayer, IconLayer, PathLayer } from '@deck.gl/layers';
// @ts-ignore
import { FlyToInterpolator } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
// @ts-ignore
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { cellToLatLng } from 'h3-js';
import { Loader2, X, AlertTriangle, Clock } from 'lucide-react';
import { DISTRICT_COORDINATES } from '../../lib/district-coords';
import { cn } from '@/lib/utils';

// Coordinates for North-East India (Imphal approx center)
const INITIAL_VIEW_STATE = {
    longitude: 93.9368,
    latitude: 24.8170,
    zoom: 7,
    pitch: 45,
    bearing: 0
};

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface RiskMapProps {
    data?: any[];
    district?: string;
    velocity?: number;
    className?: string;
    layerMode?: 'heatmap' | 'markers' | 'hex';
}

const DEFAULT_RISK_DATA = [
    { hex: '895ba24892bffff', score: 0.9 },
    { hex: '895ba248927ffff', score: 0.7 },
    { hex: '895ba248937ffff', score: 0.3 },
    { hex: '895ba248967ffff', score: 0.1 },
];

const INFRASTRUCTURE_DATA = [
    {
        name: "National Highway 2",
        path: [[93.8, 24.8], [94.0, 24.9], [94.2, 25.1]],
        color: [255, 255, 255, 100],
        type: "highway"
    },
    {
        name: "Regional Bridge Hub",
        path: [[93.9, 24.85], [93.95, 24.85]],
        color: [255, 200, 0, 150],
        type: "bridge"
    }
];

export function RiskMap({ data = [], district, velocity = 0, className, layerMode = 'hex' }: RiskMapProps) {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    const [mapData, setMapData] = useState<any[]>(data && data.length > 0 ? data : DEFAULT_RISK_DATA);
    const [selectedHex, setSelectedHex] = useState<string | null>(null);
    const [hexSignals, setHexSignals] = useState<any[]>([]);
    const [loadingSignals, setLoadingSignals] = useState(false);

    useEffect(() => {
        if (data && data.length > 0) {
            setMapData(data);
            return;
        }

        async function fetchMapData() {
            if (!district) return;
            try {
                const response = await fetch(`http://localhost:8000/api/risk-map/${district}`);
                if (!response.ok) throw new Error('Failed to fetch map data');
                const result = await response.json();
                setMapData(result);
            } catch (err) {
                console.error("Failed to fetch dynamic map data", err);
                setMapData(DEFAULT_RISK_DATA);
            }
        }

        fetchMapData();
    }, [district, data]);

    useEffect(() => {
        if (district && DISTRICT_COORDINATES[district]) {
            const { lat, lng } = DISTRICT_COORDINATES[district];
            setViewState(prev => ({
                ...prev,
                longitude: lng,
                latitude: lat,
                zoom: 10,
                transitionDuration: 2000,
                transitionInterpolator: new FlyToInterpolator()
            }));
        }
    }, [district]);

    const highlightColor: [number, number, number] = velocity > 5
        ? [239, 68, 68]
        : [34, 197, 94];


    const handleHexClick = (info: any) => {
        if (info.object && info.object.hex) {
            const hex = info.object.hex;
            setSelectedHex(hex);
            setLoadingSignals(true);

            const fetchSignals = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/api/signals/h3/${hex}?district=${district || ''}`);
                    const result = await response.json();
                    setHexSignals(result.signals || []);
                } catch (err) {
                    console.error("Failed to fetch hex signals", err);
                } finally {
                    setLoadingSignals(false);
                }
            };

            fetchSignals();
        }
    };

    const layers = [
        new PathLayer({
            id: 'infrastructure-layer',
            data: INFRASTRUCTURE_DATA,
            getPath: (d: any) => d.path,
            getColor: (d: any) => d.color,
            getWidth: 20,
            widthMinPixels: 2,
            pickable: true,
        }),

        layerMode === 'hex' && new H3HexagonLayer({
            id: 'h3-hexagon-layer',
            data: mapData,
            pickable: true,
            wireframe: false,
            filled: true,
            extruded: true,
            getHexagon: (d: any) => d.hex,
            getFillColor: (d: any) => {
                if (d.hex === selectedHex) return [59, 130, 246]; // Blue-500 for selected
                const s = d.score;
                if (s > 0.8) return [239, 68, 68];
                if (s > 0.5) return [245, 158, 11];
                return [16, 185, 129];
            },
            getElevation: (d: any) => d.score * 1000,
            elevationScale: 20,
            opacity: 0.6,
            onClick: handleHexClick,
        }),

        layerMode === 'heatmap' && new HeatmapLayer({
            id: 'risk-heatmap',
            data: mapData.map((d: any) => {
                const coords = cellToLatLng(d.hex);
                return {
                    position: [coords[1], coords[0]],
                    weight: d.score
                };
            }),
            getPosition: (d: any) => d.position,
            getWeight: (d: any) => d.weight,
            radiusPixels: 60,
            intensity: 1,
            threshold: 0.05,
        }),

        layerMode === 'markers' && new ScatterplotLayer({
            id: 'risk-markers',
            data: mapData.map((d: any) => {
                const coords = cellToLatLng(d.hex);
                return {
                    position: [coords[1], coords[0]],
                    score: d.score,
                    hex: d.hex
                };
            }),
            getPosition: (d: any) => d.position,
            getFillColor: (d: any) => d.score > 0.8 ? [239, 68, 68] : [245, 158, 11],
            getRadius: 300,
            radiusMinPixels: 5,
            pickable: true,
            onClick: handleHexClick,
            opacity: 0.8,
        }),

        district && DISTRICT_COORDINATES[district] ? new ScatterplotLayer({
            id: 'district-highlight',
            data: [DISTRICT_COORDINATES[district]],
            getPosition: (d: any) => [d.lng, d.lat],
            getRadius: 5000,
            stroked: true,
            filled: true,
            lineWidthMinPixels: 2,
            getLineColor: highlightColor,
            getFillColor: [...highlightColor, 50],
            opacity: 1,
        }) : null
    ].filter(Boolean);

    return (
        <div className={cn("relative rounded border border-border overflow-hidden h-full w-full min-h-[300px]", className)}>
            <DeckGL
                viewState={viewState}
                onViewStateChange={({ viewState }: any) => setViewState(viewState)}
                controller={true}
                layers={layers}
                getTooltip={({ object }: any) => object && (object.hex ? `Hex: ${object.hex}\nRisk: ${object.score}` : object.name)}
            >
                <Map mapStyle={MAP_STYLE} reuseMaps />
            </DeckGL>

            {/* Signal Drill-down Panel */}
            {selectedHex && (
                <div className="absolute right-0 top-0 bottom-0 w-72 bg-card/95 backdrop-blur-md border-l border-border z-20 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
                        <div className="flex flex-col">
                            <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Signal Intelligence</h3>
                            <span className="text-[10px] text-foreground-tertiary font-mono">{selectedHex}</span>
                        </div>
                        <button title="Close signal details" aria-label="Close signal details" type="button" onClick={() => setSelectedHex(null)} className="p-1 hover:bg-background rounded-full transition-colors">
                            <span className="sr-only">Close signal details</span>
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loadingSignals ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="text-xs text-foreground-secondary">Analyzing local signals...</span>
                            </div>
                        ) : hexSignals.length > 0 ? (
                            hexSignals.map((signal, idx) => (
                                <div key={idx} className="p-3 bg-background border border-border rounded-lg space-y-2 hover:border-primary/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <AlertTriangle className={cn("w-3 h-3", signal.severity > 3 ? "text-red-500" : "text-amber-500")} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
                                                Severity: {signal.severity}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] text-foreground-tertiary font-medium">
                                            <Clock className="w-2.5 h-2.5" />
                                            {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <p className="text-xs text-foreground leading-snug">
                                        {signal.text}
                                    </p>
                                    <div className="text-[9px] text-primary/70 font-semibold uppercase tracking-widest">
                                        Source: {signal.source}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-xs text-foreground-tertiary italic">No specific signals detected in this cell.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="absolute top-2 left-2 bg-card/90 backdrop-blur p-2 rounded text-[10px] border border-border z-10 space-y-1">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                    <span className="text-foreground-secondary underline decoration-dotted">Infrastructure Activity</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary opacity-80 animate-pulse"></div>
                    <span className="text-foreground-secondary">Cognitive Pulse</span>
                </div>
            </div>

            <div className="absolute top-2 right-2 bg-card/90 backdrop-blur p-2 rounded text-xs border border-border z-10 pointer-events-none">
                <div className="font-semibold mb-1">Risk Extrusion</div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-red-500 rounded-sm"></div> High Conflict Probability
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div> Baseline Calm
                </div>
            </div>
        </div>
    );
}
