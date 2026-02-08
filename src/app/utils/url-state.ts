/**
 * URL State Management for Shareable Links
 * 
 * Manages application state in URL query parameters for shareable links
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

interface ComparisonState {
    districts: string[];
    startDate?: string;
    endDate?: string;
    metric?: string;
}

export function useURLState() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Parse comparison state from URL
    const getComparisonFromURL = useCallback((): ComparisonState | null => {
        const districts = searchParams.get('districts');
        if (!districts) return null;

        return {
            districts: districts.split(','),
            startDate: searchParams.get('startDate') || undefined,
            endDate: searchParams.get('endDate') || undefined,
            metric: searchParams.get('metric') || undefined
        };
    }, [searchParams]);

    // Set comparison state to URL
    const setComparisonToURL = useCallback((state: ComparisonState) => {
        const params = new URLSearchParams();

        params.set('districts', state.districts.join(','));
        if (state.startDate) params.set('startDate', state.startDate);
        if (state.endDate) params.set('endDate', state.endDate);
        if (state.metric) params.set('metric', state.metric);

        router.push(`?${params.toString()}`, { scroll: false });
    }, [router]);

    // Generate shareable link
    const getShareableLink = useCallback((state: ComparisonState): string => {
        const params = new URLSearchParams();
        params.set('districts', state.districts.join(','));
        if (state.startDate) params.set('startDate', state.startDate);
        if (state.endDate) params.set('endDate', state.endDate);
        if (state.metric) params.set('metric', state.metric);

        const baseUrl = typeof window !== 'undefined'
            ? `${window.location.origin}${window.location.pathname}`
            : '';

        return `${baseUrl}?${params.toString()}`;
    }, []);

    return {
        getComparisonFromURL,
        setComparisonToURL,
        getShareableLink
    };
}

// Hook for filter state in URL
interface FilterState {
    search?: string;
    severity?: string;
    source?: string;
    dateRange?: string;
}

export function useFilterURLState() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const getFiltersFromURL = useCallback((): FilterState => {
        return {
            search: searchParams.get('search') || undefined,
            severity: searchParams.get('severity') || undefined,
            source: searchParams.get('source') || undefined,
            dateRange: searchParams.get('dateRange') || undefined
        };
    }, [searchParams]);

    const setFiltersToURL = useCallback((filters: FilterState) => {
        const params = new URLSearchParams();

        if (filters.search) params.set('search', filters.search);
        if (filters.severity) params.set('severity', filters.severity);
        if (filters.source) params.set('source', filters.source);
        if (filters.dateRange) params.set('dateRange', filters.dateRange);

        const query = params.toString();
        router.push(query ? `?${query}` : window.location.pathname, { scroll: false });
    }, [router]);

    return {
        getFiltersFromURL,
        setFiltersToURL
    };
}

// Utility to copy shareable link
export async function copyShareableLink(link: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(link);
        return true;
    } catch (error) {
        console.error('Failed to copy link:', error);
        return false;
    }
}
