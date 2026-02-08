/**
 * Date Range Export Component
 * 
 * Custom date range picker for export functionality
 */

import { useState } from 'react';
import { exportDistrictToPDF } from '../utils/export';
import { toast } from './ui/toast';

interface DateRangeExportProps {
    district: string;
    onExport?: (startDate: Date, endDate: Date) => void;
}

export function DateRangeExport({ district, onExport }: DateRangeExportProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    // Preset date ranges
    const presets = [
        { label: 'Last 7 Days', days: 7 },
        { label: 'Last 30 Days', days: 30 },
        { label: 'Last 3 Months', days: 90 },
        { label: 'Last 6 Months', days: 180 },
        { label: 'This Year', days: new Date().getDayOfYear() }
    ];

    const handlePreset = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleExport = async () => {
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            toast.error('Start date must be before end date');
            return;
        }

        setIsExporting(true);

        try {
            if (onExport) {
                onExport(start, end);
            } else {
                // Default: Export to PDF
                // TODO: Fetch data for date range
                await exportDistrictToPDF({
                    district,
                    dateRange: { start, end }
                });
            }

            toast.success(`Exported ${district} (${startDate} to ${endDate})`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Export with Custom Date Range
            </h3>

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                    <button
                        key={preset.label}
                        onClick={() => handlePreset(preset.days)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Custom Date Inputs */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                    </label>
                    <input
                        id="start-date"
                        title="Start Date"
                        aria-label="Start Date"
                        placeholder="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        max={endDate || undefined}
                    />
                </div>

                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date
                    </label>
                    <input
                        id="end-date"
                        title="End Date"
                        aria-label="End Date"
                        placeholder="End Date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min={startDate || undefined}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            {/* Export Button */}
            <button
                onClick={handleExport}
                disabled={!startDate || !endDate || isExporting}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
            >
                {isExporting ? 'Exporting...' : 'Export Data'}
            </button>

            {/* Summary */}
            {startDate && endDate && (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days selected
                </p>
            )}
        </div>
    );
}

// Utility extension for Date
declare global {
    interface Date {
        getDayOfYear(): number;
    }
}

Date.prototype.getDayOfYear = function () {
    const start = new Date(this.getFullYear(), 0, 0);
    const diff = this.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};
