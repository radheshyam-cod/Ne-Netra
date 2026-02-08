import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { format, subDays, subMonths } from 'date-fns';

export type TimeRange = '24h' | '72h' | '7d' | '30d' | '6m' | 'custom';

interface TimelineSliderProps {
    range: TimeRange;
    onRangeChange: (range: TimeRange, startDate?: Date, endDate?: Date) => void;
    showPlayback?: boolean;
}

/**
 * Timeline Slider Component
 */
export function TimelineSlider({ range, onRangeChange }: TimelineSliderProps) {
    const [customStart, setCustomStart] = useState<Date>(subDays(new Date(), 7));
    const [customEnd, setCustomEnd] = useState<Date>(new Date());

    const presets: { label: string; value: TimeRange }[] = [
        { label: '24 Hours', value: '24h' },
        { label: '72 Hours', value: '72h' },
        { label: '7 Days', value: '7d' },
        { label: '30 Days', value: '30d' },
        { label: '6 Months', value: '6m' },
        { label: 'Custom', value: 'custom' },
    ];

    const getDateRange = (preset: TimeRange): { start: Date; end: Date } => {
        const end = new Date();
        let start: Date;

        switch (preset) {
            case '24h':
                start = subDays(end, 1);
                break;
            case '72h':
                start = subDays(end, 3);
                break;
            case '7d':
                start = subDays(end, 7);
                break;
            case '30d':
                start = subDays(end, 30);
                break;
            case '6m':
                start = subMonths(end, 6);
                break;
            default:
                start = customStart;
        }

        return { start, end: preset === 'custom' ? customEnd : end };
    };

    const handlePresetClick = (preset: TimeRange) => {
        const { start, end } = getDateRange(preset);
        onRangeChange(preset, start, end);
    };

    const navigateBackward = () => {
        const { start, end } = getDateRange(range);
        const duration = end.getTime() - start.getTime();
        const newEnd = new Date(start.getTime());
        const newStart = new Date(start.getTime() - duration);
        onRangeChange(range, newStart, newEnd);
    };

    const navigateForward = () => {
        const { start, end } = getDateRange(range);
        const duration = end.getTime() - start.getTime();
        const newStart = new Date(end.getTime());
        const newEnd = new Date(end.getTime() + duration);
        onRangeChange(range, newStart, newEnd);
    };

    return (
        <div className="space-y-4">
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                    <Button
                        key={preset.value}
                        variant={range === preset.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePresetClick(preset.value)}
                    >
                        {preset.label}
                    </Button>
                ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={navigateBackward}
                    title="Previous period"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="text-sm text-slate-600">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {format(getDateRange(range).start, 'MMM d, yyyy')} - {format(getDateRange(range).end, 'MMM d, yyyy')}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={navigateForward}
                    title="Next period"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Custom Date Range (shown when custom is selected) */}
            {range === 'custom' && (
                <div className="flex gap-2 items-center">
                    <input
                        type="date"
                        value={format(customStart, 'yyyy-MM-dd')}
                        onChange={(e) => {
                            const newStart = new Date(e.target.value);
                            setCustomStart(newStart);
                            onRangeChange('custom', newStart, customEnd);
                        }}
                        className="px-3 py-2 border rounded-md text-sm"
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={format(customEnd, 'yyyy-MM-dd')}
                        onChange={(e) => {
                            const newEnd = new Date(e.target.value);
                            setCustomEnd(newEnd);
                            onRangeChange('custom', customStart, newEnd);
                        }}
                        className="px-3 py-2 border rounded-md text-sm"
                    />
                </div>
            )}
        </div>
    );
}
