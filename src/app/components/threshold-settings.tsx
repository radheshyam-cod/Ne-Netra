import { Bell, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { showToast } from './ui/toast';

interface ThresholdSettingsProps {
    district: string;
}

/**
 * Custom Threshold Settings UI
 */
export function ThresholdSettings({ district }: ThresholdSettingsProps) {
    const [thresholds, setThresholds] = useState({
        threshold60: 60,
        threshold75: 75,
        threshold90: 90,
    });

    useEffect(() => {
        loadThresholds();
    }, [district]);

    const loadThresholds = () => {
        try {
            const stored = localStorage.getItem(`ne-netra-thresholds-${district}`);
            if (stored) {
                setThresholds(JSON.parse(stored));
            } else {
                // Reset to defaults
                setThresholds({
                    threshold60: 60,
                    threshold75: 75,
                    threshold90: 90,
                });
            }
        } catch (error) {
            console.error('Failed to load thresholds:', error);
        }
    };

    const saveThresholds = () => {
        // Validate
        if (thresholds.threshold60 >= thresholds.threshold75 ||
            thresholds.threshold75 >= thresholds.threshold90) {
            showToast.error('Thresholds must be in ascending order');
            return;
        }

        if (thresholds.threshold60 < 0 || thresholds.threshold90 > 100) {
            showToast.error('Thresholds must be between 0 and 100');
            return;
        }

        try {
            localStorage.setItem(
                `ne-netra-thresholds-${district}`,
                JSON.stringify(thresholds)
            );
            showToast.success('Custom thresholds saved');
        } catch (error) {
            console.error('Failed to save thresholds:', error);
            showToast.error('Failed to save thresholds');
        }
    };

    const resetToDefaults = () => {
        setThresholds({
            threshold60: 60,
            threshold75: 75,
            threshold90: 90,
        });
        localStorage.removeItem(`ne-netra-thresholds-${district}`);
        showToast.success('Reset to default thresholds');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Custom Alert Thresholds - {district}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="threshold60">Elevated Risk Threshold</Label>
                        <Input
                            id="threshold60"
                            type="number"
                            min="0"
                            max="100"
                            value={thresholds.threshold60}
                            onChange={(e) => setThresholds({ ...thresholds, threshold60: Number(e.target.value) })}
                            className="mt-1"
                        />
                        <p className="text-xs text-slate-500 mt-1">Default: 60</p>
                    </div>

                    <div>
                        <Label htmlFor="threshold75">High Risk Threshold</Label>
                        <Input
                            id="threshold75"
                            type="number"
                            min="0"
                            max="100"
                            value={thresholds.threshold75}
                            onChange={(e) => setThresholds({ ...thresholds, threshold75: Number(e.target.value) })}
                            className="mt-1"
                        />
                        <p className="text-xs text-slate-500 mt-1">Default: 75</p>
                    </div>

                    <div>
                        <Label htmlFor="threshold90">Critical Risk Threshold</Label>
                        <Input
                            id="threshold90"
                            type="number"
                            min="0"
                            max="100"
                            value={thresholds.threshold90}
                            onChange={(e) => setThresholds({ ...thresholds, threshold90: Number(e.target.value) })}
                            className="mt-1"
                        />
                        <p className="text-xs text-slate-500 mt-1">Default: 90</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button onClick={saveThresholds} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Save Thresholds
                    </Button>
                    <Button onClick={resetToDefaults} variant="outline">
                        Reset
                    </Button>
                </div>

                <p className="text-xs text-slate-500">
                    Custom thresholds will trigger browser notifications when risk scores cross these values.
                </p>
            </CardContent>
        </Card>
    );
}
