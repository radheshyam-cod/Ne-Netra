import { NavLink } from 'react-router-dom';
import {
    LayoutGrid,
    Terminal,
    TriangleAlert,
    Map as MapIcon,
    ClipboardList,
    ShieldCheck,
    Clock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/app/components/app-logo';

interface SidebarNavProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function SidebarNav({ collapsed, onToggle }: SidebarNavProps) {
    const navItems = [
        { to: '/', icon: LayoutGrid, label: 'Dashboard' },
        { to: '/ingest', icon: Terminal, label: 'Ingest Intelligence' },
        { to: '/analysis', icon: TriangleAlert, label: 'Risk Analysis' },
        { to: '/map', icon: MapIcon, label: 'Map & Hotspots' },
        { to: '/actions', icon: ClipboardList, label: 'Suggested Actions' },
        { to: '/review', icon: ShieldCheck, label: 'Officer Review' },
        { to: '/audit', icon: Clock, label: 'Audit Log' },
    ];

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen z-40 bg-sidebar-bg border-r border-sidebar-border transition-all duration-300 flex flex-col",
                collapsed ? "w-[64px]" : "w-[240px]"
            )}
        >
            {/* Brand */}
            <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
                <AppLogo className="w-8 h-8" showLabel={false} />
                <div className={cn("ml-3 overflow-hidden transition-opacity duration-200", collapsed ? "opacity-0 w-0" : "opacity-100")}>
                    <h1 className="text-base font-bold text-foreground tracking-tight whitespace-nowrap">NE-NETRA</h1>
                    <p className="text-[10px] text-foreground-tertiary uppercase tracking-wider">Intel Sys</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 space-y-1 px-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => cn(
                            "flex items-center px-3 py-2.5 rounded-md transition-colors group relative",
                            isActive
                                ? "bg-sidebar-active-bg text-sidebar-active"
                                : "text-sidebar-foreground hover:bg-background-tertiary hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5 shrink-0", collapsed ? "mx-auto" : "mr-3")} />

                        {!collapsed && (
                            <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                        )}

                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / User Info could go here */}
            <div className="p-4 border-t border-sidebar-border">
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center p-2 rounded-md hover:bg-background-tertiary text-sidebar-foreground transition-colors"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <div className="flex items-center text-xs"><ChevronLeft className="w-4 h-4 mr-2" /> Collapse Sidebar</div>}
                </button>
            </div>
        </aside>
    );
}
