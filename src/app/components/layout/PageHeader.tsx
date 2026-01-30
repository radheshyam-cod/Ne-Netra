import { useState, useEffect } from 'react';
import { Wifi, WifiOff, ChevronsUpDown, Check, Radio } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { cn } from '@/lib/utils';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/app/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/app/components/ui/popover';

interface PageHeaderProps {
    districts: string[];
    selectedDistrict: string;
    onDistrictChange: (district: string) => void;
}

export function PageHeader({ districts, selectedDistrict, onDistrictChange }: PageHeaderProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [open, setOpen] = useState(false);
    const [liveMode, setLiveMode] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearInterval(timer);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
            {/* Left: District Selector */}
            <div className="flex items-center gap-4">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-[240px] justify-between bg-background-secondary border-border text-foreground hover:bg-background-tertiary"
                        >
                            {selectedDistrict || "Select District..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0 bg-popover border-border">
                        <Command>
                            <CommandInput placeholder="Search district..." className="h-9" />
                            <CommandList>
                                <CommandEmpty>No district found.</CommandEmpty>
                                <CommandGroup>
                                    {districts.map((district) => (
                                        <CommandItem
                                            key={district}
                                            value={district}
                                            onSelect={(currentValue) => {
                                                const original = districts.find(d => d.toLowerCase() === currentValue.toLowerCase()) || currentValue;
                                                onDistrictChange(original === selectedDistrict ? "" : original);
                                                setOpen(false);
                                            }}
                                            className="text-foreground hover:bg-sidebar-active/20 hover:text-sidebar-active cursor-pointer"
                                        >
                                            {district}
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    selectedDistrict === district ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Right: System Status & Clock */}
            <div className="flex items-center gap-6">

                {/* Live Mode Toggle */}
                <div className="flex items-center gap-2">
                    <Switch
                        id="live-mode"
                        checked={liveMode}
                        onCheckedChange={setLiveMode}
                        className={cn(liveMode ? "bg-severity-high" : "bg-input")}
                    />
                    <Label htmlFor="live-mode" className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <span className={cn("relative flex h-2 w-2", liveMode ? "opacity-100" : "opacity-50")}>
                            {liveMode && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                            <span className={cn("relative inline-flex rounded-full h-2 w-2", liveMode ? "bg-red-500" : "bg-slate-500")}></span>
                        </span>
                        LIVE MODE
                    </Label>
                </div>

                <div className="h-4 w-px bg-border" />

                <div className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    isOnline
                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                        : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                    {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                    <span>{isOnline ? 'SYSTEM ACTIVE' : 'OFFLINE'}</span>
                </div>

                <div className="h-4 w-px bg-border" />

                <div className="text-right">
                    <div className="text-lg font-mono font-bold leading-none text-foreground tracking-wide">
                        {currentTime.toLocaleTimeString('en-IN', { hour12: false })}
                    </div>
                </div>
            </div>
        </div>
    );
}
