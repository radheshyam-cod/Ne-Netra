import { useState, useEffect } from 'react';
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
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
}

// NE States configuration
const NE_STATES = {
  'Meghalaya': ['East Garo Hills', 'West Garo Hills', 'North Garo Hills', 'South Garo Hills', 'South West Garo Hills',
    'East Khasi Hills', 'West Khasi Hills', 'South West Khasi Hills', 'Eastern West Khasi Hills', 'Ri-Bhoi',
    'East Jaintia Hills', 'West Jaintia Hills'],
  'Assam': ['Baksa', 'Bajali', 'Barpeta', 'Bongaigaon', 'Chirang', 'Dhubri', 'Goalpara', 'Kamrup', 'Kamrup Metropolitan',
    'Kokrajhar', 'Nalbari', 'South Salmara-Mankachar', 'Tamulpur', 'Biswanath', 'Darrang', 'Sonitpur', 'Udalguri',
    'Charaideo', 'Dhemaji', 'Dibrugarh', 'Golaghat', 'Jorhat', 'Lakhimpur', 'Majuli', 'Sivasagar', 'Tinsukia',
    'Dima Hasao', 'Hojai', 'Morigaon', 'Nagaon', 'Karbi Anglong', 'West Karbi Anglong', 'Cachar', 'Hailakandi', 'Karimganj'],
  'Arunachal Pradesh': ['Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 'Kamle', 'Kra Daadi', 'Kurung Kumey',
    'Lepa-Rada', 'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri', 'Namsai',
    'Pakke-Kessang', 'Papum Pare', 'Shi Yomi', 'Siang', 'Tawang', 'Tirap', 'Upper Dibang Valley',
    'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'],
  'Manipur': ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong',
    'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'],
  'Mizoram': ['Aizawl', 'Champhai', 'Khawzawl', 'Saitual', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Serchhip', 'Saiha', 'Hnahthial'],
  'Nagaland': ['Chümoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Meluri', 'Mokokchung', 'Mon', 'Niuland',
    'Noklak', 'Peren', 'Phek', 'Shamator', 'Tuensang', 'Tseminyü', 'Wokha', 'Zünheboto'],
  'Tripura': ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
  'Sikkim': ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim', 'Pakyong', 'Soreng']
};

export function DashboardHeader({ selectedDistrict, onDistrictChange }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [stateOpen, setStateOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('');
  const [filteredDistricts, setFilteredDistricts] = useState<string[]>([]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Determine state from selected district (only if state not manually selected)
  useEffect(() => {
    if (selectedDistrict && !selectedState) {
      // Auto-detect state only if user hasn't manually selected one
      for (const [state, stateDistricts] of Object.entries(NE_STATES)) {
        if (stateDistricts.includes(selectedDistrict)) {
          setSelectedState(state);
          setFilteredDistricts(stateDistricts);
          break;
        }
      }
    }
  }, [selectedDistrict, selectedState]);

  // Handle state selection
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setFilteredDistricts(NE_STATES[state as keyof typeof NE_STATES] || []);
    setStateOpen(false);
    // Clear district since we're changing state
    if (selectedDistrict && filteredDistricts.length > 0 && !filteredDistricts.includes(selectedDistrict)) {
      onDistrictChange('');
    }
  };

  // Handle district selection
  const handleDistrictChange = (district: string) => {
    onDistrictChange(district);
    setDistrictOpen(false);
  };

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
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <AppLogo />
            <div>
            </div>
          </div>

          {/* State and District Selectors + Status */}
          <div className="flex items-center space-x-4">
            {/* State Selector */}
            <Popover open={stateOpen} onOpenChange={setStateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={stateOpen}
                  className="w-[200px] justify-between bg-background-secondary border-border text-foreground"
                >
                  {selectedState || "Select state..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search state..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No state found.</CommandEmpty>
                    <CommandGroup>
                      {Object.keys(NE_STATES).map((state) => (
                        <CommandItem
                          key={state}
                          value={state}
                          onSelect={() => handleStateChange(state)}
                        >
                          {state}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedState === state ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* District Selector */}
            <Popover open={districtOpen} onOpenChange={setDistrictOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={districtOpen}
                  className="w-[240px] justify-between bg-background-secondary border-border text-foreground"
                  disabled={!selectedState}
                >
                  {selectedDistrict || "Select district..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0">
                <Command>
                  <CommandInput placeholder="Search district..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No district found.</CommandEmpty>
                    <CommandGroup>
                      {filteredDistricts.map((district) => (
                        <CommandItem
                          key={district}
                          value={district}
                          onSelect={() => handleDistrictChange(district)}
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

            <div className="h-6 w-px bg-border" />

            {/* Connectivity Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isOnline ? 'bg-green-500/10 border-green-500/20 text-green-700' : 'bg-red-500/10 border-red-500/20 text-red-700'}`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="text-xs font-medium uppercase tracking-wide">{isOnline ? 'Live Mode' : 'Offline'}</span>
            </div>

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
      </div>
    </header>
  );
}
