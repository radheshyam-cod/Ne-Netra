import { OfficerReviewPanel } from '@/app/components/officer-review-panel';
import { AuditLogEntry } from '@/app/services/api';

interface ReviewPageProps {
    selectedDistrict: string;
    auditLog: AuditLogEntry[];
    onReviewSubmit: (data: any) => Promise<boolean>;
}

export function ReviewPage({ selectedDistrict, auditLog, onReviewSubmit }: ReviewPageProps) {
    // Transform logs for the panel locally if needed, or pass correct shape
    const formattedLogs = auditLog.map(log => ({
        timestamp: new Date(log.timestamp).toLocaleString('en-IN'),
        officer: log.officer_name,
        action: log.action
    }));

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Officer Review</h2>
                <p className="text-foreground-secondary mt-1">
                    Mandatory human review of algorithmic risk assessments.
                </p>
            </div>

            <OfficerReviewPanel
                district={selectedDistrict}
                riskScoreId={1} // Ideally this comes from riskData
                auditLog={formattedLogs}
                onSubmit={onReviewSubmit}
            />
        </div>
    );
}
