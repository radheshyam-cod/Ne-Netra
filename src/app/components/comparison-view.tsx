import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RiskScoreData } from '../services/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

interface ComparisonViewProps {
    availableDistricts: string[];
    onLoadDistrict: (district: string) => Promise<RiskScoreData>;
}

/**
 * Multi-District Comparison View (up to 4 districts side-by-side)
 */
export function ComparisonView({ availableDistricts, onLoadDistrict }: ComparisonViewProps) {
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
    const [districtData, setDistrictData] = useState<Record<string, RiskScoreData>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const addDistrict = async (district: string) => {
        if (selectedDistricts.length >= 4) {
            return; // Max 4 districts
        }

        if (selectedDistricts.includes(district)) {
            return; // Already added
        }

        setSelectedDistricts([...selectedDistricts, district]);
        setLoading({ ...loading, [district]: true });

        try {
            const data = await onLoadDistrict(district);
            setDistrictData({ ...districtData, [district]: data });
        } catch (error) {
            console.error(`Failed to load district ${district}:`, error);
        } finally {
            setLoading({ ...loading, [district]: false });
        }
    };

    const removeDistrict = (district: string) => {
        setSelectedDistricts(selectedDistricts.filter(d => d !== district));
        const newData = { ...districtData };
        delete newData[district];
        setDistrictData(newData);
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-amber-500';
            case 'medium': return 'bg-blue-500';
            default: return 'bg-green-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* District Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Multi-District Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Select onValueChange={addDistrict} disabled={selectedDistricts.length >= 4}>
                            <SelectTrigger className="w-[300px]">
                                <SelectValue placeholder="Add district to compare..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableDistricts
                                    .filter(d => !selectedDistricts.includes(d))
                                    .map(district => (
                                        <SelectItem key={district} value={district}>
                                            {district}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-slate-500 self-center">
                            {selectedDistricts.length}/4 districts selected
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Comparison Grid */}
            {selectedDistricts.length > 0 && (
                <div className={`grid gap-4 ${selectedDistricts.length === 1 ? 'grid-cols-1' :
                    selectedDistricts.length === 2 ? 'grid-cols-2' :
                        'grid-cols-2 md:grid-cols-4'
                    }`}>
                    {selectedDistricts.map(district => {
                        const data = districtData[district];
                        const isLoading = loading[district];

                        return (
                            <Card key={district} className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => removeDistrict(district)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>

                                <CardHeader>
                                    <CardTitle className="text-base">{district}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    {isLoading ? (
                                        <div className="text-center py-8 text-slate-500">Loading...</div>
                                    ) : data ? (
                                        <div className="space-y-4">
                                            {/* Risk Score */}
                                            <div className="text-center">
                                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getRiskColor(data.risk_level)}`}>
                                                    <span className="text-2xl font-bold text-white">{data.score}</span>
                                                </div>
                                                <p className="mt-2 text-sm font-medium uppercase">{data.risk_level}</p>
                                                <p className="text-xs text-slate-500">{data.trend}</p>
                                            </div>

                                            {/* Layer Scores */}
                                            {data.layer_scores && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Cognitive</span>
                                                        <span className="font-medium">{data.layer_scores.cognitive.toFixed(1)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span>Network</span>
                                                        <span className="font-medium">{data.layer_scores.network.toFixed(1)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span>Physical</span>
                                                        <span className="font-medium">{data.layer_scores.physical.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Primary Trigger */}
                                            {data.primary_trigger && (
                                                <div className="pt-2 border-t text-xs text-slate-600">
                                                    <span className="font-medium">Trigger:</span> {data.primary_trigger}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500">No data</div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Comparison Table */}
            {selectedDistricts.length >= 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Comparison Table</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-4">Metric</th>
                                        {selectedDistricts.map(district => (
                                            <th key={district} className="text-center py-2 px-4">{district}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2 px-4 font-medium">Risk Score</td>
                                        {selectedDistricts.map(district => (
                                            <td key={district} className="text-center py-2 px-4">
                                                {districtData[district]?.score || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-4 font-medium">Risk Level</td>
                                        {selectedDistricts.map(district => (
                                            <td key={district} className="text-center py-2 px-4 capitalize">
                                                {districtData[district]?.risk_level || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-4 font-medium">Trend</td>
                                        {selectedDistricts.map(district => (
                                            <td key={district} className="text-center py-2 px-4">
                                                {districtData[district]?.trend || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-4 font-medium">Cognitive</td>
                                        {selectedDistricts.map(district => (
                                            <td key={district} className="text-center py-2 px-4">
                                                {districtData[district]?.layer_scores?.cognitive.toFixed(1) || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-4 font-medium">Network</td>
                                        {selectedDistricts.map(district => (
                                            <td key={district} className="text-center py-2 px-4">
                                                {districtData[district]?.layer_scores?.network.toFixed(1) || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-4 font-medium">Physical</td>
                                        {selectedDistricts.map(district => (
                                            <td key={district} className="text-center py-2 px-4">
                                                {districtData[district]?.layer_scores?.physical.toFixed(1) || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
