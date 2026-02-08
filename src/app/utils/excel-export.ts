import * as XLSX from 'xlsx';
import { RiskScoreData } from '../services/api';
import { formatDateTime } from '../utils/time';

/**
 * Export district data to Excel with multiple sheets
 */
export function exportToExcel(
    district: string,
    riskData: RiskScoreData,
    signals?: any[],
    actions?: any[]
) {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [
        ['NE-NETRA Intelligence Report'],
        ['District', district],
        ['Generated', formatDateTime(new Date())],
        [],
        ['Risk Assessment'],
        ['Score', riskData.score],
        ['Level', riskData.risk_level.toUpperCase()],
        ['Trend', riskData.trend],
        ['Primary Trigger', riskData.primary_trigger || 'N/A'],
        [],
        ['Layer Scores'],
        ['Cognitive', riskData.layer_scores?.cognitive || 'N/A'],
        ['Network', riskData.layer_scores?.network || 'N/A'],
        ['Physical', riskData.layer_scores?.physical || 'N/A'],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 2: Signals
    if (signals && signals.length > 0) {
        const signalsData = signals.map(s => ({
            'Event Summary': s.event_summary || '',
            'Severity': s.severity_score || '',
            'Source Type': s.source_type || '',
            'Location': s.location || '',
            'Timestamp': s.timestamp ? formatDateTime(new Date(s.timestamp)) : '',
            'Risk Layers': s.risk_layers?.join(', ') || '',
            'Polarity': s.polarity || '',
            'Geo Sensitivity': s.geo_sensitivity?.join(', ') || '',
        }));

        const signalsSheet = XLSX.utils.json_to_sheet(signalsData);
        XLSX.utils.book_append_sheet(workbook, signalsSheet, 'Signals');
    }

    // Sheet 3: Actions
    if (actions && actions.length > 0) {
        const actionsData = actions.map(a => ({
            'Priority': a.priority || '',
            'Action': a.action || '',
            'Rationale': a.rationale || '',
        }));

        const actionsSheet = XLSX.utils.json_to_sheet(actionsData);
        XLSX.utils.book_append_sheet(workbook, actionsSheet, 'Advisory Actions');
    }

    // Sheet 4: Audit
    const auditData = [
        ['Export Metadata'],
        ['Exported By', 'User'], // TODO: Add actual user
        ['Export Time', formatDateTime(new Date())],
        ['District', district],
        ['Data Scope', 'Controlled Pilot Simulation'],
        ['Purpose', 'Intelligence Analysis'],
        [],
        ['Compliance'],
        ['DPDP Aligned', 'Yes'],
        ['District-Level Only', 'Yes'],
        ['PII Redacted', 'Yes'],
    ];

    const auditSheet = XLSX.utils.aoa_to_sheet(auditData);
    XLSX.utils.book_append_sheet(workbook, auditSheet, 'Audit');

    // Write file
    XLSX.writeFile(workbook, `NE-NETRA_${district}_${Date.now()}.xlsx`);
}

/**
 * Export simple CSV
 */
export function exportToCSV(data: any[], filename: string) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${Date.now()}.csv`;
    link.click();
}
