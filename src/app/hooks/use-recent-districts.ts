/**
 * Recently Viewed Districts Hook
 * 
 * Tracks and persists recently viewed districts in localStorage
 */

import { useEffect, useState } from 'react';

const MAX_RECENT_DISTRICTS = 5;
const STORAGE_KEY = 'ne-netra-recent-districts';

interface RecentDistrict {
    name: string;
    lastViewed: string; // ISO timestamp
}

export function useRecentDistricts() {
    const [recentDistricts, setRecentDistricts] = useState<string[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed: RecentDistrict[] = JSON.parse(stored);
                // Sort by last viewed and extract names
                const sorted = parsed
                    .sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())
                    .map(d => d.name);
                setRecentDistricts(sorted.slice(0, MAX_RECENT_DISTRICTS));
            }
        } catch (error) {
            console.error('Failed to load recent districts:', error);
        }
    }, []);

    const addRecentDistrict = (districtName: string) => {
        try {
            // Load existing
            const stored = localStorage.getItem(STORAGE_KEY);
            let districts: RecentDistrict[] = stored ? JSON.parse(stored) : [];

            // Remove if already exists
            districts = districts.filter(d => d.name !== districtName);

            // Add to front
            districts.unshift({
                name: districtName,
                lastViewed: new Date().toISOString()
            });

            // Keep only MAX_RECENT_DISTRICTS
            districts = districts.slice(0, MAX_RECENT_DISTRICTS);

            // Save back
            localStorage.setItem(STORAGE_KEY, JSON.stringify(districts));

            // Update state
            setRecentDistricts(districts.map(d => d.name));
        } catch (error) {
            console.error('Failed to save recent district:', error);
        }
    };

    const clearRecentDistricts = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setRecentDistricts([]);
        } catch (error) {
            console.error('Failed to clear recent districts:', error);
        }
    };

    return {
        recentDistricts,
        addRecentDistrict,
        clearRecentDistricts
    };
}
