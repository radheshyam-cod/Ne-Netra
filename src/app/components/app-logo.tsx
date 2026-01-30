import React from 'react';
import { ScanEye } from 'lucide-react';

interface AppLogoProps {
    className?: string;
    showLabel?: boolean;
}

export function AppLogo({ className = '', showLabel = true }: AppLogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg border border-primary/20 overflow-hidden group">

                {/* Animated Pulse Background */}
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />

                {/* Core Icon */}
                <div className="relative z-10">
                    <ScanEye className="w-6 h-6 text-primary animate-pulse-slow" strokeWidth={1.5} />
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/40 rounded-tl" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/40 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/40 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/40 rounded-br" />
            </div>

            {showLabel && (
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        NE-NETRA
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-severity-medium opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-severity-medium"></span>
                        </span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest text-foreground-tertiary">
                        District Intelligence
                    </p>
                </div>
            )}
        </div>
    );
}
