/**
 * Flight Model - Aviation HMI Realistic Simulation
 * Modèle de vol physique pour simulation réaliste
 * Conforme aux performances A320-214 (CFM56-5B4)
 */

export class FlightModel {
    constructor() {
        // ═══ AIRCRAFT PARAMETERS (A320-214) ═══
        this.aircraft = {
            type: 'A320-214',
            engines: 'CFM56-5B4',
            mtow: 78000, // kg
            mlw: 67400,  // kg
            mzfw: 64500, // kg
            fuelCapacity: 24210, // liters
            maxAltitude: 39800, // ft
            cruiseSpeed: 447,    // KTAS
            maxSpeed: 350        // KIAS
        };

        // ═══ CURRENT STATE ═══
        this.state = {
            // Position & Attitude
            altitude: 37000,        // ft
            airspeed: 445,          // KTAS  
            verticalSpeed: 0,       // ft/min
            heading: 90,            // degrees
            pitch: 0,               // degrees
            roll: 0,                // degrees
            
            // Weight & Fuel
            grossWeight: 65000,     // kg
            fuelRemaining: 12000,   // liters
            fuelFlow: 2400,         // kg/h total
            
            // Flight Phase
            phase: 'CRUISE',        // TAXI, TAKEOFF, CLIMB, CRUISE, DESCENT, APPROACH, LANDING
            
            // Environment
            oat: -55,               // °C (Outside Air Temp)
            tat: -45,               // °C (Total Air Temp)
            windSpeed: 35,          // kt
            windDirection: 270,     // degrees
            
            // Time
            flightTime: 0,          // seconds since takeoff
            timeOfDay: 14 * 3600    // seconds since midnight (14:00)
        };

        // ═══ ENGINE MODEL ═══
        this.engines = {
            eng1: this.createEngineState(),
            eng2: this.createEngineState()
        };

        // ═══ SYSTEMS STATE ═══
        this.systems = this.createSystemsState();

        // ═══ PHYSICS CONSTANTS ═══
        this.physics = {
            gravity: 9.81,          // m/s²
            airDensitySeaLevel: 1.225, // kg/m³
            speedOfSound: 340.3,    // m/s at sea level
            temperatureLapseRate: -0.0065 // K/m (ISA)
        };

        // ═══ PERFORMANCE DATA ═══
        this.performance = {
            thrustPerEngine: 120000, // N at sea level
            dragCoefficient: 0.024,
            liftCoefficient: 0.45,
            wingArea: 122.6          // m²
        };
    }

    /**
     * Create initial engine state
     */
    createEngineState() {
        return {
            n1: 85.0,
            n2: 88.0,
            egt: 580,
            ff: 1200,               // kg/h per engine
            oilPress: 62,
            oilTemp: 85,
            vibN1: 1.2,
            vibN2: 0.8,
            thrust: 0.85,           // % of max thrust
            running: true,
            started: true
        };
    }

    /**
     * Create initial systems state
     */
    createSystemsState() {
        return {
            hydraulics: {
                green: { press: 3000, qty: 95, temp: 45, pumps: 2 },
                blue: { press: 3000, qty: 95, temp: 45, pumps: 1 },
                yellow: { press: 3000, qty: 95, temp: 45, pumps: 2 }
            },
            electrical: {
                acBus1: 115,
                acBus2: 115,
                dcBus1: 28,
                dcBus2: 28,
                gen1Load: 75,
                gen2Load: 72,
                batteryVoltage: 27,
                batteryTemp: 25
            },
            pressurization: {
                cabinAlt: 6800,
                deltaP: 8.2,
                cabinRate: 0,
                outflowValve: 45,
                packFlow1: 100,
                packFlow2: 100
            },
            fuel: {
                innerL: 2500,
                innerR: 2500,
                center: 7000,
                total: 12000,
                fuelTemp: -20
            },
            flightControls: {
                aileronL: 0,
                aileronR: 0,
                elevatorL: 0,
                elevatorR: 0,
                rudder: 0,
                spoilers: 0
            }
        };
    }

    /**
     * Update simulation - Called every frame
     * @param {number} deltaTime - Time since last update (seconds)
     */
    update(deltaTime = 1.0) {
        this.updateFlightPhase();
        this.updateEnvironment(deltaTime);
        this.updateEngines(deltaTime);
        this.updateFuel(deltaTime);
        this.updateHydraulics(deltaTime);
        this.updateElectrical(deltaTime);
        this.updatePressurization(deltaTime);
        this.updateFlightDynamics(deltaTime);
        
        this.state.flightTime += deltaTime;
    }

    /**
     * Determine current flight phase based on state
     */
    updateFlightPhase() {
        const { altitude, airspeed, verticalSpeed } = this.state;

        if (altitude < 100 && airspeed < 50) {
            this.state.phase = 'TAXI';
        } else if (altitude < 1500 && verticalSpeed > 1000) {
            this.state.phase = 'TAKEOFF';
        } else if (verticalSpeed > 500 && altitude < 30000) {
            this.state.phase = 'CLIMB';
        } else if (Math.abs(verticalSpeed) < 500 && altitude > 25000) {
            this.state.phase = 'CRUISE';
        } else if (verticalSpeed < -500 && altitude > 3000) {
            this.state.phase = 'DESCENT';
        } else if (altitude < 3000 && altitude > 500) {
            this.state.phase = 'APPROACH';
        } else if (altitude < 500) {
            this.state.phase = 'LANDING';
        }
    }

    /**
     * Update environmental conditions
     */
    updateEnvironment(deltaTime) {
        // Temperature variation with altitude (ISA model)
        const tempSeaLevel = 15; // °C
        const altitudeMeters = this.state.altitude * 0.3048;
        this.state.oat = tempSeaLevel + (altitudeMeters * this.physics.temperatureLapseRate);

        // TAT (Total Air Temperature) considering speed
        const machNumber = this.getMachNumber();
        this.state.tat = this.state.oat * (1 + 0.2 * machNumber * machNumber);

        // Time progression
        this.state.timeOfDay = (this.state.timeOfDay + deltaTime) % 86400;
    }

    /**
     * Update engine parameters based on flight conditions
     */
    updateEngines(deltaTime) {
        const thrustRequired = this.getThrustRequired();
        
        ['eng1', 'eng2'].forEach(engName => {
            const eng = this.engines[engName];
            
            if (!eng.running) return;

            // N1 based on thrust required
            const targetN1 = this.calculateN1FromThrust(thrustRequired);
            eng.n1 = this.smoothTransition(eng.n1, targetN1, 0.5, deltaTime);

            // N2 follows N1 with ratio
            const targetN2 = targetN1 * 1.035;
            eng.n2 = this.smoothTransition(eng.n2, targetN2, 0.6, deltaTime);

            // EGT depends on N1, altitude, and temperature
            const baseEGT = 400 + (eng.n1 - 60) * 8;
            const altitudeFactor = 1 + (this.state.altitude / 100000);
            const targetEGT = baseEGT * altitudeFactor;
            eng.egt = this.smoothTransition(eng.egt, targetEGT, 2.0, deltaTime);

            // Fuel Flow
            const baseff = (eng.n1 / 100) * (eng.n1 / 100) * 1800;
            const densityFactor = this.getAirDensity() / this.physics.airDensitySeaLevel;
            eng.ff = baseff * densityFactor;

            // Oil pressure and temperature
            eng.oilPress = 45 + (eng.n1 / 100) * 35;
            eng.oilTemp = 60 + (eng.egt - 400) / 10;

            // Vibration (realistic micro-variations)
            eng.vibN1 = 0.8 + Math.sin(this.state.flightTime * 2.1) * 0.3 + Math.random() * 0.2;
            eng.vibN2 = 0.6 + Math.sin(this.state.flightTime * 1.7) * 0.2 + Math.random() * 0.15;

            // Thrust percentage
            eng.thrust = eng.n1 / 100;
        });

        // Total fuel flow
        this.state.fuelFlow = (this.engines.eng1.ff + this.engines.eng2.ff);
    }

    /**
     * Calculate N1 required for given thrust
     */
    calculateN1FromThrust(thrustFraction) {
        // Simplified: N1 ≈ sqrt(thrust fraction) * 100
        // Cruise typically 82-88%
        const baseN1 = Math.sqrt(thrustFraction) * 100;
        
        switch(this.state.phase) {
            case 'TAKEOFF': return Math.min(97, baseN1 + 12);
            case 'CLIMB': return Math.min(95, baseN1 + 8);
            case 'CRUISE': return Math.min(88, baseN1);
            case 'DESCENT': return Math.max(65, baseN1 - 15);
            case 'APPROACH': return Math.min(75, baseN1 - 5);
            default: return baseN1;
        }
    }

    /**
     * Get thrust required based on flight phase
     */
    getThrustRequired() {
        switch(this.state.phase) {
            case 'TAXI': return 0.20;
            case 'TAKEOFF': return 0.95;
            case 'CLIMB': return 0.90;
            case 'CRUISE': return 0.75;
            case 'DESCENT': return 0.30;
            case 'APPROACH': return 0.50;
            case 'LANDING': return 0.25;
            default: return 0.75;
        }
    }

    /**
     * Update fuel consumption
     */
    updateFuel(deltaTime) {
        const fuel = this.systems.fuel;
        
        // Consumption in liters per second (density ~0.8 kg/L)
        const consumptionRate = (this.state.fuelFlow / 3600) / 0.8;
        const consumed = consumptionRate * deltaTime;

        // Consume from center first, then wings
        if (fuel.center > 0) {
            fuel.center = Math.max(0, fuel.center - consumed * 0.5);
            fuel.innerL = Math.max(0, fuel.innerL - consumed * 0.25);
            fuel.innerR = Math.max(0, fuel.innerR - consumed * 0.25);
        } else {
            fuel.innerL = Math.max(0, fuel.innerL - consumed * 0.5);
            fuel.innerR = Math.max(0, fuel.innerR - consumed * 0.5);
        }

        fuel.total = fuel.innerL + fuel.innerR + fuel.center;
        this.state.fuelRemaining = fuel.total;

        // Fuel temperature (warms up with engines)
        const avgEGT = (this.engines.eng1.egt + this.engines.eng2.egt) / 2;
        const targetFuelTemp = this.state.oat + (avgEGT - 400) / 30;
        fuel.fuelTemp = this.smoothTransition(fuel.fuelTemp, targetFuelTemp, 10, deltaTime);
    }

    /**
     * Update hydraulic systems
     */
    updateHydraulics(deltaTime) {
        const hyd = this.systems.hydraulics;
        const enginesRunning = this.engines.eng1.running && this.engines.eng2.running;

        ['green', 'blue', 'yellow'].forEach(circuit => {
            const sys = hyd[circuit];
            
            // Pressure depends on pumps and engine state
            const targetPress = enginesRunning ? 3000 : 1500;
            sys.press = this.smoothTransition(sys.press, targetPress, 100, deltaTime);

            // Temperature increases with use
            const baseTemp = 35;
            const usageFactor = sys.press / 3000;
            const targetTemp = baseTemp + usageFactor * 25;
            sys.temp = this.smoothTransition(sys.temp, targetTemp, 2, deltaTime);

            // Slight quantity variation (leaks, thermal expansion)
            sys.qty = Math.max(70, Math.min(100, sys.qty + (Math.random() - 0.5) * 0.1));
        });
    }

    /**
     * Update electrical systems
     */
    updateElectrical(deltaTime) {
        const elec = this.systems.electrical;
        const gen1 = this.engines.eng1.running && this.engines.eng1.n2 > 60;
        const gen2 = this.engines.eng2.running && this.engines.eng2.n2 > 60;

        // AC buses
        elec.acBus1 = gen1 ? 115 + Math.random() * 2 : 0;
        elec.acBus2 = gen2 ? 115 + Math.random() * 2 : 0;

        // DC buses
        elec.dcBus1 = (gen1 || elec.batteryVoltage > 24) ? 28 + Math.random() * 0.5 : 0;
        elec.dcBus2 = (gen2 || elec.batteryVoltage > 24) ? 28 + Math.random() * 0.5 : 0;

        // Generator loads based on systems usage
        const baseLoad = 60;
        const phaseLoad = this.state.phase === 'CRUISE' ? 10 : 20;
        elec.gen1Load = gen1 ? baseLoad + phaseLoad + Math.random() * 10 : 0;
        elec.gen2Load = gen2 ? baseLoad + phaseLoad + Math.random() * 10 : 0;

        // Battery
        if (!gen1 && !gen2) {
            // Discharge
            elec.batteryVoltage = Math.max(22, elec.batteryVoltage - deltaTime * 0.01);
        } else {
            // Charge
            elec.batteryVoltage = Math.min(28, elec.batteryVoltage + deltaTime * 0.05);
        }
    }

    /**
     * Update pressurization system
     */
    updatePressurization(deltaTime) {
        const press = this.systems.pressurization;
        
        // Target cabin altitude based on flight altitude
        const targetCabinAlt = Math.min(8000, this.state.altitude * 0.2);
        press.cabinAlt = this.smoothTransition(press.cabinAlt, targetCabinAlt, 50, deltaTime);

        // Cabin rate of change
        press.cabinRate = (targetCabinAlt - press.cabinAlt) / deltaTime;

        // Delta P (cabin pressure - ambient pressure)
        const altitudeMeters = this.state.altitude * 0.3048;
        const ambientPressure = 101325 * Math.pow(1 - altitudeMeters / 44330, 5.255) / 1000; // kPa
        const cabinPressure = 101325 * Math.pow(1 - press.cabinAlt * 0.3048 / 44330, 5.255) / 1000;
        press.deltaP = (cabinPressure - ambientPressure) / 6.895; // PSI

        // Outflow valve position
        const targetValve = 30 + (this.state.altitude / 400);
        press.outflowValve = this.smoothTransition(press.outflowValve, targetValve, 5, deltaTime);

        // Pack flow
        press.packFlow1 = 90 + Math.random() * 15;
        press.packFlow2 = 90 + Math.random() * 15;
    }

    /**
     * Update flight dynamics (simplified)
     */
    updateFlightDynamics(deltaTime) {
        // Simulate realistic flight profile changes
        const turbulence = (Math.random() - 0.5) * 50;
        
        switch(this.state.phase) {
            case 'CLIMB':
                this.state.verticalSpeed = 2000 + turbulence;
                this.state.altitude += this.state.verticalSpeed * deltaTime / 60;
                break;
            case 'DESCENT':
                this.state.verticalSpeed = -1500 + turbulence;
                this.state.altitude += this.state.verticalSpeed * deltaTime / 60;
                break;
            case 'CRUISE':
                this.state.verticalSpeed = turbulence * 0.3;
                this.state.altitude += this.state.verticalSpeed * deltaTime / 60;
                break;
        }

        // Ensure altitude stays in valid range
        this.state.altitude = Math.max(0, Math.min(this.aircraft.maxAltitude, this.state.altitude));
    }

    /**
     * Get air density at current altitude
     */
    getAirDensity() {
        const altitudeMeters = this.state.altitude * 0.3048;
        const tempK = this.state.oat + 273.15;
        const pressure = 101325 * Math.pow(1 - altitudeMeters / 44330, 5.255);
        return pressure / (287.05 * tempK);
    }

    /**
     * Get Mach number
     */
    getMachNumber() {
        const speedMps = this.state.airspeed * 0.5144; // knots to m/s
        const tempK = this.state.oat + 273.15;
        const speedOfSound = Math.sqrt(1.4 * 287.05 * tempK);
        return speedMps / speedOfSound;
    }

    /**
     * Smooth transition helper
     */
    smoothTransition(current, target, rate, deltaTime) {
        const diff = target - current;
        const change = Math.sign(diff) * Math.min(Math.abs(diff), rate * deltaTime);
        return current + change;
    }

    /**
     * Get flight data for display
     */
    getFlightData() {
        return {
            altitude: Math.round(this.state.altitude),
            airspeed: Math.round(this.state.airspeed),
            verticalSpeed: Math.round(this.state.verticalSpeed),
            phase: this.state.phase,
            fuelRemaining: Math.round(this.state.fuelRemaining),
            fuelFlow: Math.round(this.state.fuelFlow),
            mach: this.getMachNumber().toFixed(3),
            oat: Math.round(this.state.oat),
            flightTime: Math.round(this.state.flightTime)
        };
    }

    /**
     * Get engine data for display
     */
    getEngineData(engineName) {
        return { ...this.engines[engineName] };
    }

    /**
     * Get systems data for display
     */
    getSystemsData() {
        return {
            hydraulics: { ...this.systems.hydraulics },
            electrical: { ...this.systems.electrical },
            pressurization: { ...this.systems.pressurization },
            fuel: { ...this.systems.fuel },
            flightControls: { ...this.systems.flightControls }
        };
    }
}
