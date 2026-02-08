import { Database, Globe, Radio, FileText, Shield } from 'lucide-react';
import { SimpleTooltip } from './ui/tooltip';

export type SourceType = 'public_open_source' | 'government' | 'media' | 'social' | 'sensor' | 'manual';

interface SourceAttributionBadgeProps {
    sourceType: SourceType;
    sourceUrl?: string;
    compact?: boolean;
}

/**
 * Source Attribution Badge
 * Shows the data source with icon and optional link
 */
export function SourceAttributionBadge({
    sourceType,
    sourceUrl,
    compact = false
}: SourceAttributionBadgeProps) {
    const sourceConfig: Record<SourceType, { icon: any; label: string; color: string; description: string }> = {
        public_open_source: {
            icon: Globe,
            label: 'Public Source',
            color: 'text-blue-600 dark:text-blue-400',
            description: 'Data from publicly available open sources',
        },
        government: {
            icon: Shield,
            label: 'Government',
            color: 'text-indigo-600 dark:text-indigo-400',
            description: 'Official government data source',
        },
        media: {
            icon: Radio,
            label: 'Media',
            color: 'text-purple-600 dark:text-purple-400',
            description: 'News and media reports',
        },
        social: {
            icon: FileText,
            label: 'Social Media',
            color: 'text-pink-600 dark:text-pink-400',
            description: 'Aggregated social media signals',
        },
        sensor: {
            icon: Database,
            label: 'Sensor',
            color: 'text-emerald-600 dark:text-emerald-400',
            description: 'Automated sensor or monitoring system',
        },
        manual: {
            icon: FileText,
            label: 'Manual Entry',
            color: 'text-slate-600 dark:text-slate-400',
            description: 'Manually entered data',
        },
    };

    const config = sourceConfig[sourceType];
    const Icon = config.icon;

    const badge = (
        <div className={`inline-flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ${config.color}`}>
            <Icon className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
            {!compact && <span className="font-medium">{config.label}</span>}
        </div>
    );

    const content = sourceUrl ? (
        <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
        >
            {badge}
        </a>
    ) : (
        badge
    );

    return (
        <SimpleTooltip content={config.description}>
            {content}
        </SimpleTooltip>
    );
}

interface ConfidenceBadgeProps {
    level: 'low' | 'medium' | 'high';
    score?: number;
}

/**
 * Confidence Indicator Badge
 * Shows classification confidence level
 */
export function ConfidenceBadge({ level, score }: ConfidenceBadgeProps) {
    const confidenceConfig = {
        low: {
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            border: 'border-amber-200 dark:border-amber-800',
            label: 'Low Confidence',
            description: 'Classification may require manual review',
        },
        medium: {
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            border: 'border-blue-200 dark:border-blue-800',
            label: 'Medium Confidence',
            description: 'Moderate confidence in classification',
        },
        high: {
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-950/30',
            border: 'border-green-200 dark:border-green-800',
            label: 'High Confidence',
            description: 'High confidence in automated classification',
        },
    };

    const config = confidenceConfig[level];

    return (
        <SimpleTooltip content={`${config.description}${score ? ` (${Math.round(score * 100)}%)` : ''}`}>
            <div
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}
            >
                <div className="flex gap-0.5">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-1 h-3 rounded-full ${i <= (level === 'low' ? 1 : level === 'medium' ? 2 : 3)
                                    ? 'bg-current'
                                    : 'bg-current opacity-20'
                                }`}
                        />
                    ))}
                </div>
                <span>{config.label}</span>
            </div>
        </SimpleTooltip>
    );
}
