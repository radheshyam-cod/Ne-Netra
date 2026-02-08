import { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { Search, MapPin, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from './ui/dialog';

interface GlobalSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    districts: string[];
}

/**
 * Global Search Command Palette (Ctrl+K)
 */
export function GlobalSearch({ open, onOpenChange, districts }: GlobalSearchProps) {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    // Handle keyboard shortcut (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onOpenChange(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onOpenChange]);

    const handleSelect = useCallback((action: string, value?: string) => {
        onOpenChange(false);

        switch (action) {
            case 'district':
                if (value) {
                    navigate(`/?district=${encodeURIComponent(value)}`);
                }
                break;
            case 'map':
                navigate('/map');
                break;
            case 'ingest':
                navigate('/ingest');
                break;
            case 'actions':
                navigate('/actions');
                break;
            case 'review':
                navigate('/review');
                break;
            case 'audit':
                navigate('/audit');
                break;
        }

        setSearch('');
    }, [navigate, onOpenChange]);

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 max-w-2xl">
                <Command className="rounded-lg border shadow-md">
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Search districts, pages, actions..."
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <Command.List className="max-h-[400px] overflow-y-auto p-2">
                        <Command.Empty className="py-6 text-center text-sm text-slate-500">
                            No results found.
                        </Command.Empty>

                        {/* Districts */}
                        <Command.Group heading="Districts">
                            {districts.filter(d => d.toLowerCase().includes(search.toLowerCase())).slice(0, 5).map((district) => (
                                <Command.Item
                                    key={district}
                                    value={district}
                                    onSelect={() => handleSelect('district', district)}
                                    className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <MapPin className="h-4 w-4" />
                                    <span>{district}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>

                        {/* Pages */}
                        <Command.Group heading="Pages">
                            <Command.Item
                                value="map"
                                onSelect={() => handleSelect('map')}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <MapPin className="h-4 w-4" />
                                <span>Risk Map</span>
                            </Command.Item>
                            <Command.Item
                                value="ingest"
                                onSelect={() => handleSelect('ingest')}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <FileText className="h-4 w-4" />
                                <span>Ingest Signals</span>
                            </Command.Item>
                            <Command.Item
                                value="actions"
                                onSelect={() => handleSelect('actions')}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <CheckCircle className="h-4 w-4" />
                                <span>Advisory Actions</span>
                            </Command.Item>
                            <Command.Item
                                value="review"
                                onSelect={() => handleSelect('review')}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                <span>Officer Review</span>
                            </Command.Item>
                            <Command.Item
                                value="audit"
                                onSelect={() => handleSelect('audit')}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <FileText className="h-4 w-4" />
                                <span>Audit Log</span>
                            </Command.Item>
                        </Command.Group>

                        {/* Quick Actions */}
                        <Command.Group heading="Quick Actions">
                            <Command.Item
                                value="high-risk"
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span>View High-Risk Districts</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>

                    <div className="border-t p-2 text-xs text-slate-500">
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Esc
                        </kbd>{' '}
                        to close
                    </div>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
