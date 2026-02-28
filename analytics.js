/**
 * Analytics Dashboard for Aviation HMI
 * Provides KPIs, reliability metrics, and predictive insights
 */

import { i18n } from './i18n.js';

class AnalyticsDashboard {
    constructor() {
        this.history = [];
        this.kpis = {};
        this.initAnalytics();
        this.loadHistory();
    }

    /**
     * Initialize analytics system
     */
    initAnalytics() {
        // Start collecting metrics
        this.startMetricsCollection();
        
        // Calculate KPIs every minute
        setInterval(() => this.calculateKPIs(), 60000);
    }

    /**
     * Load history from localStorage
     */
    loadHistory() {
        try {
            const stored = localStorage.getItem('analytics-history');
            if (stored) {
                this.history = JSON.parse(stored);
                // Limit to last 30 days
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                this.history = this.history.filter(entry => entry.timestamp > thirtyDaysAgo);
            }
        } catch (error) {
            console.error('[ANALYTICS] Error loading history:', error);
            this.history = [];
        }
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('analytics-history', JSON.stringify(this.history.slice(-1000)));
        } catch (error) {
            console.error('[ANALYTICS] Error saving history:', error);
        }
    }

    /**
     * Start collecting metrics
     */
    startMetricsCollection() {
        // Collect system state every 5 minutes
        setInterval(() => {
            this.captureSnapshot();
        }, 5 * 60 * 1000);

        // Initial capture
        this.captureSnapshot();
    }

    /**
     * Capture system snapshot
     */
    captureSnapshot() {
        if (!window.appState) return;

        const snapshot = {
            timestamp: Date.now(),
            alarmCount: window.appState.alarms?.length || 0,
            masterStatus: window.appState.masterStatus || 'normal',
            systems: this.getSystemsHealth(),
            parameters: this.getKeyParameters()
        };

        this.history.push(snapshot);
        this.saveHistory();
        this.calculateKPIs();
    }

    /**
     * Get systems health status
     */
    getSystemsHealth() {
        const systems = {};
        
        // Check each system status from sidebar
        ['engines', 'hydraulics', 'electrical', 'pressurization', 'flight_controls', 'fuel', 'apu'].forEach(systemId => {
            const statusEl = document.getElementById(`sys-${systemId}-status`);
            if (statusEl) {
                const classes = statusEl.className;
                let status = 'normal';
                if (classes.includes('warning')) status = 'warning';
                else if (classes.includes('caution')) status = 'caution';
                systems[systemId] = status;
            }
        });

        return systems;
    }

    /**
     * Get key parameters
     */
    getKeyParameters() {
        if (!window.appState?.sensorData) return {};

        return {
            eng1_n1: window.appState.sensorData.eng1?.n1 || 0,
            eng2_n1: window.appState.sensorData.eng2?.n1 || 0,
            hydraulic_green: window.appState.sensorData.hydraulics?.greenPress || 0,
            electrical_gen1: window.appState.sensorData.electrical?.gen1Load || 0
        };
    }

    /**
     * Calculate KPIs
     */
    calculateKPIs() {
        if (this.history.length === 0) return;

        this.kpis = {
            // Overall system health
            systemHealth: this.calculateSystemHealth(),
            
            // Reliability metrics
            mtbf: this.calculateMTBF(),
            mttr: this.calculateMTTR(),
            availability: this.calculateAvailability(),
            
            // Alarm statistics
            alarmRate: this.calculateAlarmRate(),
            falseAlarmRate: this.calculateFalseAlarmRate(),
            
            // System-specific
            systemReliability: this.calculateSystemReliability(),
            
            // Trends
            healthTrend: this.calculateHealthTrend(),
            
            // Predictions
            nextFailureProbability: this.calculateFailureProbability(),
            maintenanceUrgency: this.calculateMaintenanceUrgency()
        };

        return this.kpis;
    }

    /**
     * Calculate overall system health (0-100%)
     */
    calculateSystemHealth() {
        if (this.history.length === 0) return 100;

        const recent = this.history.slice(-12); // Last hour
        let healthScore = 100;

        recent.forEach(snapshot => {
            // Deduct points for alarms
            healthScore -= snapshot.alarmCount * 2;
            
            // Deduct for system issues
            Object.values(snapshot.systems).forEach(status => {
                if (status === 'caution') healthScore -= 5;
                if (status === 'warning') healthScore -= 10;
            });
        });

        return Math.max(0, Math.min(100, healthScore / recent.length * 100));
    }

    /**
     * Calculate Mean Time Between Failures (MTBF) in hours
     */
    calculateMTBF() {
        const failures = this.history.filter(s => s.alarmCount > 0);
        if (failures.length < 2) return null;

        const totalTime = this.history[this.history.length - 1].timestamp - this.history[0].timestamp;
        const hours = totalTime / (1000 * 60 * 60);
        
        return hours / failures.length;
    }

    /**
     * Calculate Mean Time To Repair (MTTR) in minutes
     */
    calculateMTTR() {
        // This would require tracking acknowledgment and resolution times
        // For now, estimate based on alarm persistence
        if (!window.appState?.alarms) return null;

        const alarms = window.appState.alarms;
        if (alarms.length === 0) return 0;

        let totalRepairTime = 0;
        let repairedCount = 0;

        alarms.forEach(alarm => {
            if (alarm.acknowledged && alarm.acknowledgeTime) {
                const repairTime = (alarm.acknowledgeTime - new Date(alarm.timestamp).getTime()) / (1000 * 60);
                totalRepairTime += repairTime;
                repairedCount++;
            }
        });

        return repairedCount > 0 ? totalRepairTime / repairedCount : null;
    }

    /**
     * Calculate system availability (%)
     */
    calculateAvailability() {
        if (this.history.length === 0) return 100;

        const normalCount = this.history.filter(s => s.masterStatus === 'normal').length;
        return (normalCount / this.history.length) * 100;
    }

    /**
     * Calculate alarm rate (alarms per hour)
     */
    calculateAlarmRate() {
        if (this.history.length < 2) return 0;

        const totalTime = this.history[this.history.length - 1].timestamp - this.history[0].timestamp;
        const hours = totalTime / (1000 * 60 * 60);
        
        const totalAlarms = this.history.reduce((sum, s) => sum + s.alarmCount, 0);
        
        return totalAlarms / hours;
    }

    /**
     * Calculate false alarm rate (estimated)
     */
    calculateFalseAlarmRate() {
        // Estimated: alarms that were quickly acknowledged without action
        // In a real system, this would track actual false alarms
        return Math.random() * 5; // 0-5% placeholder
    }

    /**
     * Calculate reliability by system
     */
    calculateSystemReliability() {
        const systems = ['engines', 'hydraulics', 'electrical', 'pressurization', 'flight_controls', 'fuel', 'apu'];
        const reliability = {};

        systems.forEach(systemId => {
            const systemStates = this.history.map(s => s.systems[systemId] || 'normal');
            const normalCount = systemStates.filter(s => s === 'normal').length;
            reliability[systemId] = (normalCount / systemStates.length) * 100;
        });

        return reliability;
    }

    /**
     * Calculate health trend (improving, stable, degrading)
     */
    calculateHealthTrend() {
        if (this.history.length < 10) return 'stable';

        const recentHealth = this.history.slice(-5).map(s => this.getSnapshotHealth(s));
        const olderHealth = this.history.slice(-10, -5).map(s => this.getSnapshotHealth(s));

        const recentAvg = recentHealth.reduce((a, b) => a + b, 0) / recentHealth.length;
        const olderAvg = olderHealth.reduce((a, b) => a + b, 0) / olderHealth.length;

        const diff = recentAvg - olderAvg;
        
        if (diff > 5) return 'improving';
        if (diff < -5) return 'degrading';
        return 'stable';
    }

    /**
     * Get health score for a snapshot
     */
    getSnapshotHealth(snapshot) {
        let score = 100;
        score -= snapshot.alarmCount * 5;
        Object.values(snapshot.systems).forEach(status => {
            if (status === 'caution') score -= 10;
            if (status === 'warning') score -= 20;
        });
        return Math.max(0, score);
    }

    /**
     * Calculate failure probability for next 24h
     */
    calculateFailureProbability() {
        if (this.history.length < 24) return 0;

        const recent24h = this.history.slice(-288); // 24h at 5min intervals
        const failureCount = recent24h.filter(s => s.alarmCount > 0).length;
        
        // Simple exponential smoothing
        const probability = (failureCount / recent24h.length) * 100;
        
        return Math.min(100, probability * 2); // Amplify for next period
    }

    /**
     * Calculate maintenance urgency (0-10 scale)
     */
    calculateMaintenanceUrgency() {
        let urgency = 0;

        // Factor 1: Current alarms
        if (window.appState?.alarms) {
            urgency += Math.min(3, window.appState.alarms.length * 0.5);
        }

        // Factor 2: BITE failures
        if (window.advancedFeatures?.bite) {
            const bite = window.advancedFeatures.bite;
            const stats = bite.getStatistics();
            if (stats.failed > 0) {
                urgency += Math.min(3, stats.failed * 0.3);
            }
        }

        // Factor 3: Trend degradation
        if (window.advancedFeatures?.trend) {
            const trend = window.advancedFeatures.trend;
            const alerts = trend.getActiveAlerts();
            urgency += Math.min(4, alerts.length * 0.5);
        }

        return Math.min(10, Math.round(urgency));
    }

    /**
     * Get dashboard data
     */
    getDashboardData() {
        return {
            kpis: this.kpis,
            overview: this.getOverview(),
            systemBreakdown: this.getSystemBreakdown(),
            timeSeriesData: this.getTimeSeriesData(),
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Get overview statistics
     */
    getOverview() {
        return {
            totalFlightTime: this.getTotalFlightTime(),
            totalAlarms: this.getTotalAlarms(),
            systemsMonitored: 7,
            lastUpdate: Date.now(),
            dataPoints: this.history.length,
            period: this.getDataPeriod()
        };
    }

    /**
     * Get total flight time
     */
    getTotalFlightTime() {
        if (this.history.length < 2) return 0;
        const milliseconds = this.history[this.history.length - 1].timestamp - this.history[0].timestamp;
        return Math.floor(milliseconds / (1000 * 60 * 60)); // hours
    }

    /**
     * Get total alarms
     */
    getTotalAlarms() {
        return this.history.reduce((sum, s) => sum + s.alarmCount, 0);
    }

    /**
     * Get data period
     */
    getDataPeriod() {
        if (this.history.length < 2) return '0d';
        const milliseconds = this.history[this.history.length - 1].timestamp - this.history[0].timestamp;
        const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days}d ${hours}h`;
    }

    /**
     * Get system breakdown
     */
    getSystemBreakdown() {
        const systems = ['engines', 'hydraulics', 'electrical', 'pressurization', 'flight_controls', 'fuel', 'apu'];
        const breakdown = [];

        systems.forEach(systemId => {
            const reliability = this.kpis.systemReliability?.[systemId] || 100;
            breakdown.push({
                id: systemId,
                name: i18n.t(`systems.${systemId}`),
                reliability: reliability.toFixed(1),
                status: reliability > 95 ? 'good' : reliability > 85 ? 'fair' : 'poor'
            });
        });

        return breakdown;
    }

    /**
     * Get time series data for charts
     */
    getTimeSeriesData() {
        return {
            timestamps: this.history.map(s => s.timestamp),
            systemHealth: this.history.map(s => this.getSnapshotHealth(s)),
            alarmCounts: this.history.map(s => s.alarmCount)
        };
    }

    /**
     * Get recommendations based on analytics
     */
    getRecommendations() {
        const recommendations = [];

        // Based on MTBF
        if (this.kpis.mtbf && this.kpis.mtbf < 10) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Reliability',
                message: `MTBF faible (${this.kpis.mtbf.toFixed(1)}h). Planifier maintenance préventive`,
                action: 'Inspecter systèmes critiques'
            });
        }

        // Based on system reliability
        if (this.kpis.systemReliability) {
            Object.entries(this.kpis.systemReliability).forEach(([system, reliability]) => {
                if (reliability < 85) {
                    recommendations.push({
                        priority: 'MEDIUM',
                        category: 'System',
                        message: `${i18n.t(`systems.${system}`)} : Fiabilité ${reliability.toFixed(0)}%`,
                        action: `Vérifier système ${system}`
                    });
                }
            });
        }

        // Based on health trend
        if (this.kpis.healthTrend === 'degrading') {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Trend',
                message: 'Tendance de santé en dégradation',
                action: 'Analyser les tendances des paramètres'
            });
        }

        // Based on maintenance urgency
        if (this.kpis.maintenanceUrgency > 7) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Maintenance',
                message: `Urgence maintenance élevée (${this.kpis.maintenanceUrgency}/10)`,
                action: 'Planifier intervention dans les 48h'
            });
        }

        return recommendations;
    }

    /**
     * Show analytics dashboard
     */
    show() {
        this.calculateKPIs();
        const data = this.getDashboardData();
        this.createModal(data);
    }

    /**
     * Create analytics modal
     */
    createModal(data) {
        const modal = document.createElement('div');
        modal.className = 'analytics-modal';
        modal.id = 'analytics-modal';

        modal.innerHTML = `
            <div class="analytics-modal__backdrop"></div>
            <div class="analytics-modal__container">
                <div class="analytics-modal__header">
                    <h2><i class="fas fa-chart-bar"></i> ${i18n.t('analytics.title')}</h2>
                    <button class="analytics-modal__close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="analytics-modal__body">
                    <!-- KPI Cards -->
                    <div class="analytics-kpis">
                        <div class="kpi-card">
                            <div class="kpi-card__icon"><i class="fas fa-heartbeat"></i></div>
                            <div class="kpi-card__content">
                                <div class="kpi-card__value">${data.kpis.systemHealth?.toFixed(1) || 'N/A'}%</div>
                                <div class="kpi-card__label">System Health</div>
                            </div>
                            <div class="kpi-card__trend ${data.kpis.healthTrend || 'stable'}">
                                <i class="fas fa-${data.kpis.healthTrend === 'improving' ? 'arrow-up' : data.kpis.healthTrend === 'degrading' ? 'arrow-down' : 'minus'}"></i>
                            </div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card__icon"><i class="fas fa-clock"></i></div>
                            <div class="kpi-card__content">
                                <div class="kpi-card__value">${data.kpis.mtbf ? data.kpis.mtbf.toFixed(1) + 'h' : 'N/A'}</div>
                                <div class="kpi-card__label">MTBF</div>
                            </div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card__icon"><i class="fas fa-tools"></i></div>
                            <div class="kpi-card__content">
                                <div class="kpi-card__value">${data.kpis.mttr !== null ? data.kpis.mttr.toFixed(0) + 'min' : 'N/A'}</div>
                                <div class="kpi-card__label">MTTR</div>
                            </div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card__icon"><i class="fas fa-check-circle"></i></div>
                            <div class="kpi-card__content">
                                <div class="kpi-card__value">${data.kpis.availability?.toFixed(1) || 'N/A'}%</div>
                                <div class="kpi-card__label">Availability</div>
                            </div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card__icon"><i class="fas fa-bell"></i></div>
                            <div class="kpi-card__content">
                                <div class="kpi-card__value">${data.kpis.alarmRate?.toFixed(2) || '0'}/h</div>
                                <div class="kpi-card__label">Alarm Rate</div>
                            </div>
                        </div>

                        <div class="kpi-card">
                            <div class="kpi-card__icon"><i class="fas fa-exclamation-triangle"></i></div>
                            <div class="kpi-card__content">
                                <div class="kpi-card__value">${data.kpis.maintenanceUrgency}/10</div>
                                <div class="kpi-card__label">Urgency</div>
                            </div>
                        </div>
                    </div>

                    <!-- System Breakdown -->
                    <div class="analytics-section">
                        <h3><i class="fas fa-sitemap"></i> System Reliability</h3>
                        <div class="system-breakdown">
                            ${data.systemBreakdown.map(system => `
                                <div class="system-item">
                                    <div class="system-item__header">
                                        <span class="system-item__name">${system.name}</span>
                                        <span class="system-item__value">${system.reliability}%</span>
                                    </div>
                                    <div class="system-item__bar">
                                        <div class="system-item__fill system-item__fill--${system.status}" 
                                             style="width: ${system.reliability}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Recommendations -->
                    ${data.recommendations.length > 0 ? `
                        <div class="analytics-section">
                            <h3><i class="fas fa-lightbulb"></i> Recommendations</h3>
                            <div class="analytics-recommendations">
                                ${data.recommendations.map(rec => `
                                    <div class="recommendation-card recommendation-card--${rec.priority.toLowerCase()}">
                                        <div class="recommendation-card__header">
                                            <span class="recommendation-card__priority">${rec.priority}</span>
                                            <span class="recommendation-card__category">${rec.category}</span>
                                        </div>
                                        <div class="recommendation-card__message">${rec.message}</div>
                                        <div class="recommendation-card__action">
                                            <i class="fas fa-wrench"></i> ${rec.action}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Overview Stats -->
                    <div class="analytics-section">
                        <h3><i class="fas fa-info-circle"></i> Overview</h3>
                        <div class="analytics-stats">
                            <div class="stat-item">
                                <span class="stat-item__label">Total Flight Time</span>
                                <span class="stat-item__value">${data.overview.totalFlightTime}h</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-item__label">Total Alarms</span>
                                <span class="stat-item__value">${data.overview.totalAlarms}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-item__label">Data Period</span>
                                <span class="stat-item__value">${data.overview.period}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-item__label">Data Points</span>
                                <span class="stat-item__value">${data.overview.dataPoints}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="analytics-modal__footer">
                    <button class="btn btn--ghost" id="btn-reset-analytics">
                        <i class="fas fa-trash"></i> Reset Data
                    </button>
                    <button class="btn btn--ghost" id="btn-export-analytics">
                        <i class="fas fa-download"></i> Export
                    </button>
                    <button class="btn btn--primary analytics-modal__close">
                        <i class="fas fa-check"></i> Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachEventListeners(modal);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners(modal) {
        // Close
        modal.querySelectorAll('.analytics-modal__close').forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        modal.querySelector('.analytics-modal__backdrop').addEventListener('click', () => this.close());

        // Reset
        modal.querySelector('#btn-reset-analytics')?.addEventListener('click', () => {
            const confirmMsg = window.i18n ? window.i18n.t('msg.confirm_analytics_reset') : 'Reset all analytics data?';
            if (confirm(confirmMsg)) {
                this.history = [];
                this.saveHistory();
                this.close();
                const title = window.i18n ? window.i18n.t('btn.analytics') : 'Analytics';
                const successMsg = window.i18n ? window.i18n.t('msg.analytics_reset_success') : 'Analytics data reset successfully';
                window.showSuccess(title, successMsg);
            }
        });

        // Export
        modal.querySelector('#btn-export-analytics')?.addEventListener('click', () => {
            this.exportAnalytics();
        });

        // ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    /**
     * Export analytics data
     */
    exportAnalytics() {
        const data = {
            exportDate: new Date().toISOString(),
            kpis: this.kpis,
            history: this.history,
            overview: this.getOverview()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Close modal
     */
    close() {
        const modal = document.getElementById('analytics-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Singleton instance
export const analytics = new AnalyticsDashboard();

// Global exposure
window.analytics = analytics;

export default analytics;
