import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { AuditLogEntry } from '@/app/services/api';
import { Clock, Download, Shield } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { exportAuditLogCSV } from '@/app/utils/export';

interface AuditPageProps {
    auditLog: AuditLogEntry[];
    selectedDistrict?: string;
}

export function AuditPage({ auditLog, selectedDistrict = 'All Districts' }: AuditPageProps) {
    const handleExportCSV = () => {
        exportAuditLogCSV(selectedDistrict, auditLog);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Audit Log</h2>
                    <p className="text-foreground-secondary mt-1">
                        Immutable record of all system activities and officer actions.
                    </p>
                </div>
                <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={auditLog.length === 0}
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Activity Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative border-l border-border ml-3 space-y-8 py-2">
                        {auditLog.length === 0 && (
                            <div className="pl-6 text-foreground-tertiary">No activity recorded for this district.</div>
                        )}
                        {auditLog.map((log, idx) => (
                            <div key={idx} className="relative pl-6 group">
                                {/* Dot */}
                                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-background border-2 border-border group-hover:border-primary transition-colors" />

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                                    <span className="font-mono text-xs text-foreground-tertiary">
                                        {new Date(log.timestamp).toLocaleString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                                        })}
                                    </span>
                                    {log.officer_name && (
                                        <div className="flex items-center gap-1 text-xs font-medium text-foreground-secondary px-2 py-0.5 rounded bg-background-tertiary border border-border-subtle">
                                            <Shield className="w-3 h-3" />
                                            {log.officer_name}
                                        </div>
                                    )}
                                </div>

                                <p className="text-foreground font-medium mt-1">
                                    {log.action}
                                </p>
                                {log.officer_name && (
                                    <p className="text-foreground-secondary mt-0.5 font-mono text-xs opacity-70">
                                        Review ID: {log.id}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
