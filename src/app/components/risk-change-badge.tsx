/**
 * Risk Score Change Indicator Badge
 * 
 * Shows risk score with visual change indicator (↑↓)
 */

import React from 'react';

interface RiskChangeBadgeProps {
    currentScore: number;
    previousScore?: number;
    showDetails?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function RiskChangeBadge({
    currentScore,
    previousScore,
    showDetails = true,
    size = 'md'
}: RiskChangeBadgeProps) {
    const change = previousScore !== undefined ? currentScore - previousScore : 0;
    const changePercent = previousScore && previousScore > 0
        ? ((change / previousScore) * 100).toFixed(1)
        : '0';

    const isIncrease = change > 0;
    const isDecrease = change < 0;
    const isStable = change === 0;

    // Size variants
    const sizes = {
        sm: {
            score: 'text-lg',
            change: 'text-xs',
            icon: 'text-sm',
            badge: 'px-2 py-1'
        },
        md: {
            score: 'text-2xl',
            change: 'text-sm',
            icon: 'text-base',
            badge: 'px-3 py-1.5'
        },
        lg: {
            score: 'text-3xl',
            change: 'text-base',
            icon: 'text-lg',
            badge: 'px-4 py-2'
        }
    };

    const sizeClass = sizes[size];

    return (
        <div className="inline-flex items-center gap-2">
            {/* Current Score */}
            <span className={`font-bold text-gray-900 dark:text-white ${sizeClass.score}`}>
                {currentScore}
                <span className="text-gray-500 dark:text-gray-400 font-normal">/100</span>
            </span>

            {/* Change Indicator */}
            {previousScore !== undefined && !isStable && (
                <div
                    className={`
            inline-flex items-center gap-1 rounded-full font-semibold
            ${sizeClass.badge}
            ${isIncrease
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}
          `}
                >
                    {/* Arrow Icon */}
                    <span className={sizeClass.icon}>
                        {isIncrease ? '↑' : '↓'}
                    </span>

                    {/* Change Value */}
                    <span className={sizeClass.change}>
                        {Math.abs(change)}
                        {showDetails && ` (${changePercent}%)`}
                    </span>
                </div>
            )}

            {/* Stable Indicator */}
            {previousScore !== undefined && isStable && (
                <div className={`
          inline-flex items-center gap-1 rounded-full font-semibold
          bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400
          ${sizeClass.badge}
        `}>
                    <span className={sizeClass.icon}>→</span>
                    <span className={sizeClass.change}>No change</span>
                </div>
            )}
        </div>
    );
}

// Variant with trend context
interface RiskTrendBadgeProps {
    currentScore: number;
    previousScores: number[]; // Last 7 days
}

export function RiskTrendBadge({ currentScore, previousScores }: RiskTrendBadgeProps) {
    if (previousScores.length === 0) {
        return <RiskChangeBadge currentScore={currentScore} />;
    }

    const lastScore = previousScores[previousScores.length - 1];
    const weekAgoScore = previousScores[0];

    // Calculate trend
    const dayChange = currentScore - lastScore;
    const weekChange = currentScore - weekAgoScore;

    const getTrendLabel = () => {
        if (weekChange > 10) return 'Rising rapidly';
        if (weekChange > 5) return 'Rising';
        if (weekChange < -10) return 'Falling rapidly';
        if (weekChange < -5) return 'Falling';
        return 'Stable';
    };

    const getTrendColor = () => {
        if (weekChange > 10) return 'text-red-600 dark:text-red-400';
        if (weekChange > 5) return 'text-orange-600 dark:text-orange-400';
        if (weekChange < -10) return 'text-green-600 dark:text-green-400';
        if (weekChange < -5) return 'text-lime-600 dark:text-lime-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <div className="space-y-1">
            <RiskChangeBadge
                currentScore={currentScore}
                previousScore={lastScore}
                showDetails={false}
            />

            <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">7-day trend:</span>
                <span className={`font-semibold ${getTrendColor()}`}>
                    {getTrendLabel()}
                </span>
                {weekChange !== 0 && (
                    <span className="text-gray-400">
                        ({weekChange > 0 ? '+' : ''}{weekChange})
                    </span>
                )}
            </div>
        </div>
    );
}
