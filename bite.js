/**
 * BITE (Built-In Test Equipment) System
 * Compliant with ARP4754A and DO-178C
 * Self-tests and diagnostics for aircraft systems
 */

export class BITESystem {
    constructor() {
        this.tests = {};
        this.testResults = [];
        this.currentTest = null;
        this.testInProgress = false;
        
        this.initializeTests();
    }

    /**
     * Initialize all BITE tests
     */
    initializeTests() {
        this.tests = {
            // Flight Control Computers
            'ELAC-1': {
                name: 'Elevator Aileron Computer 1',
                category: 'FLIGHT_CONTROLS',
                tests: [
                    { id: 'RAM', name: 'RAM Test', duration: 2000 },
                    { id: 'ROM', name: 'ROM Checksum', duration: 3000 },
                    { id: 'IO', name: 'I/O Test', duration: 2000 },
                    { id: 'SENSORS', name: 'Sensor Validity', duration: 4000 },
                    { id: 'CONTROL_LAW', name: 'Control Law Integrity', duration: 5000 }
                ],
                criticality: 'high'
            },
            'ELAC-2': {
                name: 'Elevator Aileron Computer 2',
                category: 'FLIGHT_CONTROLS',
                tests: [
                    { id: 'RAM', name: 'RAM Test', duration: 2000 },
                    { id: 'ROM', name: 'ROM Checksum', duration: 3000 },
                    { id: 'IO', name: 'I/O Test', duration: 2000 },
                    { id: 'SENSORS', name: 'Sensor Validity', duration: 4000 },
                    { id: 'CONTROL_LAW', name: 'Control Law Integrity', duration: 5000 }
                ],
                criticality: 'high'
            },
            'SEC-1': {
                name: 'Spoiler Elevator Computer 1',
                category: 'FLIGHT_CONTROLS',
                tests: [
                    { id: 'RAM', name: 'RAM Test', duration: 2000 },
                    { id: 'ROM', name: 'ROM Checksum', duration: 3000 },
                    { id: 'IO', name: 'I/O Test', duration: 2000 },
                    { id: 'ACTUATORS', name: 'Actuator Response', duration: 4000 }
                ],
                criticality: 'medium'
            },
            'FAC-1': {
                name: 'Flight Augmentation Computer 1',
                category: 'FLIGHT_CONTROLS',
                tests: [
                    { id: 'RAM', name: 'RAM Test', duration: 2000 },
                    { id: 'ROM', name: 'ROM Checksum', duration: 3000 },
                    { id: 'ANEMOMETRY', name: 'Anemometry Inputs', duration: 3000 },
                    { id: 'YAW_DAMPER', name: 'Yaw Damper Test', duration: 4000 }
                ],
                criticality: 'medium'
            },
            
            // Engine Control
            'FADEC-1': {
                name: 'Full Authority Digital Engine Control 1',
                category: 'ENGINES',
                tests: [
                    { id: 'RAM', name: 'RAM Test', duration: 2000 },
                    { id: 'ROM', name: 'ROM Checksum', duration: 3000 },
                    { id: 'SENSORS', name: 'Engine Sensors', duration: 4000 },
                    { id: 'FUEL_METERING', name: 'Fuel Metering', duration: 5000 },
                    { id: 'IGNITION', name: 'Ignition System', duration: 3000 },
                    { id: 'ACTUATORS', name: 'Fuel/Air Actuators', duration: 4000 }
                ],
                criticality: 'critical'
            },
            'FADEC-2': {
                name: 'Full Authority Digital Engine Control 2',
                category: 'ENGINES',
                tests: [
                    { id: 'RAM', name: 'RAM Test', duration: 2000 },
                    { id: 'ROM', name: 'ROM Checksum', duration: 3000 },
                    { id: 'SENSORS', name: 'Engine Sensors', duration: 4000 },
                    { id: 'FUEL_METERING', name: 'Fuel Metering', duration: 5000 },
                    { id: 'IGNITION', name: 'Ignition System', duration: 3000 },
                    { id: 'ACTUATORS', name: 'Fuel/Air Actuators', duration: 4000 }
                ],
                criticality: 'critical'
            },
            
            // Hydraulic System
            'HYD-GREEN': {
                name: 'Green Hydraulic System',
                category: 'HYDRAULICS',
                tests: [
                    { id: 'PUMP', name: 'Pump Test', duration: 5000 },
                    { id: 'PRESSURE', name: 'Pressure Test', duration: 4000 },
                    { id: 'RESERVOIR', name: 'Reservoir Level', duration: 2000 },
                    { id: 'LEAK', name: 'Leak Detection', duration: 6000 }
                ],
                criticality: 'high'
            },
            'HYD-BLUE': {
                name: 'Blue Hydraulic System',
                category: 'HYDRAULICS',
                tests: [
                    { id: 'PUMP', name: 'Pump Test', duration: 5000 },
                    { id: 'PRESSURE', name: 'Pressure Test', duration: 4000 },
                    { id: 'RESERVOIR', name: 'Reservoir Level', duration: 2000 },
                    { id: 'LEAK', name: 'Leak Detection', duration: 6000 }
                ],
                criticality: 'high'
            },
            'HYD-YELLOW': {
                name: 'Yellow Hydraulic System',
                category: 'HYDRAULICS',
                tests: [
                    { id: 'PUMP', name: 'Pump Test', duration: 5000 },
                    { id: 'PRESSURE', name: 'Pressure Test', duration: 4000 },
                    { id: 'RESERVOIR', name: 'Reservoir Level', duration: 2000 },
                    { id: 'LEAK', name: 'Leak Detection', duration: 6000 }
                ],
                criticality: 'high'
            },
            
            // Electrical System
            'GEN-1': {
                name: 'Generator 1',
                category: 'ELECTRICAL',
                tests: [
                    { id: 'VOLTAGE', name: 'Voltage Test', duration: 3000 },
                    { id: 'FREQUENCY', name: 'Frequency Test', duration: 3000 },
                    { id: 'LOAD', name: 'Load Test', duration: 4000 },
                    { id: 'GCU', name: 'GCU (Generator Control Unit)', duration: 5000 }
                ],
                criticality: 'high'
            },
            'GEN-2': {
                name: 'Generator 2',
                category: 'ELECTRICAL',
                tests: [
                    { id: 'VOLTAGE', name: 'Voltage Test', duration: 3000 },
                    { id: 'FREQUENCY', name: 'Frequency Test', duration: 3000 },
                    { id: 'LOAD', name: 'Load Test', duration: 4000 },
                    { id: 'GCU', name: 'GCU (Generator Control Unit)', duration: 5000 }
                ],
                criticality: 'high'
            },
            'BATTERY': {
                name: 'Main Battery',
                category: 'ELECTRICAL',
                tests: [
                    { id: 'VOLTAGE', name: 'Voltage Test', duration: 2000 },
                    { id: 'CAPACITY', name: 'Capacity Test', duration: 8000 },
                    { id: 'TEMPERATURE', name: 'Temperature Check', duration: 2000 },
                    { id: 'CHARGE', name: 'Charging System', duration: 5000 }
                ],
                criticality: 'medium'
            },
            
            // Avionics
            'ADR-1': {
                name: 'Air Data Reference 1',
                category: 'AVIONICS',
                tests: [
                    { id: 'PITOT', name: 'Pitot Sensors', duration: 3000 },
                    { id: 'STATIC', name: 'Static Ports', duration: 3000 },
                    { id: 'AOA', name: 'Angle of Attack', duration: 3000 },
                    { id: 'COMPUTATION', name: 'Data Computation', duration: 4000 }
                ],
                criticality: 'high'
            },
            'IR-1': {
                name: 'Inertial Reference 1',
                category: 'AVIONICS',
                tests: [
                    { id: 'GYRO', name: 'Gyroscope Test', duration: 10000 },
                    { id: 'ACCEL', name: 'Accelerometer Test', duration: 6000 },
                    { id: 'ALIGNMENT', name: 'Alignment Check', duration: 15000 },
                    { id: 'GPS', name: 'GPS Integration', duration: 5000 }
                ],
                criticality: 'critical'
            }
        };
    }

    /**
     * Run a complete system test
     * @param {string} systemId - System identifier
     * @returns {Promise<object>} Test result
     */
    async runSystemTest(systemId) {
        const system = this.tests[systemId];
        
        if (!system) {
            throw new Error(`Unknown system: ${systemId}`);
        }

        if (this.testInProgress) {
            throw new Error('A test is already in progress');
        }

        this.testInProgress = true;
        this.currentTest = systemId;

        const testResult = {
            systemId,
            systemName: system.name,
            category: system.category,
            criticality: system.criticality,
            startTime: new Date().toISOString(),
            tests: [],
            overallStatus: 'PASS',
            duration: 0
        };

        const startTimestamp = Date.now();

        try {
            // Run all tests sequentially
            for (const test of system.tests) {
                const result = await this.runIndividualTest(systemId, test);
                testResult.tests.push(result);

                // If any test fails, mark overall as FAIL
                if (result.status !== 'PASS') {
                    testResult.overallStatus = 'FAIL';
                }
            }

            testResult.endTime = new Date().toISOString();
            testResult.duration = Date.now() - startTimestamp;

            // Store result
            this.testResults.unshift(testResult);
            if (this.testResults.length > 100) {
                this.testResults.pop();
            }

            // Save to localStorage
            this.saveResults();

            return testResult;

        } finally {
            this.testInProgress = false;
            this.currentTest = null;
        }
    }

    /**
     * Run an individual test
     * @param {string} systemId - System identifier
     * @param {object} test - Test definition
     * @returns {Promise<object>} Individual test result
     */
    async runIndividualTest(systemId, test) {
        const startTime = Date.now();

        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, test.duration));

        // Simulate test result (95% pass rate, with some randomness)
        const passed = Math.random() > 0.05;
        const status = passed ? 'PASS' : 'FAIL';

        const result = {
            testId: test.id,
            testName: test.name,
            status,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString()
        };

        // Add error details for failed tests
        if (!passed) {
            result.errorCode = this.generateErrorCode(systemId, test.id);
            result.errorMessage = this.generateErrorMessage(test.id);
        }

        return result;
    }

    /**
     * Run all system tests
     * @returns {Promise<Array>} Array of test results
     */
    async runAllTests() {
        const results = [];
        
        for (const systemId of Object.keys(this.tests)) {
            try {
                const result = await this.runSystemTest(systemId);
                results.push(result);
            } catch (error) {
                console.error(`Test failed for ${systemId}:`, error);
            }
        }

        return results;
    }

    /**
     * Run tests by category
     * @param {string} category - Category name
     * @returns {Promise<Array>} Array of test results
     */
    async runCategoryTests(category) {
        const results = [];
        
        for (const [systemId, system] of Object.entries(this.tests)) {
            if (system.category === category) {
                try {
                    const result = await this.runSystemTest(systemId);
                    results.push(result);
                } catch (error) {
                    console.error(`Test failed for ${systemId}:`, error);
                }
            }
        }

        return results;
    }

    /**
     * Generate error code for failed test
     */
    generateErrorCode(systemId, testId) {
        const codes = {
            'RAM': ['E-RAM-001', 'E-RAM-002', 'E-RAM-003'],
            'ROM': ['E-ROM-001', 'E-ROM-002'],
            'IO': ['E-IO-001', 'E-IO-002', 'E-IO-003'],
            'SENSORS': ['E-SNS-001', 'E-SNS-002', 'E-SNS-003'],
            'ACTUATORS': ['E-ACT-001', 'E-ACT-002'],
            'PUMP': ['E-PMP-001', 'E-PMP-002'],
            'PRESSURE': ['E-PRS-001', 'E-PRS-002'],
            'VOLTAGE': ['E-VOL-001', 'E-VOL-002'],
            'GYRO': ['E-GYR-001', 'E-GYR-002']
        };

        const testCodes = codes[testId] || ['E-GEN-001'];
        return testCodes[Math.floor(Math.random() * testCodes.length)];
    }

    /**
     * Generate error message for failed test
     */
    generateErrorMessage(testId) {
        const messages = {
            'RAM': 'Memory cell failure detected',
            'ROM': 'Checksum mismatch',
            'IO': 'I/O pin not responding',
            'SENSORS': 'Sensor out of range',
            'ACTUATORS': 'Actuator response delayed',
            'PUMP': 'Pump pressure below threshold',
            'PRESSURE': 'Pressure transducer error',
            'VOLTAGE': 'Voltage outside tolerance',
            'GYRO': 'Gyroscope drift excessive'
        };

        return messages[testId] || 'Unknown error';
    }

    /**
     * Get test results by system
     */
    getSystemResults(systemId) {
        return this.testResults.filter(r => r.systemId === systemId);
    }

    /**
     * Get recent test results
     */
    getRecentResults(limit = 10) {
        return this.testResults.slice(0, limit);
    }

    /**
     * Get failed tests
     */
    getFailedTests() {
        return this.testResults.filter(r => r.overallStatus === 'FAIL');
    }

    /**
     * Get test statistics
     */
    getStatistics() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.overallStatus === 'PASS').length;
        const failed = total - passed;

        const byCategory = {};
        this.testResults.forEach(result => {
            if (!byCategory[result.category]) {
                byCategory[result.category] = { total: 0, passed: 0, failed: 0 };
            }
            byCategory[result.category].total++;
            if (result.overallStatus === 'PASS') {
                byCategory[result.category].passed++;
            } else {
                byCategory[result.category].failed++;
            }
        });

        return {
            total,
            passed,
            failed,
            passRate: total > 0 ? (passed / total * 100).toFixed(1) : 0,
            byCategory
        };
    }

    /**
     * Generate maintenance report
     */
    generateMaintenanceReport() {
        const failedTests = this.getFailedTests();
        const stats = this.getStatistics();

        return {
            reportDate: new Date().toISOString(),
            summary: {
                totalTests: stats.total,
                passRate: stats.passRate,
                failedSystems: failedTests.length
            },
            failedTests: failedTests.map(test => ({
                system: test.systemName,
                category: test.category,
                criticality: test.criticality,
                timestamp: test.startTime,
                failures: test.tests
                    .filter(t => t.status === 'FAIL')
                    .map(t => ({
                        test: t.testName,
                        errorCode: t.errorCode,
                        errorMessage: t.errorMessage
                    }))
            })),
            recommendations: this.generateRecommendations(failedTests)
        };
    }

    /**
     * Generate maintenance recommendations
     */
    generateRecommendations(failedTests) {
        const recommendations = [];

        failedTests.forEach(test => {
            if (test.criticality === 'critical') {
                recommendations.push({
                    priority: 'HIGH',
                    system: test.systemName,
                    action: `Immediate inspection required for ${test.systemName}`,
                    category: 'MEL A - Rectify immediately'
                });
            } else if (test.criticality === 'high') {
                recommendations.push({
                    priority: 'MEDIUM',
                    system: test.systemName,
                    action: `Schedule maintenance for ${test.systemName}`,
                    category: 'MEL B - Rectify within 3 days'
                });
            }
        });

        return recommendations;
    }

    /**
     * Export results as CSV
     */
    exportAsCSV() {
        let csv = 'System,Category,Criticality,Test,Status,Error Code,Error Message,Timestamp,Duration\n';

        this.testResults.forEach(result => {
            result.tests.forEach(test => {
                csv += `"${result.systemName}","${result.category}","${result.criticality}",`;
                csv += `"${test.testName}","${test.status}",`;
                csv += `"${test.errorCode || ''}","${test.errorMessage || ''}",`;
                csv += `"${test.timestamp}","${test.duration}"\n`;
            });
        });

        return csv;
    }

    /**
     * Save results to localStorage
     */
    saveResults() {
        try {
            localStorage.setItem('biteResults', JSON.stringify(this.testResults));
        } catch (e) {
            console.warn('Could not save BITE results');
        }
    }

    /**
     * Load results from localStorage
     */
    loadResults() {
        try {
            const saved = localStorage.getItem('biteResults');
            if (saved) {
                this.testResults = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load BITE results');
        }
    }

    /**
     * Clear all results
     */
    clearResults() {
        this.testResults = [];
        this.saveResults();
    }

    /**
     * Get available systems
     */
    getAvailableSystems() {
        return Object.entries(this.tests).map(([id, system]) => ({
            id,
            name: system.name,
            category: system.category,
            criticality: system.criticality,
            testCount: system.tests.length
        }));
    }

    /**
     * Get system by ID
     */
    getSystemById(systemId) {
        return this.tests[systemId] || null;
    }

    /**
     * Get categories
     */
    getCategories() {
        const categories = new Set();
        Object.values(this.tests).forEach(system => {
            categories.add(system.category);
        });
        return Array.from(categories);
    }
}

// Singleton instance
export const biteSystem = new BITESystem();

// Auto-load results
biteSystem.loadResults();

export default biteSystem;
