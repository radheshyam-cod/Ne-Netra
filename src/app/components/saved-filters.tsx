import { Save, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FilterOptions } from './advanced-filter-panel';
import { showToast } from './ui/toast';

interface SavedFilter {
    id: string;
    name: string;
    filters: FilterOptions;
    createdAt: Date;
}

interface SavedFiltersProps {
    currentFilters: FilterOptions;
    onLoadFilter: (filters: FilterOptions) => void;
}

/**
 * Saved Filters Component
 */
export function SavedFilters({ currentFilters, onLoadFilter }: SavedFiltersProps) {
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
    const [filterName, setFilterName] = useState('');

    useEffect(() => {
        loadSavedFilters();
    }, []);

    const loadSavedFilters = () => {
        try {
            const stored = localStorage.getItem('ne-netra-saved-filters');
            if (stored) {
                const filters = JSON.parse(stored);
                setSavedFilters(filters.map((f: any) => ({
                    ...f,
                    createdAt: new Date(f.createdAt)
                })));
            }
        } catch (error) {
            console.error('Failed to load saved filters:', error);
        }
    };

    const saveCurrentFilter = () => {
        if (!filterName.trim()) {
            showToast.error('Please enter a filter name');
            return;
        }

        const newFilter: SavedFilter = {
            id: Date.now().toString(),
            name: filterName,
            filters: currentFilters,
            createdAt: new Date(),
        };

        const updated = [...savedFilters, newFilter];
        setSavedFilters(updated);
        localStorage.setItem('ne-netra-saved-filters', JSON.stringify(updated));

        setFilterName('');
        showToast.success(`Filter "${newFilter.name}" saved`);
    };

    const deleteFilter = (id: string) => {
        const updated = savedFilters.filter(f => f.id !== id);
        setSavedFilters(updated);
        localStorage.setItem('ne-netra-saved-filters', JSON.stringify(updated));
        showToast.success('Filter deleted');
    };

    const loadFilter = (id: string) => {
        const filter = savedFilters.find(f => f.id === id);
        if (filter) {
            onLoadFilter(filter.filters);
            showToast.success(`Loaded "${filter.name}"`);
        }
    };

    return (
        <div className="space-y-4">
            {/* Save Current Filter */}
            <div className="flex gap-2">
                <Input
                    placeholder="Filter name..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                />
                <Button onClick={saveCurrentFilter} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                </Button>
            </div>

            {/* Saved Filters List */}
            {savedFilters.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Saved Filters</label>
                    {savedFilters.map(filter => (
                        <div key={filter.id} className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 justify-start"
                                onClick={() => loadFilter(filter.id)}
                            >
                                {filter.name}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteFilter(filter.id)}
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
