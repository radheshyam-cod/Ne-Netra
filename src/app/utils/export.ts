/**
 * Export Utilities for NE-NETRA
 * Handles PDF and CSV exports for reports and data
 */

import { RiskScoreData, AuditLogEntry } from '@/app/services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export Risk Analysis Report as PDF
 */
export function exportRiskAnalysisPDF(
    district: string,
    riskData: RiskScoreData,
    history: any[]
) {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString('en-IN');

    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138); // Primary blue
    doc.text('NE-NETRA Risk Analysis Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${timestamp}`, 14, 28);
    doc.text(`District: ${district}`, 14, 34);

    // Horizontal line
    doc.setDrawColor(200);
    doc.line(14, 38, 196, 38);

    // Risk Score Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Composite Risk Score', 14, 48);

    doc.setFontSize(24);
    const scoreColor = getRiskColor(riskData.risk_level);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`${Math.round(riskData.score)}/100`, 14, 58);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Risk Level: ${riskData.risk_level.toUpperCase()}`, 50, 58);
    doc.text(`Trend: ${riskData.trend}`, 120, 58);

    // Layer Scores Table
    doc.setFontSize(12);
    doc.text('3-Layer Risk Model Breakdown', 14, 72);

    autoTable(doc, {
        startY: 76,
        head: [['Layer', 'Score', 'Status']],
        body: [
            [
                'Cognitive (Language/Sentiment)',
                `${riskData.layer_scores?.cognitive.toFixed(1) || 0}/10`,
                getScoreStatus(riskData.layer_scores?.cognitive || 0, 10),
            ],
            [
                'Network (Velocity/Spread)',
                `${riskData.layer_scores?.network.toFixed(1) || 0}/10`,
                getScoreStatus(riskData.layer_scores?.network || 0, 10),
            ],
            [
                'Physical (Geo/Volatility)',
                `${riskData.layer_scores?.physical.toFixed(1) || 0}/10`,
                getScoreStatus(riskData.layer_scores?.physical || 0, 10),
            ],
        ],
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] },
    });

    // Primary Trigger
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(12);
    doc.text('Primary Risk Trigger', 14, finalY + 10);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(riskData.primary_trigger, 14, finalY + 16, { maxWidth: 180 });

    // Hotspots Section (if exists)
    if (riskData.hotspots && riskData.hotspots.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Active Hotspots', 14, finalY + 28);

        autoTable(doc, {
            startY: finalY + 32,
            head: [['Location', 'Severity', 'Incidents', 'Type']],
            body: riskData.hotspots.slice(0, 5).map((h) => [
                h.location,
                h.severity.toUpperCase(),
                h.incidents.toString(),
                h.type,
            ]),
            theme: 'grid',
            headStyles: { fillColor: [30, 58, 138] },
        });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `NE-NETRA Early Warning Platform - Confidential - Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    // Save
    const filename = `NE-NETRA_RiskAnalysis_${district.replace(/\s/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(filename);
}

/**
 * Export Audit Log as CSV
 */
export function exportAuditLogCSV(district: string, auditLog: AuditLogEntry[]) {
    const headers = ['Timestamp', 'District', 'Officer', 'Action'];
    const rows = auditLog.map((log) => [
        new Date(log.timestamp).toLocaleString('en-IN'),
        log.district,
        log.officer_name,
        log.action,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    const filename = `NE-NETRA_AuditLog_${district.replace(/\s/g, '_')}_${new Date().getTime()}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export Risk History as CSV
 */
export function exportRiskHistoryCSV(district: string, history: any[]) {
    const headers = ['Timestamp', 'Score', 'Risk Level'];
    const rows = history.map((h) => [
        new Date(h.timestamp).toLocaleString('en-IN'),
        h.score.toFixed(2),
        h.risk_level,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    const filename = `NE-NETRA_RiskHistory_${district.replace(/\s/g, '_')}_${new Date().getTime()}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper functions
function getRiskColor(level: string): [number, number, number] {
    switch (level) {
        case 'critical':
            return [220, 38, 38]; // red
        case 'high':
            return [245, 158, 11]; // amber
        case 'medium':
            return [234, 179, 8]; // yellow
        case 'low':
            return [34, 197, 94]; // green
        default:
            return [100, 116, 139]; // gray
    }
}

function getScoreStatus(score: number, max: number): string {
    const percentage = (score / max) * 100;
    if (percentage >= 75) return 'Critical';
    if (percentage >= 50) return 'High';
    if (percentage >= 25) return 'Medium';
    return 'Low';
}
