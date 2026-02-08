import { DashboardHeader } from '@/app/components/dashboard-header';

interface PageHeaderProps {
    selectedDistrict: string;
    onDistrictChange: (district: string) => void;
}

export function PageHeader({ selectedDistrict, onDistrictChange }: PageHeaderProps) {
    return (
        <DashboardHeader
            selectedDistrict={selectedDistrict}
            onDistrictChange={onDistrictChange}
        />
    );
}
