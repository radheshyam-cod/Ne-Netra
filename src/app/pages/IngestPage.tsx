import { IngestPanel } from '@/app/components/ingest-panel';

interface IngestPageProps {
    districts: string[];
    onIngestComplete: () => void;
}

export function IngestPage({ districts, onIngestComplete }: IngestPageProps) {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Ingest Intelligence</h2>
                <p className="text-foreground-secondary mt-1">
                    Securely submit raw intelligence for AI processing and risk analysis.
                    All inputs are logged and classified.
                </p>
            </div>

            <IngestPanel
                districts={districts}
                onIngestComplete={onIngestComplete}
            />

            <div className="rounded-md bg-background-secondary border border-border p-4 mt-8">
                <h4 className="text-sm font-medium text-foreground mb-2">Ingestion Guidelines</h4>
                <ul className="list-disc list-inside text-sm text-foreground-secondary space-y-1">
                    <li>Ensure district selection matches the content source.</li>
                    <li>Mark "Sensitive Zone" for intelligence related to border areas or critical infrastructure.</li>
                    <li>Verify source reliability before submission.</li>
                </ul>
            </div>
        </div>
    );
}
