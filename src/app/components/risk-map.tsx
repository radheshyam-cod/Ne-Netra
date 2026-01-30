import { useMemo, useEffect, useState } from 'react';
// @ts-ignore
import DeckGL from '@deck.gl/react';
// @ts-ignore
import { H3HexagonLayer } from '@deck.gl/geo-layers';
// @ts-ignore
import { ScatterplotLayer, IconLayer } from '@deck.gl/layers';
// @ts-ignore
import { FlyToInterpolator } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
// @ts-ignore
import { cellToBoundary } from 'h3-js';
import { DISTRICT_COORDINATES } from '../../lib/district-coords';
import { cn } from '@/lib/utils';
// import { useTheme } from 'next-themes';

// Coordinates for North-East India (Imphal approx center)
const INITIAL_VIEW_STATE = {
    longitude: 93.9368,
    latitude: 24.8170,
    zoom: 7, // Zoomed out to see more NE context
    pitch: 45,
    bearing: 0
};

// MapLibre style (OSM Stamen Toner or similar open style)
// Using a stable open vector tile style
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface RiskMapProps {
    data?: any[]; // Array of risk data
    hotspots?: any[];
    district?: string;
    velocity?: number;
    className?: string;
    layerMode?: 'heatmap' | 'markers' | 'hex';
}

// Mock Data Generator for H3 (if no real data supplied)
// In a real app, 'data' prop would contain { hex: string, score: number }
const DEFAULT_RISK_DATA = [
    { hex: '895ba24892bffff', score: 0.9 }, // High Risk
    { hex: '895ba248927ffff', score: 0.7 },
    { hex: '895ba248937ffff', score: 0.3 },
    { hex: '895ba248967ffff', score: 0.1 },
    // ... (In production, this comes from backend/RxDB)
];

export function RiskMap({ data = [], district, velocity = 0, className, layerMode = 'hex' }: RiskMapProps) {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

    // Fly to district when selected
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

    // Determine highlight color based on velocity
    // Threshold: > 5 is considered "High Velocity" (Red), otherwise Green
    const highlightColor: [number, number, number] = velocity > 5
        ? [239, 68, 68]  // Red-500
        : [34, 197, 94]; // Green-500

    // Use mock data if empty (for visualization proof)
    const mapData = useMemo(() => {
        if (data && data.length > 0) return data;
        // Generate some hexes around Imphal for demo
        // In a real app, this logic lives in the backend
        return DEFAULT_RISK_DATA;
    }, [data]);

    const layers = [
        // HEXAGON Layer (Default)
        layerMode === 'hex' && new H3HexagonLayer({
            id: 'h3-hexagon-layer',
            data: mapData,
            pickable: true,
            wireframe: false,
            filled: true,
            extruded: true,
            getHexagon: (d: any) => d.hex,
            getFillColor: (d: any) => {
                // Color scale: Emerald (Low) -> Amber (Medium) -> Red (High)
                const s = d.score;
                if (s > 0.8) return [239, 68, 68]; // Red-500 (Matches theme)
                if (s > 0.5) return [245, 158, 11]; // Amber-500 (Matches theme)
                return [16, 185, 129]; // Emerald-500 (Matches theme)
            },
            getElevation: (d: any) => d.score * 1000,
            elevationScale: 20,
            opacity: 0.6,
        }),

        // MARKERS Layer (Alternative)
        // Re-using hex centroids as markers for demo
        layerMode === 'markers' && new ScatterplotLayer({
            id: 'risk-markers',
            data: mapData.map((d: any) => {
                // H3 centroid fallback (very rough approx for demo without h3-js import working fully in all envs)
                // In real code: const [lat, lng] = h3ToGeo(d.hex)
                // Here we just use district center + random jitter for visual proof
                const base = district && DISTRICT_COORDINATES[district] ? DISTRICT_COORDINATES[district] : { lat: 24.8170, lng: 93.9368 };
                return {
                    position: [base.lng + (Math.random() - 0.5) * 0.1, base.lat + (Math.random() - 0.5) * 0.1],
                    score: d.score,
                    confidence: 'High'
                }
            }),
            getPosition: (d: any) => d.position,
            getFillColor: (d: any) => d.score > 0.8 ? [239, 68, 68] : [245, 158, 11],
            getRadius: 500,
            opacity: 0.8,
            stroked: true,
            lineWidthMinPixels: 2
        }),

        // HEATMAP Simulation (using Scatterplot with blur/opacity tricks or AggregationLayer if installed)
        // For now, simpler "Heatmap" style scatterplot
        layerMode === 'heatmap' && new ScatterplotLayer({
            id: 'heatmap-layer',
            data: mapData.map((d: any) => {
                const base = district && DISTRICT_COORDINATES[district] ? DISTRICT_COORDINATES[district] : { lat: 24.8170, lng: 93.9368 };
                return {
                    position: [base.lng + (Math.random() - 0.5) * 0.1, base.lat + (Math.random() - 0.5) * 0.1],
                    weight: d.score
                }
            }),
            getPosition: (d: any) => d.position,
            getFillColor: [239, 68, 68],
            getRadius: 2000,
            opacity: 0.3, // High transparency for 'heat' feel
            stroked: false,
        }),

        // Highlight layer for selected district
        district && DISTRICT_COORDINATES[district] ? new ScatterplotLayer({
            id: 'district-highlight',
            data: [DISTRICT_COORDINATES[district]],
            getPosition: (d: any) => [d.lng, d.lat],
            getRadius: 5000, // 5km radius coverage
            stroked: true,
            filled: true, // "highlight background" implies filled
            lineWidthMinPixels: 2,
            getLineColor: highlightColor,
            getFillColor: layerMode === 'hex' ? [...highlightColor, 50] : [0, 0, 0, 0], // Only fill background in Hex mode
            getLineWidth: 2,
            opacity: 1,
            animation: true
        }) : null
    ];

    return (
        <div className={cn("relative rounded border border-border overflow-hidden h-full w-full min-h-[300px]", className)}>
            <DeckGL
                viewState={viewState}
                onViewStateChange={({ viewState }: any) => setViewState(viewState)}
                controller={true}
                layers={layers}
                getTooltip={({ object }: any) => object && `Risk Score: ${object.score}`}
            >
                <Map
                    mapStyle={MAP_STYLE}
                    reuseMaps
                />
            </DeckGL>

            <div className="absolute top-2 right-2 bg-card/90 backdrop-blur p-2 rounded text-xs border border-border z-10 pointer-events-none">
                <div className="font-semibold mb-1">
                    {layerMode === 'hex' ? 'Risk Extrusion' : layerMode === 'markers' ? 'Incident Markers' : 'Heat Density'}
                </div>
                {layerMode === 'hex' && (
                    <>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 bg-red-500 rounded-sm"></div> High Velocity (Red)
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-sm"></div> Low Velocity (Green)
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
