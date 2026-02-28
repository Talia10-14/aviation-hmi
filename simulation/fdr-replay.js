/**
 * FDR/QAR Replay System - Aviation HMI
 * Parse and replay real flight data from Flight Data Recorder
 * Supports CSV format from FDR/QAR data extractors
 */

export class FlightDataReplay {
    constructor(flightModel) {
        this.flightModel = flightModel;
        this.flightData = null;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.playbackSpeed = 1.0;
        this.startTime = 0;
        this.pausedTime = 0;

        // FDR parameter mapping (ARINC 767 standard)
        this.parameterMap = this.initializeParameterMap();
    }

    /**
     * Initialize FDR parameter mapping
     * Maps FDR parameter names to internal model parameters
     */
    initializeParameterMap() {
        return {
            // Time
            'TIME': 'timestamp',
            'UTC_TIME': 'time',
            
            // Position & Navigation
            'ALT_STD': 'altitude',
            'ALT_BARO': 'altitude',
            'IAS': 'airspeed',
            'CAS': 'calibratedAirspeed',
            'TAS': 'trueAirspeed',
            'MACH': 'machNumber',
            'HDG_TRUE': 'heading',
            'HDG_MAG': 'magneticHeading',
            'PITCH': 'pitch',
            'ROLL': 'roll',
            'VERT_SPD': 'verticalSpeed',
            'LAT': 'latitude',
            'LONG': 'longitude',
            
            // Engines
            'ENG_1_N1': 'eng1.n1',
            'ENG_1_N2': 'eng1.n2',
            'ENG_1_EGT': 'eng1.egt',
            'ENG_1_FF': 'eng1.ff',
            'ENG_1_OIL_PRESS': 'eng1.oilPress',
            'ENG_1_OIL_TEMP': 'eng1.oilTemp',
            'ENG_1_VIB': 'eng1.vibN1',
            
            'ENG_2_N1': 'eng2.n1',
            'ENG_2_N2': 'eng2.n2',
            'ENG_2_EGT': 'eng2.egt',
            'ENG_2_FF': 'eng2.ff',
            'ENG_2_OIL_PRESS': 'eng2.oilPress',
            'ENG_2_OIL_TEMP': 'eng2.oilTemp',
            'ENG_2_VIB': 'eng2.vibN1',
            
            // Fuel
            'FUEL_QTY_L': 'fuel.innerL',
            'FUEL_QTY_R': 'fuel.innerR',
            'FUEL_QTY_C': 'fuel.center',
            'FUEL_FLOW_TOTAL': 'fuelFlow',
            'FUEL_TEMP': 'fuel.fuelTemp',
            
            // Hydraulics
            'HYD_GREEN_PRESS': 'hydraulics.green.press',
            'HYD_BLUE_PRESS': 'hydraulics.blue.press',
            'HYD_YELLOW_PRESS': 'hydraulics.yellow.press',
            'HYD_GREEN_QTY': 'hydraulics.green.qty',
            'HYD_BLUE_QTY': 'hydraulics.blue.qty',
            'HYD_YELLOW_QTY': 'hydraulics.yellow.qty',
            
            // Electrical
            'ELEC_AC_BUS_1': 'electrical.acBus1',
            'ELEC_AC_BUS_2': 'electrical.acBus2',
            'ELEC_DC_BUS_1': 'electrical.dcBus1',
            'ELEC_DC_BUS_2': 'electrical.dcBus2',
            'ELEC_GEN_1_LOAD': 'electrical.gen1Load',
            'ELEC_GEN_2_LOAD': 'electrical.gen2Load',
            
            // Pressurization
            'CABIN_ALT': 'pressurization.cabinAlt',
            'CABIN_DELTA_P': 'pressurization.deltaP',
            'CABIN_RATE': 'pressurization.cabinRate',
            
            // Flight Controls
            'AILERON_L': 'flightControls.aileronL',
            'AILERON_R': 'flightControls.aileronR',
            'ELEVATOR_L': 'flightControls.elevatorL',
            'ELEVATOR_R': 'flightControls.elevatorR',
            'RUDDER': 'flightControls.rudder',
            
            // Environmental
            'OAT': 'oat',
            'TAT': 'tat',
            'SAT': 'oat'
        };
    }

    /**
     * Parse CSV flight data
     * @param {string} csvData - CSV string from FDR/QAR
     */
    parseCSV(csvData) {
        try {
            const lines = csvData.trim().split('\n');
            if (lines.length < 2) {
                throw new Error('Invalid CSV: insufficient data');
            }

            // Parse header
            const headers = lines[0].split(',').map(h => h.trim());
            
            // Parse data rows
            const data = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                if (values.length !== headers.length) continue;

                const row = {};
                headers.forEach((header, index) => {
                    const value = values[index].trim();
                    row[header] = isNaN(value) ? value : parseFloat(value);
                });
                data.push(row);
            }

            this.flightData = {
                headers,
                data,
                duration: data.length,
                startTime: data[0].TIME || 0,
                endTime: data[data.length - 1].TIME || data.length
            };

            console.log(`[FDR] Loaded ${data.length} data points`);
            console.log(`[FDR] Duration: ${this.formatTime(this.flightData.duration)}`);
            return true;

        } catch (error) {
            console.error('[FDR] Parse error:', error);
            return false;
        }
    }

    /**
     * Parse JSON flight data (alternative format)
     * @param {string} jsonData - JSON string with flight data
     */
    parseJSON(jsonData) {
        try {
            const parsed = JSON.parse(jsonData);
            
            if (!parsed.data || !Array.isArray(parsed.data)) {
                throw new Error('Invalid JSON: missing data array');
            }

            this.flightData = {
                headers: parsed.parameters || Object.keys(parsed.data[0]),
                data: parsed.data,
                duration: parsed.data.length,
                metadata: parsed.metadata || {},
                startTime: parsed.data[0].TIME || 0,
                endTime: parsed.data[parsed.data.length - 1].TIME || parsed.data.length
            };

            console.log(`[FDR] Loaded ${parsed.data.length} data points`);
            return true;

        } catch (error) {
            console.error('[FDR] Parse error:', error);
            return false;
        }
    }

    /**
     * Load flight data from file
     * @param {File} file - File object (CSV or JSON)
     */
    async loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const content = e.target.result;
                const success = file.name.endsWith('.json') 
                    ? this.parseJSON(content)
                    : this.parseCSV(content);
                
                if (success) {
                    resolve(true);
                } else {
                    reject(new Error('Failed to parse file'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Start playback
     */
    play() {
        if (!this.flightData) {
            console.error('[FDR] No flight data loaded');
            return false;
        }

        this.isPlaying = true;
        this.startTime = Date.now() - (this.pausedTime || 0);
        console.log('[FDR] Playback started');
        return true;
    }

    /**
     * Pause playback
     */
    pause() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this.pausedTime = Date.now() - this.startTime;
        console.log('[FDR] Playback paused');
    }

    /**
     * Stop and reset playback
     */
    stop() {
        this.isPlaying = false;
        this.currentIndex = 0;
        this.startTime = 0;
        this.pausedTime = 0;
        console.log('[FDR] Playback stopped');
    }

    /**
     * Seek to specific time
     * @param {number} time - Time in seconds
     */
    seek(time) {
        if (!this.flightData) return false;

        const index = Math.floor(time);
        if (index >= 0 && index < this.flightData.data.length) {
            this.currentIndex = index;
            this.pausedTime = time * 1000;
            return true;
        }
        return false;
    }

    /**
     * Set playback speed
     * @param {number} speed - Playback speed multiplier (0.1 to 10)
     */
    setSpeed(speed) {
        this.playbackSpeed = Math.max(0.1, Math.min(10, speed));
        console.log(`[FDR] Playback speed: ${this.playbackSpeed}x`);
    }

    /**
     * Update flight model with current data point
     * @param {number} deltaTime - Time delta for smooth interpolation
     */
    update(deltaTime) {
        if (!this.isPlaying || !this.flightData) return;

        // Calculate current playback time
        const elapsed = (Date.now() - this.startTime) * this.playbackSpeed;
        const targetIndex = Math.floor(elapsed / 1000);

        if (targetIndex >= this.flightData.data.length) {
            this.stop();
            console.log('[FDR] Playback complete');
            return;
        }

        // Get current and next data points for interpolation
        const current = this.flightData.data[targetIndex];
        const next = this.flightData.data[Math.min(targetIndex + 1, this.flightData.data.length - 1)];
        
        // Interpolation factor
        const t = (elapsed / 1000) - targetIndex;

        // Apply data to flight model
        this.applyDataToModel(current, next, t);
        
        this.currentIndex = targetIndex;
    }

    /**
     * Apply FDR data to flight model with interpolation
     * @param {object} current - Current data point
     * @param {object} next - Next data point
     * @param {number} t - Interpolation factor (0 to 1)
     */
    applyDataToModel(current, next, t) {
        // Interpolate and apply each parameter
        Object.entries(this.parameterMap).forEach(([fdrParam, modelPath]) => {
            if (current[fdrParam] !== undefined && next[fdrParam] !== undefined) {
                const value = this.interpolate(
                    current[fdrParam],
                    next[fdrParam],
                    t
                );
                this.setModelValue(modelPath, value);
            }
        });
    }

    /**
     * Linear interpolation
     */
    interpolate(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Set value in flight model using dot notation path
     * @param {string} path - Dot notation path (e.g., 'eng1.n1')
     * @param {*} value - Value to set
     */
    setModelValue(path, value) {
        const parts = path.split('.');
        let obj = this.flightModel;

        // Navigate to the correct object
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (part === 'eng1' || part === 'eng2') {
                obj = this.flightModel.engines[part];
            } else if (obj.systems && obj.systems[part]) {
                obj = obj.systems[part];
            } else if (obj.state && obj.state[part] !== undefined) {
                obj = obj.state;
            } else {
                obj = obj[part];
            }
            
            if (!obj) return;
        }

        // Set the value
        const finalKey = parts[parts.length - 1];
        if (obj && obj[finalKey] !== undefined) {
            obj[finalKey] = value;
        }
    }

    /**
     * Export current session as FDR data
     */
    exportSession() {
        const data = {
            metadata: {
                aircraft: this.flightModel.aircraft.type,
                engines: this.flightModel.aircraft.engines,
                exportDate: new Date().toISOString(),
                duration: this.flightModel.state.flightTime
            },
            parameters: Object.keys(this.parameterMap),
            data: this.sessionData || []
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Format time as HH:MM:SS
     */
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    /**
     * Get playback info
     */
    getPlaybackInfo() {
        if (!this.flightData) {
            return { loaded: false };
        }

        return {
            loaded: true,
            playing: this.isPlaying,
            currentTime: this.currentIndex,
            duration: this.flightData.duration,
            progress: (this.currentIndex / this.flightData.duration) * 100,
            speed: this.playbackSpeed,
            currentData: this.flightData.data[this.currentIndex]
        };
    }

    /**
     * Generate sample FDR data for testing
     */
    static generateSampleData(duration = 3600) {
        const data = [];
        
        for (let i = 0; i < duration; i++) {
            const phase = i < 600 ? 'CLIMB' 
                : i < 3000 ? 'CRUISE' 
                : i < 3300 ? 'DESCENT' 
                : 'APPROACH';
            
            const altitude = phase === 'CLIMB' ? 10000 + i * 40
                : phase === 'CRUISE' ? 37000
                : phase === 'DESCENT' ? 37000 - (i - 3000) * 100
                : Math.max(500, 7000 - (i - 3300) * 20);

            data.push({
                TIME: i,
                ALT_STD: altitude,
                IAS: 250 + Math.random() * 20,
                MACH: 0.78 + Math.random() * 0.02,
                HDG_TRUE: 90 + Math.sin(i / 100) * 10,
                PITCH: Math.sin(i / 50) * 5,
                ROLL: Math.cos(i / 30) * 3,
                VERT_SPD: phase === 'CLIMB' ? 2000 : phase === 'DESCENT' ? -1500 : 0,
                ENG_1_N1: 85 + Math.random() * 2,
                ENG_1_N2: 88 + Math.random() * 2,
                ENG_1_EGT: 580 + Math.random() * 20,
                ENG_1_FF: 1200 + Math.random() * 50,
                ENG_2_N1: 84 + Math.random() * 2,
                ENG_2_N2: 87 + Math.random() * 2,
                ENG_2_EGT: 575 + Math.random() * 20,
                ENG_2_FF: 1190 + Math.random() * 50,
                FUEL_QTY_L: Math.max(500, 2500 - i * 0.4),
                FUEL_QTY_R: Math.max(500, 2500 - i * 0.4),
                FUEL_QTY_C: Math.max(0, 7000 - i * 1.2),
                OAT: -55 + Math.random() * 2
            });
        }

        return {
            metadata: {
                aircraft: 'A320-214',
                flight: 'TEST001',
                date: new Date().toISOString()
            },
            data
        };
    }
}
