import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { PageHeader } from './PageHeader';
import { ComplianceFooter } from '../compliance-footer';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
    selectedDistrict: string;
    onDistrictChange: (district: string) => void;
}

export function AppLayout({ selectedDistrict, onDistrictChange }: AppLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Fixed Sidebar */}
            <SidebarNav
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300 min-h-screen",
                    sidebarCollapsed ? "pl-[64px]" : "pl-[240px]"
                )}
            >
                {/* Sticky Header */}
                <PageHeader
                    selectedDistrict={selectedDistrict}
                    onDistrictChange={onDistrictChange}
                />

                {/* Scrollable Content */}
                <main className="flex-1 p-6 overflow-y-auto flex flex-col">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-300 w-full flex-1">
                        <Outlet />
                    </div>

                    <div className="mt-8">
                        <ComplianceFooter />
                    </div>
                </main>
            </div>
        </div>
    );
}
