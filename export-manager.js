/**
 * Export Manager for Aviation HMI
 * Supports multiple formats: CSV, JSON, PDF, ExcelXML
 * Customizable templates and automatic reports
 */

import { i18n } from './i18n.js';

class ExportManager {
    constructor() {
        this.templates = {};
        this.initTemplates();
    }

    /**
     * Initialize export templates
     */
    initTemplates() {
        this.templates = {
            'full-report': {
                name: 'Rapport Complet CFR',
                description: 'Export complet conforme à la Part-M',
                includes: ['aircraft', 'session', 'faults', 'bite', 'trends']
            },
            'maintenance': {
                name: 'Rapport de Maintenance',
                description: 'Focus sur les actions de maintenance requises',
                includes: ['faults', 'bite', 'mel', 'recommendations']
            },
            'flight-log': {
                name: 'Journal de Vol',
                description: 'Données de vol et paramètres',
                includes: ['aircraft', 'session', 'parameters', 'events']
            },
            'bite-results': {
                name: 'Résultats BITE',
                description: 'Tests système uniquement',
                includes: ['bite']
            },
            'training-summary': {
                name: 'Résumé Formation',
                description: 'Statistiques et résultats de formation',
                includes: ['training']
            },
            'trend-analysis': {
                name: 'Analyse de Tendances',
                description: 'Maintenance prédictive',
                includes: ['trends', 'predictions']
            }
        };
    }

    /**
     * Export data in specified format
     * @param {string} format - Export format (csv, json, pdf, excel)
     * @param {string} template - Template name
     * @param {object} options - Export options
     */
    async export(format = 'csv', template = 'full-report', options = {}) {
        console.log(`[EXPORT] Starting export: ${format} - ${template}`);

        try {
            const data = this.collectData(template);
            
            switch (format.toLowerCase()) {
                case 'csv':
                    return this.exportCSV(data, template, options);
                case 'json':
                    return this.exportJSON(data, template, options);
                case 'pdf':
                    return this.exportPDF(data, template, options);
                case 'excel':
                    return this.exportExcel(data, template, options);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            console.error('[EXPORT] Error:', error);
            throw error;
        }
    }

    /**
     * Collect data based on template
     * @param {string} template - Template name
     */
    collectData(template) {
        const templateConfig = this.templates[template];
        if (!templateConfig) {
            throw new Error(`Unknown template: ${template}`);
        }

        const data = {
            metadata: {
                exportDate: new Date().toISOString(),
                template: template,
                templateName: templateConfig.name,
                version: '2.5.0'
            }
        };

        // Collect data based on template includes
        templateConfig.includes.forEach(section => {
            switch (section) {
                case 'aircraft':
                    data.aircraft = this.getAircraftInfo();
                    break;
                case 'session':
                    data.session = this.getSessionInfo();
                    break;
                case 'faults':
                    data.faults = this.getFaults();
                    break;
                case 'bite':
                    data.bite = this.getBITEResults();
                    break;
                case 'trends':
                    data.trends = this.getTrendsData();
                    break;
                case 'training':
                    data.training = this.getTrainingData();
                    break;
                case 'parameters':
                    data.parameters = this.getCurrentParameters();
                    break;
                case 'events':
                    data.events = this.getEvents();
                    break;
                case 'mel':
                    data.mel = this.getMELStatus();
                    break;
                case 'recommendations':
                    data.recommendations = this.getRecommendations();
                    break;
                case 'predictions':
                    data.predictions = this.getPredictions();
                    break;
            }
        });

        return data;
    }

    /**
     * Get aircraft information
     */
    getAircraftInfo() {
        return {
            registration: 'F-GKXA',
            type: 'A320-214',
            msn: '2145',
            engines: 'CFM56-5B4 × 2',
            operator: 'Demo Airlines'
        };
    }

    /**
     * Get session information
     */
    getSessionInfo() {
        return {
            sessionId: document.getElementById('session-id')?.textContent || 'N/A',
            startTime: window.appState?.flightStartTime ? new Date(window.appState.flightStartTime).toISOString() : new Date().toISOString(),
            duration: this.calculateSessionDuration(),
            utc: document.getElementById('utc-clock')?.textContent || 'N/A',
            flightTime: document.getElementById('flt-time')?.textContent || 'N/A'
        };
    }

    /**
     * Calculate session duration
     */
    calculateSessionDuration() {
        if (!window.appState?.flightStartTime) return 0;
        return Math.floor((Date.now() - window.appState.flightStartTime) / 1000);
    }

    /**
     * Get current faults
     */
    getFaults() {
        if (!window.appState?.alarms) return [];
        
        return window.appState.alarms.map(alarm => ({
            timestamp: alarm.timestamp || new Date().toISOString(),
            code: alarm.code || 'N/A',
            system: alarm.system || 'UNKNOWN',
            message: alarm.message || '',
            severity: alarm.severity || 'CAUTION',
            acknowledged: alarm.acknowledged || false
        }));
    }

    /**
     * Get BITE test results
     */
    getBITEResults() {
        if (!window.advancedFeatures?.bite) return [];
        
        const bite = window.advancedFeatures.bite;
        const results = bite.getRecentResults(100);
        
        return results.map(result => ({
            timestamp: result.startTime,
            system: result.systemName,
            systemId: result.systemId,
            category: result.category,
            criticality: result.criticality,
            status: result.overallStatus,
            duration: result.duration,
            testsRun: result.tests.length,
            testsPassed: result.tests.filter(t => t.status === 'PASS').length,
            testsFailed: result.tests.filter(t => t.status === 'FAIL').length,
            errors: result.tests
                .filter(t => t.status === 'FAIL')
                .map(t => ({
                    test: t.testName,
                    code: t.errorCode,
                    message: t.errorMessage
                }))
        }));
    }

    /**
     * Get trends data
     */
    getTrendsData() {
        if (!window.advancedFeatures?.trend) return null;
        
        const trend = window.advancedFeatures.trend;
        const dashboard = trend.getDashboardData();
        const params = trend.getParametersSummary();
        const alerts = trend.getActiveAlerts();
        
        return {
            statistics: dashboard.stats,
            parameters: params.map(p => ({
                name: p.name,
                category: p.category,
                status: p.status,
                currentValue: p.currentValue,
                unit: p.unit,
                dataPoints: p.dataPoints,
                trend: p.trend || null
            })),
            alerts: alerts.map(a => ({
                timestamp: a.timestamp,
                parameter: a.parameterName,
                severity: a.severity,
                message: a.message,
                trend: a.trend,
                recommendation: a.recommendation
            }))
        };
    }

    /**
     * Get training data
     */
    getTrainingData() {
        if (!window.advancedFeatures?.training) return null;
        
        const training = window.advancedFeatures.training;
        const stats = training.getStatistics();
        const history = training.getHistory(50);
        
        return {
            statistics: stats,
            recentSessions: history.map(session => ({
                timestamp: session.startTime,
                scenario: session.scenarioName,
                duration: session.duration,
                score: session.score,
                maxScore: session.maxScore,
                percentage: session.scorePercentage,
                passed: session.passed,
                completedActions: session.completedActions,
                totalActions: session.totalActions
            }))
        };
    }

    /**
     * Get current parameters
     */
    getCurrentParameters() {
        if (!window.appState?.sensorData) return {};
        
        return JSON.parse(JSON.stringify(window.appState.sensorData));
    }

    /**
     * Get events log
     */
    getEvents() {
        // This would come from a centralized events log
        // For now, return empty array
        return [];
    }

    /**
     * Get MEL status
     */
    getMELStatus() {
        if (!window.faultHistory) return [];
        
        // This would come from the fault history with MEL classification
        return [];
    }

    /**
     * Get maintenance recommendations
     */
    getRecommendations() {
        const recommendations = [];
        
        // From BITE failures
        if (window.advancedFeatures?.bite) {
            const bite = window.advancedFeatures.bite;
            const report = bite.generateMaintenanceReport();
            if (report.recommendations) {
                recommendations.push(...report.recommendations);
            }
        }
        
        // From trends
        if (window.advancedFeatures?.trend) {
            const trend = window.advancedFeatures.trend;
            const report = trend.generateMaintenanceReport();
            if (report.recommendations) {
                recommendations.push(...report.recommendations);
            }
        }
        
        return recommendations;
    }

    /**
     * Get predictions
     */
    getPredictions() {
        if (!window.advancedFeatures?.trend) return [];
        
        const trend = window.advancedFeatures.trend;
        const params = trend.getParametersSummary();
        
        return params
            .filter(p => p.trend)
            .map(p => ({
                parameter: p.name,
                currentValue: p.currentValue,
                trend: p.trend,
                prediction: p.prediction || null,
                status: p.status
            }));
    }

    /**
     * Export as CSV
     */
    exportCSV(data, template, options) {
        let csv = '';
        
        // Header
        csv += `Aviation HMI - ${this.templates[template].name}\n`;
        csv += `Export Date: ${new Date().toLocaleString()}\n`;
        csv += `Template: ${template}\n`;
        csv += `\n`;

        // Aircraft info
        if (data.aircraft) {
            csv += `Aircraft Information\n`;
            csv += `Registration,${data.aircraft.registration}\n`;
            csv += `Type,${data.aircraft.type}\n`;
            csv += `MSN,${data.aircraft.msn}\n`;
            csv += `\n`;
        }

        // Session info
        if (data.session) {
            csv += `Session Information\n`;
            csv += `Session ID,${data.session.sessionId}\n`;
            csv += `Start Time,${data.session.startTime}\n`;
            csv += `Duration,${data.session.duration}s\n`;
            csv += `\n`;
        }

        // Faults
        if (data.faults && data.faults.length > 0) {
            csv += `Active Faults (${data.faults.length})\n`;
            csv += `Timestamp,Code,System,Message,Severity,Acknowledged\n`;
            data.faults.forEach(fault => {
                csv += `${fault.timestamp},${fault.code},${fault.system},"${fault.message}",${fault.severity},${fault.acknowledged}\n`;
            });
            csv += `\n`;
        }

        // BITE Results
        if (data.bite && data.bite.length > 0) {
            csv += `BITE Test Results (${data.bite.length})\n`;
            csv += `Timestamp,System,Category,Criticality,Status,Duration,Tests Run,Passed,Failed\n`;
            data.bite.forEach(result => {
                csv += `${result.timestamp},${result.system},${result.category},${result.criticality},${result.status},${result.duration}ms,${result.testsRun},${result.testsPassed},${result.testsFailed}\n`;
            });
            csv += `\n`;
        }

        // Recommendations
        if (data.recommendations && data.recommendations.length > 0) {
            csv += `Maintenance Recommendations (${data.recommendations.length})\n`;
            csv += `Priority,System,Action,Notes\n`;
            data.recommendations.forEach(rec => {
                csv += `${rec.priority || 'MEDIUM'},${rec.system || 'N/A'},"${rec.action || rec.recommendation || ''}","${rec.notes || ''}"\n`;
            });
            csv += `\n`;
        }

        // Footer
        csv += `\n`;
        csv += `Generated by Aviation HMI v2.5.0\n`;
        csv += `© 2026 AERO-DIAG\n`;

        this.downloadFile(csv, `aviation-hmi-${template}-${Date.now()}.csv`, 'text/csv');
        return { success: true, format: 'csv', size: csv.length };
    }

    /**
     * Export as JSON
     */
    exportJSON(data, template, options) {
        const json = JSON.stringify(data, null, options.pretty ? 2 : 0);
        
        this.downloadFile(json, `aviation-hmi-${template}-${Date.now()}.json`, 'application/json');
        return { success: true, format: 'json', size: json.length };
    }

    /**
     * Export as PDF (HTML-based)
     */
    exportPDF(data, template, options) {
        const htmlContent = this.generateHTMLReport(data, template);
        
        // Create a printable window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Trigger print dialog
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
        return { success: true, format: 'pdf', method: 'print-dialog' };
    }

    /**
     * Export as Excel (XML format)
     */
    exportExcel(data, template, options) {
        // Generate Excel XML format
        let xml = `<?xml version="1.0"?>\n`;
        xml += `<?mso-application progid="Excel.Sheet"?>\n`;
        xml += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n`;
        xml += ` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n`;
        xml += `<Worksheet ss:Name="Report">\n`;
        xml += `<Table>\n`;

        // Header row
        xml += `<Row>\n`;
        xml += `<Cell><Data ss:Type="String">Aviation HMI - ${this.templates[template].name}</Data></Cell>\n`;
        xml += `</Row>\n`;

        // Data rows (simplified for now)
        if (data.faults) {
            xml += `<Row><Cell><Data ss:Type="String"></Data></Cell></Row>\n`;
            xml += `<Row><Cell><Data ss:Type="String">Faults</Data></Cell></Row>\n`;
            xml += `<Row>\n`;
            xml += `<Cell><Data ss:Type="String">Time</Data></Cell>\n`;
            xml += `<Cell><Data ss:Type="String">Code</Data></Cell>\n`;
            xml += `<Cell><Data ss:Type="String">System</Data></Cell>\n`;
            xml += `<Cell><Data ss:Type="String">Message</Data></Cell>\n`;
            xml += `</Row>\n`;
            
            data.faults.forEach(fault => {
                xml += `<Row>\n`;
                xml += `<Cell><Data ss:Type="String">${fault.timestamp}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${fault.code}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${fault.system}</Data></Cell>\n`;
                xml += `<Cell><Data ss:Type="String">${fault.message}</Data></Cell>\n`;
                xml += `</Row>\n`;
            });
        }

        xml += `</Table>\n`;
        xml += `</Worksheet>\n`;
        xml += `</Workbook>\n`;

        this.downloadFile(xml, `aviation-hmi-${template}-${Date.now()}.xls`, 'application/vnd.ms-excel');
        return { success: true, format: 'excel', size: xml.length };
    }

    /**
     * Generate HTML report for PDF
     */
    generateHTMLReport(data, template) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${this.templates[template].name}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        h1 {
            color: #1a4d80;
            border-bottom: 3px solid #1a4d80;
            padding-bottom: 10px;
        }
        h2 {
            color: #2563a0;
            margin-top: 30px;
            border-left: 4px solid #2563a0;
            padding-left: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #1a4d80;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .info-box {
            background: #e8f4f8;
            padding: 15px;
            border-left: 4px solid #2563a0;
            margin: 20px 0;
        }
        .warning {
            background: #fff3cd;
            border-left-color: #ff9800;
        }
        .critical {
            background: #ffe6e6;
            border-left-color: #f44336;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        @media print {
            body { margin: 0; }
            h2 { page-break-before: always; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <h1>${this.templates[template].name}</h1>
    
    <div class="info-box">
        <strong>Export Date:</strong> ${new Date().toLocaleString()}<br>
        <strong>Template:</strong> ${template}<br>
        <strong>Version:</strong> 2.5.0
    </div>

    ${data.aircraft ? `
        <h2>Aircraft Information</h2>
        <table>
            <tr><td><strong>Registration</strong></td><td>${data.aircraft.registration}</td></tr>
            <tr><td><strong>Type</strong></td><td>${data.aircraft.type}</td></tr>
            <tr><td><strong>MSN</strong></td><td>${data.aircraft.msn}</td></tr>
            <tr><td><strong>Engines</strong></td><td>${data.aircraft.engines}</td></tr>
        </table>
    ` : ''}

    ${data.session ? `
        <h2>Session Information</h2>
        <table>
            <tr><td><strong>Session ID</strong></td><td>${data.session.sessionId}</td></tr>
            <tr><td><strong>Start Time</strong></td><td>${data.session.startTime}</td></tr>
            <tr><td><strong>Duration</strong></td><td>${data.session.duration}s</td></tr>
        </table>
    ` : ''}

    ${data.faults && data.faults.length > 0 ? `
        <h2>Active Faults (${data.faults.length})</h2>
        <table>
            <tr>
                <th>Time</th>
                <th>Code</th>
                <th>System</th>
                <th>Message</th>
                <th>Severity</th>
            </tr>
            ${data.faults.map(f => `
                <tr class="${f.severity === 'WARNING' ? 'critical' : 'warning'}">
                    <td>${new Date(f.timestamp).toLocaleString()}</td>
                    <td>${f.code}</td>
                    <td>${f.system}</td>
                    <td>${f.message}</td>
                    <td>${f.severity}</td>
                </tr>
            `).join('')}
        </table>
    ` : ''}

    ${data.bite && data.bite.length > 0 ? `
        <h2>BITE Test Results (${data.bite.length})</h2>
        <table>
            <tr>
                <th>Time</th>
                <th>System</th>
                <th>Status</th>
                <th>Tests</th>
                <th>Passed</th>
                <th>Failed</th>
            </tr>
            ${data.bite.map(b => `
                <tr>
                    <td>${new Date(b.timestamp).toLocaleString()}</td>
                    <td>${b.system}</td>
                    <td>${b.status}</td>
                    <td>${b.testsRun}</td>
                    <td>${b.testsPassed}</td>
                    <td>${b.testsFailed}</td>
                </tr>
            `).join('')}
        </table>
    ` : ''}

    ${data.recommendations && data.recommendations.length > 0 ? `
        <h2>Maintenance Recommendations (${data.recommendations.length})</h2>
        <table>
            <tr>
                <th>Priority</th>
                <th>System</th>
                <th>Action</th>
            </tr>
            ${data.recommendations.map(r => `
                <tr>
                    <td>${r.priority || 'MEDIUM'}</td>
                    <td>${r.system || 'N/A'}</td>
                    <td>${r.action || r.recommendation || ''}</td>
                </tr>
            `).join('')}
        </table>
    ` : ''}

    <div class="footer">
        Generated by Aviation HMI v2.5.0 | © 2026 AERO-DIAG<br>
        Compliant with EASA CS-25 | Part-M | MSG-3
    </div>

    <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Print / Save as PDF
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">
            Close
        </button>
    </div>
</body>
</html>
        `;
    }

    /**
     * Download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Get available templates
     */
    getTemplates() {
        return Object.keys(this.templates).map(id => ({
            id,
            ...this.templates[id]
        }));
    }

    /**
     * Show export dialog
     */
    showExportDialog() {
        const modal = document.createElement('div');
        modal.className = 'export-modal';
        modal.id = 'export-modal';

        const templates = this.getTemplates();

        modal.innerHTML = `
            <div class="export-modal__backdrop"></div>
            <div class="export-modal__content">
                <div class="export-modal__header">
                    <h2><i class="fas fa-download"></i> ${i18n.t('btn.export')}</h2>
                    <button class="export-modal__close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="export-modal__body">
                    <div class="export-section">
                        <h3>Format d'Export</h3>
                        <div class="export-formats">
                            <label class="export-format-option">
                                <input type="radio" name="export-format" value="csv" checked>
                                <div class="format-card">
                                    <i class="fas fa-file-csv"></i>
                                    <span>CSV</span>
                                    <small>Excel compatible</small>
                                </div>
                            </label>
                            <label class="export-format-option">
                                <input type="radio" name="export-format" value="json">
                                <div class="format-card">
                                    <i class="fas fa-file-code"></i>
                                    <span>JSON</span>
                                    <small>Données structurées</small>
                                </div>
                            </label>
                            <label class="export-format-option">
                                <input type="radio" name="export-format" value="pdf">
                                <div class="format-card">
                                    <i class="fas fa-file-pdf"></i>
                                    <span>PDF</span>
                                    <small>Rapport imprimable</small>
                                </div>
                            </label>
                            <label class="export-format-option">
                                <input type="radio" name="export-format" value="excel">
                                <div class="format-card">
                                    <i class="fas fa-file-excel"></i>
                                    <span>Excel</span>
                                    <small>Format XML</small>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="export-section">
                        <h3>Template</h3>
                        <select id="export-template" class="export-select">
                            ${templates.map(t => `
                                <option value="${t.id}">${t.name} - ${t.description}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="export-section">
                        <label class="export-checkbox">
                            <input type="checkbox" id="export-pretty" checked>
                            <span>Formatage amélioré (JSON uniquement)</span>
                        </label>
                    </div>
                </div>

                <div class="export-modal__footer">
                    <button class="btn btn--ghost export-modal__close">
                        ${i18n.t('btn.cancel')}
                    </button>
                    <button class="btn btn--primary" id="btn-confirm-export">
                        <i class="fas fa-download"></i> Exporter
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelectorAll('.export-modal__close').forEach(btn => {
            btn.addEventListener('click', () => this.closeExportDialog());
        });

        modal.querySelector('#btn-confirm-export').addEventListener('click', async () => {
            const format = modal.querySelector('input[name="export-format"]:checked').value;
            const template = modal.querySelector('#export-template').value;
            const pretty = modal.querySelector('#export-pretty').checked;

            try {
                await this.export(format, template, { pretty });
                const title = window.i18n ? window.i18n.t('btn.export') : 'Export';
                const successMsg = window.i18n ? 
                    window.i18n.t('msg.export_success', { format: format.toUpperCase() }) : 
                    `✅ Export ${format.toUpperCase()} réussi !`;
                window.showSuccess(title, successMsg);
                this.closeExportDialog();
            } catch (error) {
                const title = window.i18n ? window.i18n.t('btn.export') : 'Export';
                const errorMsg = window.i18n ? 
                    window.i18n.t('msg.export_error', { error: error.message }) : 
                    `❌ Erreur lors de l'export : ${error.message}`;
                window.showError(title, errorMsg);
            }
        });

        // ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeExportDialog();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    /**
     * Close export dialog
     */
    closeExportDialog() {
        const modal = document.getElementById('export-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Singleton instance
export const exportManager = new ExportManager();

// Global exposure
window.exportManager = exportManager;

export default exportManager;
