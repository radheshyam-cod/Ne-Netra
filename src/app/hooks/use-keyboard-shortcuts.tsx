import { useEffect } from 'react';

/**
 * Keyboard Shortcuts Hook
 */
export function useKeyboardShortcuts(handlers: {
    onSearch?: () => void;
    onEscape?: () => void;
    onHelp?: () => void;
    onExport?: () => void;
}) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + K - Global Search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                handlers.onSearch?.();
                return;
            }

            // Escape - Close modals/dialogs
            if (e.key === 'Escape') {
                handlers.onEscape?.();
                return;
            }

            // Ctrl/Cmd + / - Help
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                handlers.onHelp?.();
                return;
            }

            // Ctrl/Cmd + E - Export
            if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
                e.preventDefault();
                handlers.onExport?.();
                return;
            }

            // Ctrl/Cmd + D - Toggle Dark Mode
            if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
                e.preventDefault();
                const isDark = document.documentElement.classList.contains('dark');
                if (isDark) {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('ne-netra-theme', 'light');
                } else {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('ne-netra-theme', 'dark');
                }
                return;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handlers]);
}

/**
 * Keyboard Shortcuts Help Component
 */
export function KeyboardShortcutsHelp() {
    const shortcuts = [
        { key: 'Ctrl/Cmd + K', description: 'Open global search' },
        { key: 'Escape', description: 'Close dialogs' },
        { key: 'Ctrl/Cmd + E', description: 'Export current view' },
        { key: 'Ctrl/Cmd + D', description: 'Toggle dark mode' },
        { key: 'Ctrl/Cmd + /', description: 'Show this help' },
    ];

    return (
        <div className="space-y-2">
            <h3 className="font-semibold">Keyboard Shortcuts</h3>
            <div className="space-y-1">
                {shortcuts.map((shortcut) => (
                    <div key={shortcut.key} className="flex justify-between text-sm">
                        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border text-xs font-mono">
                            {shortcut.key}
                        </kbd>
                        <span className="text-slate-600 dark:text-slate-400">{shortcut.description}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
