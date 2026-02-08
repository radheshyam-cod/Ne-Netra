import { Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { formatTimeAgo, getDataFreshness } from '../utils/time';
import { SimpleTooltip } from './ui/tooltip';

interface DataFreshnessBadgeProps {
    timestamp: string | Date;
    label?: string;
}

/**
 * Data Freshness Badge
 * Shows how recent the data is with color-coded indicator
 */
export function DataFreshnessBadge({ timestamp, label = 'Updated' }: DataFreshnessBadgeProps) {
    const freshness = getDataFreshness(timestamp);
    const timeAgo = formatTimeAgo(timestamp);

    const freshnessConfig = {
        fresh: {
            icon: CheckCircle2,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-950/30',
            border: 'border-green-200 dark:border-green-800',
            label: 'Fresh data',
        },
        recent: {
            icon: Clock,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            border: 'border-blue-200 dark:border-blue-800',
            label: 'Recent data',
        },
        stale: {
            icon: AlertCircle,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            border: 'border-amber-200 dark:border-amber-800',
            label: 'Data may be outdated',
        },
        old: {
            icon: XCircle,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-950/30',
            border: 'border-red-200 dark:border-red-800',
            label: 'Stale data',
        },
    };

    const config = freshnessConfig[freshness];
    const Icon = config.icon;

    return (
        <SimpleTooltip content={`${config.label} - ${label} ${timeAgo}`}>
            <div
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}
            >
                <Icon className="w-3 h-3" />
                <span>{timeAgo}</span>
            </div>
        </SimpleTooltip>
    );
}

interface LastUpdatedBadgeProps {
    timestamp: string | Date;
    prefix?: string;
}

/**
 * Simple "Last Updated" badge
 */
export function LastUpdatedBadge({ timestamp, prefix = 'Updated' }: LastUpdatedBadgeProps) {
    const timeAgo = formatTimeAgo(timestamp);

    return (
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            <span>
                {prefix} {timeAgo}
            </span>
        </div>
    );
}
