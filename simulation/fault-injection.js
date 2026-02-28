/**
 * Fault Injection System - Aviation HMI
 * Système d'injection de pannes complexes et scénarios réalistes
 */

export class FaultInjector {
    constructor(flightModel) {
        this.flightModel = flightModel;
        this.activeFaults = [];
        this.faultHistory = [];
        this.scenarioRunning = false;
        this.scenarioStartTime = 0;

        // Catalogue de pannes
        this.faultCatalog = this.initializeFaultCatalog();
        
        // Sc�narios prédéfinis
        this.scenarios = this.initializeScenarios();
    }

    /**
     * Initialize fault catalog
     */
    initializeFaultCatalog() {
        return {
            // ═══ ENGINE FAULTS ═══
            'ENG_FLAMEOUT': {
                name: 'Engine Flameout',
                severity: 'critical',
                system: 'engines',
                canOccurInFlight: ['CRUISE', 'DESCENT'],
                effects: (model, engine) => {
                    model.engines[engine].n1 = 0;
                    model.engines[engine].n2 = 0;
                    model.engines[engine].egt = model.state.oat;
                    model.engines[engine].ff = 0;
                    model.engines[engine].running = false;
                    model.engines[engine].thrust = 0;
                },
                alarms: engine => [`${engine.toUpperCase()}-FLAMEOUT`, `${engine.toUpperCase()} ENG FAIL`]
            },

            'ENG_OVERHEAT': {
                name: 'Engine Overheat',
                severity: 'warning',
                system: 'engines',
                canOccurInFlight: ['TAKEOFF', 'CLIMB', 'CRUISE'],
                effects: (model, engine) => {
                    model.engines[engine].egt += 150;
                    model.engines[engine].oilTemp += 30;
                },
                alarms: engine => [`${engine.toUpperCase()}-EGT-HI`, `${engine.toUpperCase()} OVERHEAT`]
            },

            'ENG_OIL_LOSS': {
                name: 'Engine Oil Pressure Loss',
                severity: 'critical',
                system: 'engines',
                canOccurInFlight: ['CRUISE', 'DESCENT'],
                effects: (model, engine) => {
                    model.engines[engine].oilPress -= 25;
                    model.engines[engine].vibN1 += 1.5;
                },
                alarms: engine => [`${engine.toUpperCase()}-OIL-LO`, `${engine.toUpperCase()} OIL PRESS`]
            },

            'ENG_HIGH_VIB': {
                name: 'Engine High Vibration',
                severity: 'caution',
                system: 'engines',
                canOccurInFlight: ['TAKEOFF', 'CLIMB', 'CRUISE'],
                effects: (model, engine) => {
                    model.engines[engine].vibN1 += 2.5;
                    model.engines[engine].vibN2 += 1.8;
                },
                alarms: engine => [`${engine.toUpperCase()}-VIB-HI`, `${engine.toUpperCase()} HIGH VIB`]
            },

            // ═══ HYDRAULIC FAULTS ═══
            'HYD_LEAK': {
                name: 'Hydraulic Leak',
                severity: 'warning',
                system: 'hydraulics',
                canOccurInFlight: ['CLIMB', 'CRUISE', 'DESCENT'],
                effects: (model, circuit) => {
                    model.systems.hydraulics[circuit].qty -= 25;
                    model.systems.hydraulics[circuit].press -= 500;
                    model.systems.hydraulics[circuit].temp += 15;
                },
                alarms: circuit => [`HYD-${circuit.toUpperCase()}-LEAK`, `${circuit.toUpperCase()} HYD LOW`]
            },

            'HYD_PUMP_FAIL': {
                name: 'Hydraulic Pump Failure',
                severity: 'caution',
                system: 'hydraulics',
                canOccurInFlight: ['CRUISE', 'DESCENT'],
                effects: (model, circuit) => {
                    model.systems.hydraulics[circuit].pumps -= 1;
                    model.systems.hydraulics[circuit].press -= 800;
                },
                alarms: circuit => [`HYD-${circuit.toUpperCase()}-PUMP`, `${circuit.toUpperCase()} PUMP FAIL`]
            },

            'HYD_OVERHEAT': {
                name: 'Hydraulic Overheat',
                severity: 'caution',
                system: 'hydraulics',
                canOccurInFlight: ['CLIMB', 'CRUISE'],
                effects: (model, circuit) => {
                    model.systems.hydraulics[circuit].temp += 40;
                },
                alarms: circuit => [`HYD-${circuit.toUpperCase()}-TEMP`, `${circuit.toUpperCase()} HYD HOT`]
            },

            // ═══ ELECTRICAL FAULTS ═══
            'ELEC_GEN_FAIL': {
                name: 'Generator Failure',
                severity: 'warning',
                system: 'electrical',
                canOccurInFlight: ['CRUISE', 'DESCENT'],
                effects: (model, gen) => {
                    const genNum = gen === 'gen1' ? 1 : 2;
                    model.systems.electrical[`acBus${genNum}`] = 0;
                    model.systems.electrical[`gen${genNum}Load`] = 0;
                },
                alarms: gen => [`ELEC-${gen.toUpperCase()}-FAIL`, `${gen.toUpperCase()} FAIL`]
            },

            'ELEC_BUS_FAULT': {
                name: 'Electrical Bus Fault',
                severity: 'caution',
                system: 'electrical',
                canOccurInFlight: ['CRUISE'],
                effects: (model, bus) => {
                    if (bus.startsWith('ac')) {
                        model.systems.electrical[bus] *= 0.7;
                    } else {
                        model.systems.electrical[bus] *= 0.8;
                    }
                },
                alarms: bus => [`ELEC-${bus.toUpperCase()}-FAULT`, `${bus.toUpperCase()} FAULT`]
            },

            'ELEC_BATTERY_HOT': {
                name: 'Battery Overheat',
                severity: 'caution',
                system: 'electrical',
                canOccurInFlight: ['CRUISE', 'DESCENT'],
                effects: (model) => {
                    model.systems.electrical.batteryTemp += 25;
                },
                alarms: () => ['ELEC-BAT-HOT', 'BATTERY OVERHEAT']
            },

            // ═══ PRESSURIZATION FAULTS ═══
            'PRESS_LOSS': {
                name: 'Cabin Pressure Loss',
                severity: 'critical',
                system: 'pressurization',
                canOccurInFlight: ['CRUISE'],
                effects: (model) => {
                    model.systems.pressurization.deltaP -= 4;
                    model.systems.pressurization.cabinRate = 2000;
                    model.systems.pressurization.outflowValve = 100;
                },
                alarms: () => ['PRESS-EXCESS-CAB-ALT', 'CABIN ALTITUDE']
            },

            'PRESS_PACK_FAIL': {
                name: 'Pack Failure',
                severity: 'caution',
                system: 'pressurization',
                canOccurInFlight: ['CLIMB', 'CRUISE'],
                effects: (model, pack) => {
                    model.systems.pressurization[`packFlow${pack}`] = 0;
                },
                alarms: pack => [`PRESS-PACK${pack}-FAIL`, `PACK ${pack} FAULT`]
            },

            // ═══ FUEL FAULTS ═══
            'FUEL_LEAK': {
                name: 'Fuel Leak',
                severity: 'critical',
                system: 'fuel',
                canOccurInFlight: ['CRUISE', 'DESCENT'],
                effects: (model, tank) => {
                    // Leak increases fuel consumption dramatically
                    model.fuelLeakRate = model.fuelLeakRate || 0;
                    model.fuelLeakRate += 50; // liters per hour
                    model.fuelLeakTank = tank;
                },
                alarms: tank => [`FUEL-${tank.toUpperCase()}-LEAK`, `${tank.toUpperCase()} FUEL LEAK`]
            },

            'FUEL_IMBALANCE': {
                name: 'Fuel Imbalance',
                severity: 'caution',
                system: 'fuel',
                canOccurInFlight: ['CRUISE'],
                effects: (model) => {
                    const diff = 500;
                    model.systems.fuel.innerL += diff;
                    model.systems.fuel.innerR -= diff;
                },
                alarms: () => ['FUEL-IMBALANCE', 'FUEL IMBALANCE']
            }
        };
    }

    /**
     * Initialize predefined scenarios
     */
    initializeScenarios() {
        return {
            // ═══ CERTIFICATION SCENARIOS (CS-25) ═══
            'CS25_ENGINE_FAILURE_TAKEOFF': {
                name: 'Engine Failure on Takeoff (CS 25.121)',
                description: 'Critical engine failure at V1 during takeoff roll',
                duration: 180, // seconds
                timeline: [
                    { time: 0, action: 'setPhase', params: ['TAKEOFF'] },
                    { time: 5, action: 'injectFault', params: ['ENG_FLAMEOUT', 'eng1'] },
                    { time: 10, action: 'setThrust', params: ['eng2', 0.95] }
                ],
                successCriteria: {
                    engineRestart: false,
                    altitude: { min: 400, max: 1500 },
                    controlMaintained: true
                }
            },

            'CS25_DUAL_ENGINE_FAILURE': {
                name: 'Dual Engine Failure in Flight',
                description: 'Loss of both engines requiring emergency landing',
                duration: 300,
                timeline: [
                    { time: 0, action: 'setPhase', params: ['CRUISE'] },
                    { time: 10, action: 'injectFault', params: ['ENG_FLAMEOUT', 'eng1'] },
                    { time: 45, action: 'injectFault', params: ['ENG_FLAMEOUT', 'eng2'] },
                    { time: 60, action: 'setPhase', params: ['DESCENT'] }
                ],
                successCriteria: {
                    glideRatio: { min: 15, max: 18 },
                    controlMaintained: true,
                    emergencyLanding: true
                }
            },

            'CS25_RAPID_DECOMPRESSION': {
                name: 'Rapid Cabin Decompression (CS 25.841)',
                description: 'Structural failure causing rapid pressure loss',
                duration: 120,
                timeline: [
                    { time: 0, action: 'setPhase', params: ['CRUISE'] },
                    { time: 5, action: 'injectFault', params: ['PRESS_LOSS'] },
                    { time: 10, action: 'setPhase', params: ['DESCENT'] },
                    { time: 15, action: 'setTargetAltitude', params: [10000] }
                ],
                successCriteria: {
                    descentRate: { min: -3000, max: -2000 },
                    finalAltitude: { target: 10000, tolerance: 500 },
                    timeToSafeAltitude: { max: 240 }
                }
            },

            'CS25_HYDRAULIC_FAILURE': {
                name: 'Multiple Hydraulic System Failure',
                description: 'Loss of 2 hydraulic systems',
                duration: 240,
                timeline: [
                    { time: 0, action: 'setPhase', params: ['CRUISE'] },
                    { time: 30, action: 'injectFault', params: ['HYD_LEAK', 'green'] },
                    { time: 90, action: 'injectFault', params: ['HYD_PUMP_FAIL', 'yellow'] },
                    { time: 120, action: 'setPhase', params: ['APPROACH'] }
                ],
                successCriteria: {
                    controlMaintained: true,
                    landingPossible: true
                }
            },

            // ═══ REALISTIC OPERATIONAL SCENARIOS ═══
            'BIRD_STRIKE': {
                name: 'Bird Strike on Climb',
                description: 'Multiple bird strike causing engine damage',
                duration: 300,
                timeline: [
                    { time: 0, action: 'setPhase', params: ['CLIMB'] },
                    { time: 15, action: 'injectFault', params: ['ENG_HIGH_VIB', 'eng1'] },
                    { time: 16, action: 'injectFault', params: ['ENG_OVERHEAT', 'eng1'] },
                    { time: 20, action: 'reduceThrust', params: ['eng1', 0.5] }
                ],
                successCriteria: {
                    altitude: { maintained: true },
                    engineShutdown: 'optional',
                    returnToAirport: true
                }
            },

            'FUEL_LEAK_CRUISE': {
                name: 'Fuel Leak in Cruise',
                description: 'Progressive fuel leak requiring diversion',
                duration: 600,
                timeline: [
                    { time: 0, action: 'setPhase', params: ['CRUISE'] },
                    { time: 60, action: 'injectFault', params: ['FUEL_LEAK', 'center'] },
                    { time: 120, action: 'injectFault', params: ['FUEL_IMBALANCE'] },
                    { time: 300, action: 'setPhase', params: ['DESCENT'] }
                ],
                successCriteria: {
                    fuelManagement: true,
                    diversion: true,
                    landingWithMinFuel: { min: 1000 }
                }
            },

            'ELECTRICAL_EMERGENCY': {
                name: 'Total Electrical Failure',
                description: 'Loss of all generators, battery only',
                duration: 180,
                timeline: [
                    { time: 0, action: 'setPhase', params: ['CRUISE'] },
                    { time: 10, action: 'injectFault', params: ['ELEC_GEN_FAIL', 'gen1'] },
                    { time: 40, action: 'injectFault', params: ['ELEC_GEN_FAIL', 'gen2'] },
                    { time: 60, action: 'setBatteryOnly', params: [true] }
                ],
                successCriteria: {
                    essentialSystemsMaintained: true,
                    batteryDuration: { min: 30 },
                    emergencyLanding: true
                }
            },

            'SEVERE_ICING': {
                name: 'Severe Icing Conditions',
                description: 'Ice accumulation affecting performance',
                duration: 240,
                timeline: [
                    { time: 0, action: 'setPhase', params: ['DESCENT'] },
                    { time: 30, action: 'injectFault', params: ['ENG_OVERHEAT', 'eng1'] },
                    { time: 31, action: 'injectFault', params: ['ENG_OVERHEAT', 'eng2'] },
                    { time: 60, action: 'reduceLift', params: [0.85] },
                    { time: 90, action: 'increaseStallSpeed', params: [1.15] }
                ],
                successCriteria: {
                    altitudeMaintained: true,
                    speedMaintained: true,
                    safeApproach: true
                }
            }
        };
    }

    /**
     * Inject a specific fault
     * @param {string} faultType - Type of fault from catalog
     * @param {string} target - Affected component (engine, circuit, etc.)
     */
    injectFault(faultType, target = null) {
        const fault = this.faultCatalog[faultType];
        
        if (!fault) {
            console.error(`Unknown fault type: ${faultType}`);
            return false;
        }

        // Check if fault can occur in current phase
        const currentPhase = this.flightModel.state.phase;
        if (fault.canOccurInFlight && !fault.canOccurInFlight.includes(currentPhase)) {
            console.warn(`Fault ${faultType} cannot occur during ${currentPhase}`);
            return false;
        }

        // Apply effects
        fault.effects(this.flightModel, target);

        // Record fault
        const activeFault = {
            type: faultType,
            name: fault.name,
            target,
            severity: fault.severity,
            timestamp: this.flightModel.state.flightTime,
            alarms: fault.alarms(target)
        };

        this.activeFaults.push(activeFault);
        this.faultHistory.push(activeFault);

        console.log(`[FAULT INJECTED] ${fault.name} on ${target}`);
        return true;
    }

    /**
     * Run a predefined scenario
     * @param {string} scenarioId - Scenario identifier
     */
    runScenario(scenarioId) {
        const scenario = this.scenarios[scenarioId];
        
        if (!scenario) {
            console.error(`Unknown scenario: ${scenarioId}`);
            return false;
        }

        console.log(`[SCENARIO START] ${scenario.name}`);
        console.log(`Description: ${scenario.description}`);

        this.scenarioRunning = true;
        this.scenarioStartTime = this.flightModel.state.flightTime;
        this.currentScenario = scenario;
        this.scenarioIndex = 0;

        return true;
    }

    /**
     * Update scenario progression
     */
    updateScenario(deltaTime) {
        if (!this.scenarioRunning || !this.currentScenario) return;

        const elapsedTime = this.flightModel.state.flightTime - this.scenarioStartTime;
        const timeline = this.currentScenario.timeline;

        // Execute timeline actions
        while (this.scenarioIndex < timeline.length) {
            const event = timeline[this.scenarioIndex];
            
            if (elapsedTime >= event.time) {
                this.executeScenarioAction(event.action, event.params);
                this.scenarioIndex++;
            } else {
                break;
            }
        }

        // Check if scenario is complete
        if (elapsedTime >= this.currentScenario.duration) {
            console.log(`[SCENARIO COMPLETE] ${this.currentScenario.name}`);
            this.scenarioRunning = false;
        }
    }

    /**
     * Execute scenario action
     */
    executeScenarioAction(action, params) {
        switch(action) {
            case 'injectFault':
                this.injectFault(params[0], params[1]);
                break;
            case 'setPhase':
                this.flightModel.state.phase = params[0];
                break;
            case 'setThrust':
                this.flightModel.engines[params[0]].thrust = params[1];
                break;
            case 'setTargetAltitude':
                this.flightModel.targetAltitude = params[0];
                break;
            case 'reduceThrust':
                this.flightModel.engines[params[0]].thrust *= params[1];
                break;
            case 'setBatteryOnly':
                // Simulate battery-only mode
                break;
            case 'reduceLift':
                this.flightModel.liftReduction = params[0];
                break;
            case 'increaseStallSpeed':
                this.flightModel.stallSpeedFactor = params[0];
                break;
            default:
                console.warn(`Unknown scenario action: ${action}`);
        }
    }

    /**
     * Clear all active faults
     */
    clearAllFaults() {
        this.activeFaults = [];
        console.log('[FAULTS CLEARED]');
    }

    /**
     * Get active faults
     */
    getActiveFaults() {
        return [...this.activeFaults];
    }

    /**
     * Get fault history
     */
    getFaultHistory() {
        return [...this.faultHistory];
    }

    /**
     * Get available scenarios
     */
    getAvailableScenarios() {
        return Object.keys(this.scenarios).map(id => ({
            id,
            name: this.scenarios[id].name,
            description: this.scenarios[id].description,
            duration: this.scenarios[id].duration
        }));
    }
}
