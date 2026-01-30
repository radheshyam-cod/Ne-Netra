import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { apiService as api, MessageIngest } from '../services/api';
import { AlertCircle, CheckCircle, Send, Loader2 } from 'lucide-react';

interface IngestPanelProps {
    districts: string[];
    onIngestComplete: () => void;
}

export function IngestPanel({ districts, onIngestComplete }: IngestPanelProps) {
    const [district, setDistrict] = useState(districts[0] || '');
    const [text, setText] = useState('');
    const [sourceType, setSourceType] = useState('public_forum');
    const [geoSensitivity, setGeoSensitivity] = useState('normal');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const payload: MessageIngest = {
                district,
                text,
                source_type: sourceType,
                geo_sensitivity: geoSensitivity,
            };

            await api.ingestMessage(payload);

            // Trigger analysis immediately to update risk scores
            await api.analyzeDistrict(district);

            setStatus({ type: 'success', message: 'Message ingested and analyzed successfully.' });
            setText(''); // Clear text
            onIngestComplete(); // Notify parent to refresh data
        } catch (err: any) {
            console.error(err);
            setStatus({ type: 'error', message: 'Failed to ingest message.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full bg-card border-border mb-6">
            <CardHeader className="pb-2 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
                    <Send className="w-5 h-5 text-severity-low" />
                    Ingest New Intelligence
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider">Target District</label>
                            <select
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className="w-full bg-background-tertiary border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                {districts.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider">Source Type</label>
                            <select
                                value={sourceType}
                                onChange={(e) => setSourceType(e.target.value)}
                                className="w-full bg-background-tertiary border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="public_forum">Public Forum</option>
                                <option value="news_report">News Report</option>
                                <option value="social_media">Social Media (Public)</option>
                                <option value="tip_line">Anonymous Tip</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider">Geo Sensitivity</label>
                            <select
                                value={geoSensitivity}
                                onChange={(e) => setGeoSensitivity(e.target.value)}
                                className="w-full bg-background-tertiary border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="normal">Normal Area</option>
                                <option value="market">Market / Commercial</option>
                                <option value="highway">Highway / Transit</option>
                                <option value="sensitive_zone">Sensitive Zone</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider">Message Content</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste text content here for analysis..."
                            className="w-full h-24 bg-background-tertiary border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            {status && (
                                <div className={`flex items-center gap-2 text-sm ${status.type === 'success' ? 'text-severity-low' : 'text-severity-high'}`}>
                                    {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {status.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Compliance Fields (Read-Only) */}
                    <div className="grid grid-cols-2 gap-4 bg-background-tertiary p-3 rounded-md border border-border">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider">Ingest Timestamp (IST)</label>
                            <div className="font-mono text-sm text-foreground">{new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider">Data Classification</label>
                            <div className="font-mono text-sm text-foreground flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-severity-low"></span>
                                Synthetic / Public
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-foreground-tertiary">
                            All ingested data in this pilot is synthetic or publicly available.
                        </p>
                        <Button
                            type="submit"
                            variant="default"
                            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                            disabled={loading || !district || !text}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Ingesting...
                                </>
                            ) : (
                                'Ingest Intelligence'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
