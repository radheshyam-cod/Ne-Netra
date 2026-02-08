import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumbs Component
 * Automatically generates breadcrumbs based on current route
 */
export function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Route name mapping
    const routeNames: Record<string, string> = {
        '': 'Dashboard',
        'dashboard': 'Dashboard',
        'map': 'Risk Map',
        'analysis': 'Risk Analysis',
        'actions': 'Advisory Actions',
        'review': 'Officer Review',
        'audit': 'Audit Log',
        'Ne-Netra': 'Home',
    };

    if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'Ne-Netra')) {
        return null; // Don't show breadcrumbs on home page
    }

    return (
        <nav className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
            <Link
                to="/Ne-Netra"
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center gap-1"
            >
                <Home className="w-4 h-4" />
                <span>Home</span>
            </Link>

            {pathnames.map((pathname, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const displayName = routeNames[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);

                return (
                    <React.Fragment key={routeTo}>
                        <ChevronRight className="w-4 h-4" />
                        {isLast ? (
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                {displayName}
                            </span>
                        ) : (
                            <Link
                                to={routeTo}
                                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                            >
                                {displayName}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
