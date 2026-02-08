import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent, CardHeader } from './card';

/**
 * Loading skeleton for Risk Score Card
 */
export function RiskScoreCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton width={150} height={20} />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton circle width={80} height={80} />
                    <Skeleton width="100%" height={40} />
                    <Skeleton width="80%" height={20} />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton height={60} />
                        <Skeleton height={60} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Loading skeleton for Hotspot Card
 */
export function HotspotCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton width={120} height={20} />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton circle width={40} height={40} />
                            <div className="flex-1">
                                <Skeleton width="70%" height={16} />
                                <Skeleton width="50%" height={12} className="mt-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Loading skeleton for Action Card
 */
export function ActionCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Skeleton circle width={32} height={32} />
                        <div className="flex-1">
                            <Skeleton width="60%" height={18} />
                            <Skeleton width="90%" height={14} className="mt-2" />
                            <Skeleton width="40%" height={12} className="mt-2" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Loading skeleton for Data Table
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2">
            <Skeleton width="100%" height={40} /> {/* Header */}
            {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} width="100%" height={60} />
            ))}
        </div>
    );
}

/**
 * Generic page loading skeleton
 */
export function PageLoadingSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <Skeleton width={200} height={32} />
                <Skeleton width={300} height={20} className="mt-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <RiskScoreCardSkeleton />
                <HotspotCardSkeleton />
                <ActionCardSkeleton />
            </div>
        </div>
    );
}
