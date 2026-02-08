import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { exportDistrictToPDF } from '../utils/pdf-export';
import { exportToExcel, exportToCSV } from '../utils/excel-export';
import { showToast } from './ui/toast';
import { RiskScoreData } from '../services/api';

interface ExportButtonProps {
    district: string;
    riskData: RiskScoreData;
    signals?: any[];
    actions?: any[];
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Export Button with dropdown for multiple formats
 */
export function ExportButton({
    district,
    riskData,
    signals,
    actions,
    variant = 'outline',
    size = 'default',
}: ExportButtonProps) {
    const handlePDFExport = async () => {
        try {
            await exportDistrictToPDF(district, riskData, signals, actions);
            showToast.success('PDF report generated successfully');
        } catch (error) {
            console.error('PDF export error:', error);
            showToast.error('Failed to generate PDF report');
        }
    };

    const handleExcelExport = () => {
        try {
            exportToExcel(district, riskData, signals, actions);
            showToast.success('Excel file exported successfully');
        } catch (error) {
            console.error('Excel export error:', error);
            showToast.error('Failed to export Excel file');
        }
    };

    const handleCSVExport = () => {
        try {
            if (signals && signals.length > 0) {
                exportToCSV(signals, `${district}_signals`);
                showToast.success('CSV file exported successfully');
            } else {
                showToast.error('No signals data to export');
            }
        } catch (error) {
            console.error('CSV export error:', error);
            showToast.error('Failed to export CSV file');
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePDFExport}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExcelExport}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCSVExport}>
                    <File className="w-4 h-4 mr-2" />
                    Export as CSV
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
