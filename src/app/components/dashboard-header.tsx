import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Check, ChevronsUpDown } from 'lucide-react';
import { AppLogo } from '@/app/components/app-logo';
import { cn } from './ui/utils';
import { Button } from '@/app/components/ui/button';
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

interface DashboardHeaderProps {
  districts: string[];
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
}

export function DashboardHeader({ districts, selectedDistrict, onDistrictChange }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Timer for clock
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Online status listeners
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* App Name */}
        <div className="flex items-center gap-3">
          <AppLogo />
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">NE-NETRA</h1>
            <p className="text-xs text-foreground-tertiary">Intelligence Dashboard</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">

          {/* Connectivity Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isOnline ? 'bg-green-500/10 border-green-500/20 text-green-700' : 'bg-red-500/10 border-red-500/20 text-red-700'}`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-xs font-medium">{isOnline ? 'System Online' : 'Offline Mode'}</span>
          </div>

          <div className="h-6 w-px bg-border mx-2" />

          {/* District Selector (Combobox) */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[240px] justify-between bg-background-secondary border-border text-foreground hover:bg-background-tertiary"
              >
                {selectedDistrict || "Search district..."}
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
                          // Find original casing to ensure backend compatibility
                          const original = districts.find(d => d.toLowerCase() === currentValue.toLowerCase()) || currentValue;
                          onDistrictChange(original === selectedDistrict ? "" : original);
                          setOpen(false);
                        }}
                        className="text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
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

          {/* Live Time */}
          <div className="text-right pl-4 border-l border-border">
            <div className="text-lg font-mono text-foreground tabular-nums">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-foreground-tertiary">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
