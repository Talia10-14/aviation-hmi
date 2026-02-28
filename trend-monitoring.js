/**
 * Trend Monitoring System
 * Predictive maintenance through parameter trend analysis
 * Compliant with MSG-3 and ATA iSpec 2200
 */

export class TrendMonitoringSystem {
    constructor() {
        this.parameters = {};
        this.alerts = [];
        this.flights = [];
        this.currentFlightId = null;
        this.recording = false;
        this.recordingInterval = null;
        
        this.initializeParameters();
        this.loadData();
    }

    /**
     * Initialize monitored parameters
     */
    initializeParameters() {
        this.parameterDefinitions = {
            // Engine parameters
            'ENG1_N1': {
                name: 'Engine 1 N1',
                unit: '%',
                category: 'ENGINES',
                normal: { min: 20, max: 100 },
                thresholds: {
                    degradation: { trend: -2, period: 10 },  // -2% per 10 flights
                    warning: { value: 102 }
                }
            },
            'ENG1_EGT': {
                name: 'Engine 1 EGT',
                unit: '°C',
                category: 'ENGINES',
                normal: { min: 400, max: 850 },
                thresholds: {
                    degradation: { trend: 5, period: 10 },  // +5°C per 10 flights
                    warning: { value: 900 }
                }
            },
            'ENG1_OIL_PRESS': {
                name: 'Engine 1 Oil Pressure',
                unit: 'PSI',
                category: 'ENGINES',
                normal: { min: 35, max: 90 },
                thresholds: {
                    degradation: { trend: -3, period: 10 },  // -3 PSI per 10 flights
                    warning: { value: 25 }
                }
            },
            'ENG1_VIB': {
                name: 'Engine 1 Vibration',
                unit: 'mils',
                category: 'ENGINES',
                normal: { min: 0, max: 2.5 },
                thresholds: {
                    degradation: { trend: 0.3, period: 10 },  // +0.3 mils per 10 flights
                    warning: { value: 4.0 }
                }
            },
            'ENG2_N1': {
                name: 'Engine 2 N1',
                unit: '%',
                category: 'ENGINES',
                normal: { min: 20, max: 100 },
                thresholds: {
                    degradation: { trend: -2, period: 10 },
                    warning: { value: 102 }
                }
            },
            'ENG2_EGT': {
                name: 'Engine 2 EGT',
                unit: '°C',
                category: 'ENGINES',
                normal: { min: 400, max: 850 },
                thresholds: {
                    degradation: { trend: 5, period: 10 },
                    warning: { value: 900 }
                }
            },
            'ENG2_OIL_PRESS': {
                name: 'Engine 2 Oil Pressure',
                unit: 'PSI',
                category: 'ENGINES',
                normal: { min: 35, max: 90 },
                thresholds: {
                    degradation: { trend: -3, period: 10 },
                    warning: { value: 25 }
                }
            },
            'ENG2_VIB': {
                name: 'Engine 2 Vibration',
                unit: 'mils',
                category: 'ENGINES',
                normal: { min: 0, max: 2.5 },
                thresholds: {
                    degradation: { trend: 0.3, period: 10 },
                    warning: { value: 4.0 }
                }
            },
            
            // Hydraulic parameters
            'HYD_GREEN_PRESS': {
                name: 'Green Hydraulic Pressure',
                unit: 'PSI',
                category: 'HYDRAULICS',
                normal: { min: 2800, max: 3100 },
                thresholds: {
                    degradation: { trend: -100, period: 20 },
                    warning: { value: 2500 }
                }
            },
            'HYD_BLUE_PRESS': {
                name: 'Blue Hydraulic Pressure',
                unit: 'PSI',
                category: 'HYDRAULICS',
                normal: { min: 2800, max: 3100 },
                thresholds: {
                    degradation: { trend: -100, period: 20 },
                    warning: { value: 2500 }
                }
            },
            'HYD_YELLOW_PRESS': {
                name: 'Yellow Hydraulic Pressure',
                unit: 'PSI',
                category: 'HYDRAULICS',
                normal: { min: 2800, max: 3100 },
                thresholds: {
                    degradation: { trend: -100, period: 20 },
                    warning: { value: 2500 }
                }
            },
            
            // Electrical parameters
            'ELEC_GEN1_LOAD': {
                name: 'Generator 1 Load',
                unit: '%',
                category: 'ELECTRICAL',
                normal: { min: 30, max: 75 },
                thresholds: {
                    degradation: { trend: 5, period: 20 },
                    warning: { value: 95 }
                }
            },
            'ELEC_GEN2_LOAD': {
                name: 'Generator 2 Load',
                unit: '%',
                category: 'ELECTRICAL',
                normal: { min: 30, max: 75 },
                thresholds: {
                    degradation: { trend: 5, period: 20 },
                    warning: { value: 95 }
                }
            },
            'ELEC_BAT_TEMP': {
                name: 'Battery Temperature',
                unit: '°C',
                category: 'ELECTRICAL',
                normal: { min: 10, max: 35 },
                thresholds: {
                    degradation: { trend: 3, period: 20 },
                    warning: { value: 50 }
                }
            }
        };

        // Initialize data structures
        Object.keys(this.parameterDefinitions).forEach(key => {
            this.parameters[key] = {
                definition: this.parameterDefinitions[key],
                history: [],
                currentValue: null,
                trend: null,
                status: 'NORMAL'
            };
        });
    }

    /**
     * Start recording a new flight
     * @param {object} flightInfo - Flight information
     */
    startFlight(flightInfo = {}) {
        if (this.recording) {
            throw new Error('A flight is already being recorded');
        }

        this.currentFlightId = `FL-${Date.now()}`;
        
        const flight = {
            id: this.currentFlightId,
            startTime: new Date().toISOString(),
            ...flightInfo,
            data: {}
        };

        this.flights.push(flight);
        this.recording = true;

        // Start periodic recording (every 10 seconds)
        this.recordingInterval = setInterval(() => {
            this.recordSnapshot();
        }, 10000);

        console.log(`[TREND] Flight recording started: ${this.currentFlightId}`);
        
        return this.currentFlightId;
    }

    /**
     * Stop recording current flight
     */
    stopFlight() {
        if (!this.recording) {
            return;
        }

        const flight = this.flights.find(f => f.id === this.currentFlightId);
        if (flight) {
            flight.endTime = new Date().toISOString();
            flight.duration = Date.now() - new Date(flight.startTime).getTime();
        }

        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
            this.recordingInterval = null;
        }

        this.recording = false;
        this.currentFlightId = null;

        // Analyze trends after flight
        this.analyzeTrends();
        
        // Save data
        this.saveData();

        console.log(`[TREND] Flight recording stopped`);
    }

    /**
     * Record a snapshot of all parameters
     */
    recordSnapshot() {
        if (!this.recording || !window.appState) return;

        const flight = this.flights.find(f => f.id === this.currentFlightId);
        if (!flight) return;

        const timestamp = new Date().toISOString();
        const data = window.appState.sensorData;

        // Record engine parameters
        if (data.eng1) {
            this.recordParameter('ENG1_N1', data.eng1.n1, timestamp);
            this.recordParameter('ENG1_EGT', data.eng1.egt, timestamp);
            this.recordParameter('ENG1_OIL_PRESS', data.eng1.oilPress, timestamp);
            this.recordParameter('ENG1_VIB', data.eng1.vibN1, timestamp);
        }

        if (data.eng2) {
            this.recordParameter('ENG2_N1', data.eng2.n1, timestamp);
            this.recordParameter('ENG2_EGT', data.eng2.egt, timestamp);
            this.recordParameter('ENG2_OIL_PRESS', data.eng2.oilPress, timestamp);
            this.recordParameter('ENG2_VIB', data.eng2.vibN1, timestamp);
        }

        // Record hydraulic parameters
        if (data.hydraulics) {
            this.recordParameter('HYD_GREEN_PRESS', data.hydraulics.greenPress, timestamp);
            this.recordParameter('HYD_BLUE_PRESS', data.hydraulics.bluePress, timestamp);
            this.recordParameter('HYD_YELLOW_PRESS', data.hydraulics.yellowPress, timestamp);
        }

        // Record electrical parameters
        if (data.electrical) {
            this.recordParameter('ELEC_GEN1_LOAD', data.electrical.gen1Load, timestamp);
            this.recordParameter('ELEC_GEN2_LOAD', data.electrical.gen2Load, timestamp);
            this.recordParameter('ELEC_BAT_TEMP', data.electrical.batTemp, timestamp);
        }
    }

    /**
     * Record a single parameter value
     */
    recordParameter(paramKey, value, timestamp) {
        if (!this.parameters[paramKey]) return;

        const param = this.parameters[paramKey];
        
        param.currentValue = value;
        
        param.history.push({
            value,
            timestamp,
            flightId: this.currentFlightId
        });

        // Keep only last 1000 data points per parameter
        if (param.history.length > 1000) {
            param.history.shift();
        }
    }

    /**
     * Analyze trends for all parameters
     */
    analyzeTrends() {
        Object.entries(this.parameters).forEach(([key, param]) => {
            if (param.history.length < 2) return;

            // Get flight averages (last 20 flights)
            const flightAverages = this.getFlightAverages(key, 20);
            
            if (flightAverages.length < 2) return;

            // Calculate linear regression
            const trend = this.calculateTrend(flightAverages);
            param.trend = trend;

            // Check for degradation
            this.checkDegradation(key, param, trend);
        });
    }

    /**
     * Get average values per flight
     */
    getFlightAverages(paramKey, flightCount = 20) {
        const param = this.parameters[paramKey];
        const flightIds = [...new Set(param.history.map(h => h.flightId))];
        const recentFlightIds = flightIds.slice(-flightCount);

        return recentFlightIds.map(flightId => {
            const flightData = param.history.filter(h => h.flightId === flightId);
            const avg = flightData.reduce((sum, d) => sum + d.value, 0) / flightData.length;
            
            return {
                flightId,
                value: avg,
                timestamp: flightData[0].timestamp
            };
        });
    }

    /**
     * Calculate trend using linear regression
     */
    calculateTrend(data) {
        const n = data.length;
        if (n < 2) return null;

        const x = Array.from({ length: n }, (_, i) => i);
        const y = data.map(d => d.value);

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return {
            slope,
            intercept,
            dataPoints: n,
            prediction: slope * n + intercept  // Predict next value
        };
    }

    /**
     * Check for parameter degradation
     */
    checkDegradation(paramKey, param, trend) {
        if (!trend || !param.definition.thresholds) return;

        const { degradation } = param.definition.thresholds;
        if (!degradation) return;

        // Calculate trend over threshold period
        const trendOverPeriod = trend.slope * degradation.period;

        // Check if trend exceeds degradation threshold
        if (Math.abs(trendOverPeriod) >= Math.abs(degradation.trend)) {
            const direction = trendOverPeriod > 0 ? 'increasing' : 'decreasing';
            
            this.addAlert({
                type: 'DEGRADATION',
                severity: 'CAUTION',
                parameter: paramKey,
                parameterName: param.definition.name,
                message: `${param.definition.name} ${direction} abnormally`,
                trend: trendOverPeriod.toFixed(2),
                unit: param.definition.unit,
                recommendation: this.getRecommendation(paramKey, direction)
            });

            param.status = 'DEGRADING';
        } else {
            param.status = 'NORMAL';
        }
    }

    /**
     * Add a trend alert
     */
    addAlert(alert) {
        // Check if alert already exists
        const exists = this.alerts.some(a => 
            a.parameter === alert.parameter && 
            a.type === alert.type &&
            !a.acknowledged
        );

        if (!exists) {
            this.alerts.unshift({
                ...alert,
                id: `ALERT-${Date.now()}`,
                timestamp: new Date().toISOString(),
                acknowledged: false
            });

            console.warn(`[TREND] Alert generated:`, alert);

            // Limit alerts
            if (this.alerts.length > 100) {
                this.alerts.length = 100;
            }

            this.saveData();
        }
    }

    /**
     * Get maintenance recommendation
     */
    getRecommendation(paramKey, direction) {
        const recommendations = {
            'ENG1_EGT': 'Inspect engine 1 for combustion efficiency. Check fuel nozzles and turbine clearances.',
            'ENG2_EGT': 'Inspect engine 2 for combustion efficiency. Check fuel nozzles and turbine clearances.',
            'ENG1_OIL_PRESS': 'Check engine 1 oil level and quality. Inspect oil pump and filters.',
            'ENG2_OIL_PRESS': 'Check engine 2 oil level and quality. Inspect oil pump and filters.',
            'ENG1_VIB': 'Engine 1 vibration increasing. Check fan balance and mounting.',
            'ENG2_VIB': 'Engine 2 vibration increasing. Check fan balance and mounting.',
            'HYD_GREEN_PRESS': 'Green hydraulic system degrading. Check pump performance and leaks.',
            'HYD_BLUE_PRESS': 'Blue hydraulic system degrading. Check pump performance and leaks.',
            'HYD_YELLOW_PRESS': 'Yellow hydraulic system degrading. Check pump performance and leaks.',
            'ELEC_BAT_TEMP': 'Battery temperature rising. Check charging system and ventilation.',
            'ELEC_GEN1_LOAD': 'Generator 1 load increasing. Check electrical consumers and bus ties.',
            'ELEC_GEN2_LOAD': 'Generator 2 load increasing. Check electrical consumers and bus ties.'
        };

        return recommendations[paramKey] || 'Schedule inspection during next maintenance window.';
    }

    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = new Date().toISOString();
            this.saveData();
        }
    }

    /**
     * Get active alerts
     */
    getActiveAlerts() {
        return this.alerts.filter(a => !a.acknowledged);
    }

    /**
     * Get parameter trend data for charting
     */
    getParameterTrendData(paramKey, flightCount = 20) {
        const param = this.parameters[paramKey];
        if (!param) return null;

        const flightAverages = this.getFlightAverages(paramKey, flightCount);

        return {
            parameter: param.definition.name,
            unit: param.definition.unit,
            category: param.definition.category,
            status: param.status,
            currentValue: param.currentValue,
            trend: param.trend,
            data: flightAverages,
            thresholds: param.definition.thresholds
        };
    }

    /**
     * Get all parameters summary
     */
    getParametersSummary() {
        return Object.entries(this.parameters).map(([key, param]) => ({
            key,
            name: param.definition.name,
            unit: param.definition.unit,
            category: param.definition.category,
            currentValue: param.currentValue,
            status: param.status,
            hasTrend: param.trend !== null,
            dataPoints: param.history.length
        }));
    }

    /**
     * Get trend monitoring dashboard data
     */
    getDashboardData() {
        const stats = {
            totalParameters: Object.keys(this.parameters).length,
            normalParameters: 0,
            degradingParameters: 0,
            activeAlerts: this.getActiveAlerts().length,
            totalFlights: this.flights.length,
            recordingActive: this.recording
        };

        Object.values(this.parameters).forEach(param => {
            if (param.status === 'NORMAL') stats.normalParameters++;
            else if (param.status === 'DEGRADING') stats.degradingParameters++;
        });

        const byCategory = {};
        Object.values(this.parameters).forEach(param => {
            const cat = param.definition.category;
            if (!byCategory[cat]) {
                byCategory[cat] = { normal: 0, degrading: 0 };
            }
            if (param.status === 'NORMAL') byCategory[cat].normal++;
            else if (param.status === 'DEGRADING') byCategory[cat].degrading++;
        });

        return {
            stats,
            byCategory,
            recentAlerts: this.alerts.slice(0, 5),
            recentFlights: this.flights.slice(-5)
        };
    }

    /**
     * Generate predictive maintenance report
     */
    generateMaintenanceReport() {
        const degradingParams = Object.entries(this.parameters)
            .filter(([_, param]) => param.status === 'DEGRADING')
            .map(([key, param]) => ({
                parameter: param.definition.name,
                category: param.definition.category,
                currentValue: param.currentValue,
                trend: param.trend,
                recommendation: this.getRecommendation(key, param.trend?.slope > 0 ? 'increasing' : 'decreasing')
            }));

        return {
            reportDate: new Date().toISOString(),
            flightsSampled: this.flights.length,
            totalParameters: Object.keys(this.parameters).length,
            degradingParameters: degradingParams.length,
            activeAlerts: this.getActiveAlerts().length,
            degradingParams,
            alerts: this.getActiveAlerts(),
            recommendations: degradingParams.map(p => ({
                priority: 'MEDIUM',
                parameter: p.parameter,
                action: p.recommendation
            }))
        };
    }

    /**
     * Export trend data as CSV
     */
    exportTrendDataCSV(paramKey) {
        const param = this.parameters[paramKey];
        if (!param) return '';

        let csv = `Timestamp,Flight ID,Value\n`;

        param.history.forEach(entry => {
            csv += `"${entry.timestamp}","${entry.flightId}","${entry.value}"\n`;
        });

        return csv;
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        try {
            // Save only essential data (not full history)
            const dataToSave = {
                alerts: this.alerts,
                flights: this.flights.map(f => ({
                    id: f.id,
                    startTime: f.startTime,
                    endTime: f.endTime,
                    duration: f.duration
                })),
                parameterStatus: Object.entries(this.parameters).reduce((acc, [key, param]) => {
                    acc[key] = {
                        status: param.status,
                        trend: param.trend,
                        currentValue: param.currentValue
                    };
                    return acc;
                }, {})
            };

            localStorage.setItem('trendMonitoring', JSON.stringify(dataToSave));
        } catch (e) {
            console.warn('Could not save trend monitoring data');
        }
    }

    /**
     * Load data from localStorage
     */
    loadData() {
        try {
            const saved = localStorage.getItem('trendMonitoring');
            if (saved) {
                const data = JSON.parse(saved);
                
                if (data.alerts) this.alerts = data.alerts;
                if (data.flights) this.flights = data.flights;
                
                if (data.parameterStatus) {
                    Object.entries(data.parameterStatus).forEach(([key, status]) => {
                        if (this.parameters[key]) {
                            this.parameters[key].status = status.status;
                            this.parameters[key].trend = status.trend;
                            this.parameters[key].currentValue = status.currentValue;
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('Could not load trend monitoring data');
        }
    }

    /**
     * Clear all data
     */
    clearData() {
        this.alerts = [];
        this.flights = [];
        Object.values(this.parameters).forEach(param => {
            param.history = [];
            param.currentValue = null;
            param.trend = null;
            param.status = 'NORMAL';
        });
        this.saveData();
    }
}

// Singleton instance
export const trendMonitoring = new TrendMonitoringSystem();

export default trendMonitoring;
