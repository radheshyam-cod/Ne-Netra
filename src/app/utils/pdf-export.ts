import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RiskScoreData } from '../services/api';
import { formatDateTime } from '../utils/time';

/**
 * Export district risk analysis to PDF
 */
export async function exportDistrictToPDF(
    district: string,
    riskData: RiskScoreData,
    signals?: any[],
    actions?: any[]
) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text('NE-NETRA Intelligence Report', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(`District: ${district}`, 14, 28);
    doc.text(`Generated: ${formatDateTime(new Date())}`, 14, 34);

    // Footer disclaimer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // gray-400
    doc.text('Decision Support Only | DPDP Compliant | 6-Week Pilot', 14, 285);

    // Risk Score Summary
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Risk Assessment Summary', 14, 45);

    const riskColor = getRiskColor(riskData.risk_level);
    doc.setFillColor(...riskColor);
    doc.rect(14, 50, 180, 30, 'F');

    doc.setFontSize(36);
    doc.setTextColor(255, 255, 255);
    doc.text(riskData.score.toString(), 20, 70);

    doc.setFontSize(12);
    doc.text(`${riskData.risk_level.toUpperCase()} RISK`, 50, 65);
    doc.text(`Trend: ${riskData.trend}`, 50, 72);

    // Layer Breakdown
    if (riskData.layer_scores) {
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('Layer Analysis', 14, 90);

        autoTable(doc, {
            startY: 95,
            head: [['Layer', 'Score', 'Status']],
            body: [
                ['Cognitive', riskData.layer_scores.cognitive.toFixed(1), getLayerStatus(riskData.layer_scores.cognitive)],
                ['Network', riskData.layer_scores.network.toFixed(1), getLayerStatus(riskData.layer_scores.network)],
                ['Physical', riskData.layer_scores.physical.toFixed(1), getLayerStatus(riskData.layer_scores.physical)],
            ],
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }, // blue-500
        });
    }

    // Top Signals
    if (signals && signals.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY || 120;
        doc.setFontSize(14);
        doc.text('Top Signals', 14, finalY + 10);

        autoTable(doc, {
            startY: finalY + 15,
            head: [['Event', 'Severity', 'Source']],
            body: signals.slice(0, 5).map(s => [
                s.event_summary?.substring(0, 50) + '...' || 'N/A',
                s.severity_score || 'N/A',
                s.source_type || 'N/A'
            ]),
            theme: 'striped',
        });
    }

    // Advisory Actions
    if (actions && actions.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY || 180;
        doc.setFontSize(14);
        doc.text('Advisory Actions', 14, finalY + 10);

        autoTable(doc, {
            startY: finalY + 15,
            head: [['Priority', 'Action', 'Rationale']],
            body: actions.slice(0, 5).map(a => [
                a.priority || 'N/A',
                a.action?.substring(0, 40) + '...' || 'N/A',
                a.rationale?.substring(0, 40) + '...' || 'N/A'
            ]),
            theme: 'grid',
        });
    }

    // Save
    doc.save(`NE-NETRA_${district}_${Date.now()}.pdf`);
}

/**
 * Get risk level color
 */
function getRiskColor(level: string): [number, number, number] {
    switch (level) {
        case 'critical': return [239, 68, 68]; // red-500
        case 'high': return [245, 158, 11]; // amber-500
        case 'medium': return [59, 130, 246]; // blue-500
        default: return [34, 197, 94]; // green-500
    }
}

/**
 * Get layer status text
 */
function getLayerStatus(score: number): string {
    if (score >= 7) return 'High Alert';
    if (score >= 5) return 'Moderate';
    if (score >= 3) return 'Low';
    return 'Minimal';
}
