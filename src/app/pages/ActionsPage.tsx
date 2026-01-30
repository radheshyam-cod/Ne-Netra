import { SuggestedActionsPanel } from '@/app/components/suggested-actions-panel';
import { RiskScoreData } from '@/app/services/api';

interface ActionsPageProps {
    riskData: RiskScoreData | null;
}

export function ActionsPage({ riskData }: ActionsPageProps) {
    if (!riskData) {
        return <div className="text-foreground-secondary">Select a district to view advisory actions.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Suggested Actions</h2>
                <p className="text-foreground-secondary mt-1">
                    AI-generated advisory protocols based on current risk levels.
                    <span className="text-accent ml-2 text-sm font-medium">pending human authorization</span>
                </p>
            </div>

            <SuggestedActionsPanel actions={riskData.suggested_actions || []} />
        </div>
    );
}
