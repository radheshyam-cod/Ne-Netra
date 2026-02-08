import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from './ui/sheet';

export interface FilterOptions {
    riskLevels: ('low' | 'medium' | 'high' | 'critical')[];
    layers: ('cognitive' | 'network' | 'physical')[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    severityRange: [number, number]; // 1-5
    states: string[];
}

interface AdvancedFilterPanelProps {
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    availableStates: string[];
}

/**
 * Advanced Filter Panel
 */
export function AdvancedFilterPanel({
    filters,
    onFiltersChange,
    availableStates,
}: AdvancedFilterPanelProps) {
    const [open, setOpen] = useState(false);

    const toggleRiskLevel = (level: FilterOptions['riskLevels'][number]) => {
        const newLevels = filters.riskLevels.includes(level)
            ? filters.riskLevels.filter(l => l !== level)
            : [...filters.riskLevels, level];

        onFiltersChange({ ...filters, riskLevels: newLevels });
    };

    const toggleLayer = (layer: FilterOptions['layers'][number]) => {
        const newLayers = filters.layers.includes(layer)
            ? filters.layers.filter(l => l !== layer)
            : [...filters.layers, layer];

        onFiltersChange({ ...filters, layers: newLayers });
    };

    const toggleState = (state: string) => {
        const newStates = filters.states.includes(state)
            ? filters.states.filter(s => s !== state)
            : [...filters.states, state];

        onFiltersChange({ ...filters, states: newStates });
    };

    const resetFilters = () => {
        onFiltersChange({
            riskLevels: [],
            layers: [],
            severityRange: [1, 5],
            states: [],
        });
    };

    const activeFilterCount =
        filters.riskLevels.length +
        filters.layers.length +
        filters.states.length +
        (filters.dateRange ? 1 : 0);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                        Filter districts and incidents by multiple criteria
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Risk Levels */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Risk Level</Label>
                            {filters.riskLevels.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onFiltersChange({ ...filters, riskLevels: [] })}
                                >
                                    <X className="w-3 h-3 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {(['low', 'medium', 'high', 'critical'] as const).map(level => (
                                <div key={level} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`risk-${level}`}
                                        checked={filters.riskLevels.includes(level)}
                                        onCheckedChange={() => toggleRiskLevel(level)}
                                    />
                                    <label
                                        htmlFor={`risk-${level}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                                    >
                                        {level}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Layers */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Risk Layers</Label>
                            {filters.layers.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onFiltersChange({ ...filters, layers: [] })}
                                >
                                    <X className="w-3 h-3 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {(['cognitive', 'network', 'physical'] as const).map(layer => (
                                <div key={layer} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`layer-${layer}`}
                                        checked={filters.layers.includes(layer)}
                                        onCheckedChange={() => toggleLayer(layer)}
                                    />
                                    <label
                                        htmlFor={`layer-${layer}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                                    >
                                        {layer}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* States */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">States</Label>
                            {filters.states.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onFiltersChange({ ...filters, states: [] })}
                                >
                                    <X className="w-3 h-3 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {availableStates.map(state => (
                                <div key={state} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`state-${state}`}
                                        checked={filters.states.includes(state)}
                                        onCheckedChange={() => toggleState(state)}
                                    />
                                    <label
                                        htmlFor={`state-${state}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {state}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button onClick={resetFilters} variant="outline" className="flex-1">
                            Reset All
                        </Button>
                        <Button onClick={() => setOpen(false)} className="flex-1">
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
