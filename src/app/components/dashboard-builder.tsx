/**
 * Dashboard Builder - Drag-Drop Widget Configuration
 * 
 * Allows users to customize their dashboard layout
 */

import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface Widget {
    id: string;
    type: 'risk-score' | 'map' | 'signals' | 'actions' | 'trends' | 'comparison';
    title: string;
    config?: Record<string, any>;
}

interface DashboardConfig {
    layout: GridLayout.Layout[];
    widgets: Widget[];
}

const DEFAULT_WIDGETS: Widget[] = [
    { id: 'risk-1', type: 'risk-score', title: 'Risk Score Card' },
    { id: 'map-1', type: 'map', title: 'District Map' },
    { id: 'signals-1', type: 'signals', title: 'Recent Signals' },
    { id: 'trends-1', type: 'trends', title: 'Risk Trends' }
];

const DEFAULT_LAYOUT: GridLayout.Layout[] = [
    { i: 'risk-1', x: 0, y: 0, w: 3, h: 2 },
    { i: 'map-1', x: 3, y: 0, w: 6, h: 4 },
    { i: 'signals-1', x: 0, y: 2, w: 3, h: 2 },
    { i: 'trends-1', x: 9, y: 0, w: 3, h: 4 }
];

export function DashboardBuilder({
    onSave
}: {
    onSave?: (config: DashboardConfig) => void;
}) {
    const [layout, setLayout] = useState<GridLayout.Layout[]>(DEFAULT_LAYOUT);
    const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);
    const [isEditing, setIsEditing] = useState(false);

    // Load saved config from local storage
    useEffect(() => {
        const saved = localStorage.getItem('dashboard-config');
        if (saved) {
            try {
                const config: DashboardConfig = JSON.parse(saved);
                setLayout(config.layout);
                setWidgets(config.widgets);
            } catch (error) {
                console.error('Failed to load dashboard config:', error);
            }
        }
    }, []);

    const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
        setLayout(newLayout);
    };

    const handleSave = () => {
        const config: DashboardConfig = { layout, widgets };
        localStorage.setItem('dashboard-config', JSON.stringify(config));

        if (onSave) {
            onSave(config);
        }

        setIsEditing(false);
    };

    const handleReset = () => {
        setLayout(DEFAULT_LAYOUT);
        setWidgets(DEFAULT_WIDGETS);
        localStorage.removeItem('dashboard-config');
    };

    const addWidget = (type: Widget['type']) => {
        const newId = `${type}-${Date.now()}`;
        const newWidget: Widget = {
            id: newId,
            type,
            title: type.charAt(0).toUpperCase() + type.slice(1)
        };

        setWidgets([...widgets, newWidget]);

        // Add to layout in first available spot
        const newLayoutItem: GridLayout.Layout = {
            i: newId,
            x: 0,
            y: Infinity, // Will place at bottom
            w: 3,
            h: 2
        };

        setLayout([...layout, newLayoutItem]);
    };

    const removeWidget = (id: string) => {
        setWidgets(widgets.filter(w => w.id !== id));
        setLayout(layout.filter(l => l.i !== id));
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Dashboard Layout</h2>
                    {isEditing && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                            Editing Mode
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Customize Layout
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Save Layout
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Widget Palette (shown in editing mode) */}
            {isEditing && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium mb-2">Add Widgets</h3>
                    <div className="flex flex-wrap gap-2">
                        {['risk-score', 'map', 'signals', 'actions', 'trends', 'comparison'].map(type => (
                            <button
                                key={type}
                                onClick={() => addWidget(type as Widget['type'])}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm"
                            >
                                + {type.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid Layout */}
            <GridLayout
                className="layout"
                layout={layout}
                cols={12}
                rowHeight={60}
                width={1200}
                isDraggable={isEditing}
                isResizable={isEditing}
                onLayoutChange={handleLayoutChange}
            >
                {widgets.map(widget => (
                    <div
                        key={widget.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        {/* Widget Header */}
                        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-medium text-sm">{widget.title}</h3>
                            {isEditing && (
                                <button
                                    onClick={() => removeWidget(widget.id)}
                                    className="text-red-600 hover:text-red-700 text-sm"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Widget Content */}
                        <div className="p-4">
                            <WidgetContent widget={widget} />
                        </div>
                    </div>
                ))}
            </GridLayout>
        </div>
    );
}

// Widget content renderer
function WidgetContent({ widget }: { widget: Widget }) {
    // Placeholder - would render actual components
    return (
        <div className="text-center text-gray-500 py-8">
            {widget.type} widget content
        </div>
    );
}
