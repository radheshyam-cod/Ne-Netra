import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RiskScoreData } from '../services/api';
import { formatDateTime } from '../utils/time';

/**
 * Export comparison view to PDF
 */
export async function exportComparisonToPDF(
    districts: string[],
    data: Record<string, RiskScoreData>
) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55);
    doc.text('NE-NETRA District Comparison Report', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated: ${formatDateTime(new Date())}`, 14, 28);
    doc.text(`Comparing ${districts.length} districts`, 14, 34);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('Decision Support Only | DPDP Compliant', 14, 285);

    // Comparison Table
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Risk Score Comparison', 14, 45);

    // Prepare table data
    const tableData = districts.map(district => {
        const d = data[district];
        return [
            district,
            d?.score?.toString() || 'N/A',
            d?.risk_level?.toUpperCase() || 'N/A',
            d?.trend || 'N/A',
            d?.layer_scores?.cognitive?.toFixed(1) || 'N/A',
            d?.layer_scores?.network?.toFixed(1) || 'N/A',
            d?.layer_scores?.physical?.toFixed(1) || 'N/A',
        ];
    });

    autoTable(doc, {
        startY: 50,
        head: [['District', 'Score', 'Level', 'Trend', 'Cognitive', 'Network', 'Physical']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
    });

    // Add individual district summaries
    let currentY = (doc as any).lastAutoTable.finalY + 15;

    districts.forEach((district, index) => {
        if (currentY > 240) {
            doc.addPage();
            currentY = 20;
        }

        const d = data[district];

        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text(`${index + 1}. ${district}`, 14, currentY);
        currentY += 7;

        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`Risk Score: ${d?.score || 'N/A'} (${d?.risk_level?.toUpperCase() || 'N/A'})`, 20, currentY);
        currentY += 5;
        doc.text(`Trend: ${d?.trend || 'N/A'}`, 20, currentY);
        currentY += 5;
        doc.text(`Primary Trigger: ${d?.primary_trigger || 'N/A'}`, 20, currentY);
        currentY += 10;
    });

    // Save
    doc.save(`NE-NETRA_Comparison_${Date.now()}.pdf`);
}
