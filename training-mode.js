/**
 * Training Mode System
 * Scenario-based training for pilots and maintenance crew
 * Includes replay, scoring, and instructor mode
 */

export class TrainingSystem {
    constructor() {
        this.scenarios = [];
        this.currentScenario = null;
        this.scenarioRunning = false;
        this.scenarioStartTime = null;
        this.actionLog = [];
        this.score = 0;
        this.eventQueue = [];
        this.timeoutHandles = [];
        
        this.initializeScenarios();
    }

    /**
     * Initialize training scenarios
     */
    initializeScenarios() {
        this.scenarios = [
            {
                id: 'SCENARIO-001',
                name: 'Engine Failure on Takeoff',
                description: 'V1 cut - Single engine operation during takeoff roll',
                difficulty: 'medium',
                duration: 180,
                category: 'EMERGENCY',
                objectives: [
                    'Maintain runway heading',
                    'Continue takeoff (if past V1)',
                    'Execute single engine procedure',
                    'Positive rate - Gear up',
                    'Navigate to safe altitude'
                ],
                events: [
                    { time: 5, type: 'info', message: 'Takeoff roll initiated - V1 approaching' },
                    { time: 10, type: 'fault', code: 'ENG-N1-HI', engine: 2, message: 'ENGINE 2 N1 DROPOUT' },
                    { time: 11, type: 'fault', code: 'ENG-EGT-HI', engine: 2, message: 'ENGINE 2 FAIL' },
                    { time: 12, type: 'voice', alert: 'ENGINE_FIRE' },
                    { time: 15, type: 'check', action: 'maintain_heading', required: true },
                    { time: 20, type: 'check', action: 'gear_up', required: true },
                    { time: 30, type: 'check', action: 'eng2_shutdown', required: true }
                ],
                expectedActions: [
                    { action: 'maintain_heading', name: 'Maintain runway heading', points: 20, timeLimit: 15 },
                    { action: 'gear_up', name: 'Positive rate - Gear up', points: 20, timeLimit: 25 },
                    { action: 'eng2_shutdown', name: 'Engine 2 shutdown procedure', points: 30, timeLimit: 40 },
                    { action: 'climb_altitude', name: 'Climb to safe altitude', points: 20, timeLimit: 120 },
                    { action: 'acknowledge_alarm', name: 'Acknowledge all alarms', points: 10, timeLimit: 60 }
                ],
                scoring: {
                    maxPoints: 100,
                    passingScore: 70
                }
            },
            {
                id: 'SCENARIO-002',
                name: 'Cabin Depressurization',
                description: 'Rapid decompression at FL370',
                difficulty: 'high',
                duration: 300,
                category: 'EMERGENCY',
                objectives: [
                    'Don oxygen masks immediately',
                    'Initiate emergency descent',
                    'Descend to FL100',
                    'Communicate with ATC',
                    'Check cabin pressure'
                ],
                events: [
                    { time: 5, type: 'info', message: 'Cruising at FL370' },
                    { time: 10, type: 'fault', code: 'PRESS-CAB-HI', message: 'CABIN ALTITUDE HIGH' },
                    { time: 11, type: 'voice', alert: 'CABIN_ALTITUDE' },
                    { time: 12, type: 'param', param: 'cabinAlt', value: 12000 },
                    { time: 15, type: 'check', action: 'oxygen_masks', required: true },
                    { time: 20, type: 'check', action: 'emergency_descent', required: true },
                    { time: 60, type: 'check', action: 'level_fl100', required: true }
                ],
                expectedActions: [
                    { action: 'oxygen_masks', name: 'Don oxygen masks', points: 30, timeLimit: 15 },
                    { action: 'emergency_descent', name: 'Initiate emergency descent', points: 30, timeLimit: 25 },
                    { action: 'level_fl100', name: 'Level off at FL100', points: 20, timeLimit: 90 },
                    { action: 'check_passengers', name: 'Check passenger oxygen', points: 10, timeLimit: 120 },
                    { action: 'atc_notify', name: 'Notify ATC', points: 10, timeLimit: 30 }
                ],
                scoring: {
                    maxPoints: 100,
                    passingScore: 75
                }
            },
            {
                id: 'SCENARIO-003',
                name: 'Dual Hydraulic Failure',
                description: 'Loss of Green and Yellow hydraulic systems',
                difficulty: 'high',
                duration: 240,
                category: 'SYSTEM_FAILURE',
                objectives: [
                    'Identify hydraulic failures',
                    'Execute QRH procedure',
                    'Activate alternate systems',
                    'Plan landing with limitations',
                    'Brief crew and passengers'
                ],
                events: [
                    { time: 10, type: 'fault', code: 'HYD-GRN-LO', message: 'GREEN HYDRAULIC PRESSURE LOW' },
                    { time: 15, type: 'fault', code: 'HYD-YEL-LO', message: 'YELLOW HYDRAULIC PRESSURE LOW' },
                    { time: 16, type: 'voice', alert: 'HYDRAULIC_PRESSURE' },
                    { time: 20, type: 'check', action: 'identify_failures', required: true },
                    { time: 40, type: 'check', action: 'activate_blue', required: true },
                    { time: 60, type: 'check', action: 'plan_landing', required: true }
                ],
                expectedActions: [
                    { action: 'identify_failures', name: 'Identify hydraulic failures', points: 20, timeLimit: 30 },
                    { action: 'qrh_procedure', name: 'Execute QRH procedure', points: 25, timeLimit: 60 },
                    { action: 'activate_blue', name: 'Activate Blue hydraulic', points: 25, timeLimit: 50 },
                    { action: 'plan_landing', name: 'Plan alternate landing', points: 20, timeLimit: 120 },
                    { action: 'brief_crew', name: 'Brief crew', points: 10, timeLimit: 90 }
                ],
                scoring: {
                    maxPoints: 100,
                    passingScore: 70
                }
            },
            {
                id: 'SCENARIO-004',
                name: 'Multiple Electrical Failures',
                description: 'Loss of both generators with battery operation',
                difficulty: 'medium',
                duration: 180,
                category: 'SYSTEM_FAILURE',
                objectives: [
                    'Identify electrical failures',
                    'Start APU',
                    'Manage battery life',
                    'Shed non-essential loads',
                    'Restore power'
                ],
                events: [
                    { time: 5, type: 'fault', code: 'ELEC-GEN-HI', generator: 1, message: 'GEN 1 FAILURE' },
                    { time: 20, type: 'fault', code: 'ELEC-GEN-HI', generator: 2, message: 'GEN 2 FAILURE' },
                    { time: 21, type: 'voice', alert: 'ELECTRICAL_FAULT' },
                    { time: 25, type: 'check', action: 'start_apu', required: true },
                    { time: 30, type: 'check', action: 'shed_loads', required: true },
                    { time: 60, type: 'check', action: 'restore_power', required: true }
                ],
                expectedActions: [
                    { action: 'identify_gen_failures', name: 'Identify generator failures', points: 15, timeLimit: 20 },
                    { action: 'start_apu', name: 'Start APU', points: 30, timeLimit: 40 },
                    { action: 'shed_loads', name: 'Shed non-essential loads', points: 25, timeLimit: 45 },
                    { action: 'restore_power', name: 'Restore power with APU gen', points: 20, timeLimit: 80 },
                    { action: 'monitor_battery', name: 'Monitor battery status', points: 10, timeLimit: 120 }
                ],
                scoring: {
                    maxPoints: 100,
                    passingScore: 65
                }
            },
            {
                id: 'SCENARIO-005',
                name: 'Flight Control Computer Failure',
                description: 'ELAC 1 fault with degraded control laws',
                difficulty: 'medium',
                duration: 150,
                category: 'SYSTEM_FAILURE',
                objectives: [
                    'Identify ELAC failure',
                    'Understand control law degradation',
                    'Adjust flying technique',
                    'Brief crew on limitations',
                    'Plan approach'
                ],
                events: [
                    { time: 10, type: 'fault', code: 'FCTL-ELAC-1', message: 'ELAC 1 FAULT' },
                    { time: 15, type: 'info', message: 'CONTROL LAW: ALTERNATE' },
                    { time: 20, type: 'check', action: 'identify_elac_fault', required: true },
                    { time: 40, type: 'check', action: 'understand_limitations', required: true },
                    { time: 60, type: 'check', action: 'brief_approach', required: true }
                ],
                expectedActions: [
                    { action: 'identify_elac_fault', name: 'Identify ELAC fault', points: 20, timeLimit: 30 },
                    { action: 'check_other_computers', name: 'Check other computers', points: 15, timeLimit: 45 },
                    { action: 'understand_limitations', name: 'Understand limitations', points: 25, timeLimit: 60 },
                    { action: 'adjust_technique', name: 'Adjust flying technique', points: 20, timeLimit: 90 },
                    { action: 'brief_approach', name: 'Brief approach', points: 20, timeLimit: 120 }
                ],
                scoring: {
                    maxPoints: 100,
                    passingScore: 70
                }
            },
            {
                id: 'SCENARIO-006',
                name: 'Low Fuel Emergency',
                description: 'Fuel quantity below minimum with diversion required',
                difficulty: 'low',
                duration: 120,
                category: 'ABNORMAL',
                objectives: [
                    'Identify low fuel condition',
                    'Calculate remaining endurance',
                    'Request priority landing',
                    'Find nearest suitable airport',
                    'Manage fuel efficiently'
                ],
                events: [
                    { time: 5, type: 'fault', code: 'FUEL-QTY-LO', message: 'FUEL QUANTITY LOW' },
                    { time: 10, type: 'param', param: 'totalFuel', value: 1800 },
                    { time: 15, type: 'check', action: 'calculate_endurance', required: true },
                    { time: 30, type: 'check', action: 'request_priority', required: true },
                    { time: 45, type: 'check', action: 'nearest_airport', required: true }
                ],
                expectedActions: [
                    { action: 'identify_low_fuel', name: 'Identify low fuel', points: 15, timeLimit: 15 },
                    { action: 'calculate_endurance', name: 'Calculate endurance', points: 25, timeLimit: 30 },
                    { action: 'request_priority', name: 'Request priority', points: 20, timeLimit: 40 },
                    { action: 'nearest_airport', name: 'Identify nearest airport', points: 25, timeLimit: 60 },
                    { action: 'manage_fuel', name: 'Optimize fuel consumption', points: 15, timeLimit: 90 }
                ],
                scoring: {
                    maxPoints: 100,
                    passingScore: 60
                }
            }
        ];
    }

    /**
     * Start a training scenario
     * @param {string} scenarioId - Scenario identifier
     * @returns {object} Scenario info
     */
    startScenario(scenarioId) {
        if (this.scenarioRunning) {
            throw new Error('A scenario is already running');
        }

        const scenario = this.scenarios.find(s => s.id === scenarioId);
        if (!scenario) {
            throw new Error(`Unknown scenario: ${scenarioId}`);
        }

        this.currentScenario = scenario;
        this.scenarioRunning = true;
        this.scenarioStartTime = Date.now();
        this.actionLog = [];
        this.score = 0;
        this.eventQueue = [];

        // Schedule events
        this.scheduleEvents();

        return {
            scenario: {
                id: scenario.id,
                name: scenario.name,
                description: scenario.description,
                objectives: scenario.objectives,
                duration: scenario.duration
            },
            startTime: this.scenarioStartTime
        };
    }

    /**
     * Schedule scenario events
     */
    scheduleEvents() {
        if (!this.currentScenario) return;

        this.currentScenario.events.forEach(event => {
            const handle = setTimeout(() => {
                this.triggerEvent(event);
            }, event.time * 1000);

            this.timeoutHandles.push(handle);
        });

        // Auto-end scenario
        const endHandle = setTimeout(() => {
            this.endScenario();
        }, this.currentScenario.duration * 1000);

        this.timeoutHandles.push(endHandle);
    }

    /**
     * Trigger a scenario event
     * @param {object} event - Event definition
     */
    triggerEvent(event) {
        if (!this.scenarioRunning) return;

        const elapsedTime = Math.floor((Date.now() - this.scenarioStartTime) / 1000);

        this.eventQueue.push({
            ...event,
            elapsedTime,
            timestamp: new Date().toISOString()
        });

        // Trigger event in app
        if (window.trainingEventCallback) {
            window.trainingEventCallback(event);
        }

        console.log(`[TRAINING] Event triggered at ${elapsedTime}s:`, event);
    }

    /**
     * Log a trainee action
     * @param {string} action - Action identifier
     * @param {object} details - Action details
     */
    logAction(action, details = {}) {
        if (!this.scenarioRunning) return;

        const elapsedTime = Math.floor((Date.now() - this.scenarioStartTime) / 1000);

        const actionEntry = {
            action,
            elapsedTime,
            timestamp: new Date().toISOString(),
            ...details
        };

        this.actionLog.push(actionEntry);

        // Check if this action was expected
        this.checkExpectedAction(action, elapsedTime);

        console.log(`[TRAINING] Action logged:`, actionEntry);
    }

    /**
     * Check if action matches expected actions
     * @param {string} action - Action identifier
     * @param {number} elapsedTime - Time of action
     */
    checkExpectedAction(action, elapsedTime) {
        const expected = this.currentScenario.expectedActions.find(a => a.action === action);

        if (expected) {
            // Check if within time limit
            if (elapsedTime <= expected.timeLimit) {
                // Full points
                this.score += expected.points;
                console.log(`[TRAINING] ✅ Correct action: ${expected.name} (+${expected.points} points)`);
            } else {
                // Partial points (50%)
                const partialPoints = Math.floor(expected.points * 0.5);
                this.score += partialPoints;
                console.log(`[TRAINING] ⚠️ Late action: ${expected.name} (+${partialPoints} points)`);
            }

            // Mark as completed
            expected.completed = true;
            expected.completedAt = elapsedTime;
        }
    }

    /**
     * End current scenario
     * @returns {object} Scenario result
     */
    endScenario() {
        if (!this.scenarioRunning) {
            throw new Error('No scenario is running');
        }

        // Clear all timeouts
        this.timeoutHandles.forEach(handle => clearTimeout(handle));
        this.timeoutHandles = [];

        const endTime = Date.now();
        const duration = Math.floor((endTime - this.scenarioStartTime) / 1000);

        // Calculate final score
        const maxScore = this.currentScenario.scoring.maxPoints;
        const passingScore = this.currentScenario.scoring.passingScore;
        const scorePercentage = (this.score / maxScore) * 100;
        const passed = this.score >= passingScore;

        // Check missed actions
        const missedActions = this.currentScenario.expectedActions.filter(a => !a.completed);

        const result = {
            scenarioId: this.currentScenario.id,
            scenarioName: this.currentScenario.name,
            startTime: new Date(this.scenarioStartTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            duration,
            score: this.score,
            maxScore,
            scorePercentage: scorePercentage.toFixed(1),
            passed,
            passingScore,
            completedActions: this.currentScenario.expectedActions.filter(a => a.completed).length,
            totalActions: this.currentScenario.expectedActions.length,
            missedActions: missedActions.map(a => a.name),
            actionLog: this.actionLog,
            eventLog: this.eventQueue
        };

        // Save result
        this.saveResult(result);

        // Reset state
        this.scenarioRunning = false;
        this.currentScenario = null;
        this.scenarioStartTime = null;

        return result;
    }

    /**
     * Pause current scenario
     */
    pauseScenario() {
        if (!this.scenarioRunning) return;

        // Clear timeouts
        this.timeoutHandles.forEach(handle => clearTimeout(handle));
        this.timeoutHandles = [];

        console.log('[TRAINING] Scenario paused');
    }

    /**
     * Resume paused scenario
     */
    resumeScenario() {
        if (!this.currentScenario) return;

        const elapsedTime = Math.floor((Date.now() - this.scenarioStartTime) / 1000);

        // Reschedule remaining events
        this.currentScenario.events.forEach(event => {
            if (event.time > elapsedTime) {
                const remainingTime = (event.time - elapsedTime) * 1000;
                const handle = setTimeout(() => {
                    this.triggerEvent(event);
                }, remainingTime);

                this.timeoutHandles.push(handle);
            }
        });

        console.log('[TRAINING] Scenario resumed');
    }

    /**
     * Get available scenarios
     */
    getScenarios() {
        return this.scenarios.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            difficulty: s.difficulty,
            duration: s.duration,
            category: s.category,
            objectiveCount: s.objectives.length
        }));
    }

    /**
     * Get scenario by ID
     */
    getScenario(scenarioId) {
        return this.scenarios.find(s => s.id === scenarioId);
    }

    /**
     * Get current scenario status
     */
    getStatus() {
        if (!this.scenarioRunning) {
            return { running: false };
        }

        const elapsedTime = Math.floor((Date.now() - this.scenarioStartTime) / 1000);
        const remainingTime = this.currentScenario.duration - elapsedTime;

        return {
            running: true,
            scenarioId: this.currentScenario.id,
            scenarioName: this.currentScenario.name,
            elapsedTime,
            remainingTime,
            score: this.score,
            maxScore: this.currentScenario.scoring.maxPoints,
            completedActions: this.currentScenario.expectedActions.filter(a => a.completed).length,
            totalActions: this.currentScenario.expectedActions.length
        };
    }

    /**
     * Save scenario result
     */
    saveResult(result) {
        try {
            const results = JSON.parse(localStorage.getItem('trainingResults') || '[]');
            results.unshift(result);
            
            // Keep only last 50 results
            if (results.length > 50) {
                results.length = 50;
            }

            localStorage.setItem('trainingResults', JSON.stringify(results));
        } catch (e) {
            console.warn('Could not save training result');
        }
    }

    /**
     * Get training history
     */
    getHistory(limit = 10) {
        try {
            const results = JSON.parse(localStorage.getItem('trainingResults') || '[]');
            return results.slice(0, limit);
        } catch (e) {
            return [];
        }
    }

    /**
     * Get training statistics
     */
    getStatistics() {
        const history = this.getHistory(100);

        if (history.length === 0) {
            return {
                totalSessions: 0,
                averageScore: 0,
                passRate: 0,
                favoriteScenario: null
            };
        }

        const totalScore = history.reduce((sum, r) => sum + parseFloat(r.scorePercentage), 0);
        const passed = history.filter(r => r.passed).length;

        const scenarioCounts = {};
        history.forEach(r => {
            scenarioCounts[r.scenarioId] = (scenarioCounts[r.scenarioId] || 0) + 1;
        });

        const favoriteScenarioId = Object.keys(scenarioCounts).reduce((a, b) => 
            scenarioCounts[a] > scenarioCounts[b] ? a : b
        );

        const favoriteScenario = this.scenarios.find(s => s.id === favoriteScenarioId);

        return {
            totalSessions: history.length,
            averageScore: (totalScore / history.length).toFixed(1),
            passRate: ((passed / history.length) * 100).toFixed(1),
            favoriteScenario: favoriteScenario ? favoriteScenario.name : null,
            recentSessions: history.slice(0, 5).map(r => ({
                scenario: r.scenarioName,
                score: r.scorePercentage,
                passed: r.passed,
                date: r.startTime
            }))
        };
    }

    /**
     * Export results as CSV
     */
    exportResultsCSV() {
        const history = this.getHistory(100);

        let csv = 'Scenario,Date,Duration,Score,Max Score,Percentage,Passed,Completed Actions,Total Actions\n';

        history.forEach(result => {
            csv += `"${result.scenarioName}","${result.startTime}","${result.duration}",`;
            csv += `"${result.score}","${result.maxScore}","${result.scorePercentage}",`;
            csv += `"${result.passed}","${result.completedActions}","${result.totalActions}"\n`;
        });

        return csv;
    }

    /**
     * Clear training history
     */
    clearHistory() {
        localStorage.removeItem('trainingResults');
    }
}

// Singleton instance
export const trainingSystem = new TrainingSystem();

export default trainingSystem;
