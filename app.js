/* ═══════════════════════════════════════════════════════ */
/* AERO-DIAG — Aviation Diagnostic HMI — Logic           */
/* Real-time sensor simulation, alarm management, ECAM   */
/* ═══════════════════════════════════════════════════════ */

import SimulationManager from './simulation/simulation-manager.js';
import './modal-utils.js';

(() => {
    'use strict';

    // ── Instance de simulation réaliste ──
    const simulationManager = new SimulationManager();

    // ── Configuration ──
    const UPDATE_INTERVAL = 1000;     // ms
    const ALARM_CHECK_INTERVAL = 3000;
    const MAX_LOG_ENTRIES = 50;
    const DEBUG_MODE = false; // Set to true for verbose logging

    /**
     * Safe logging utility
     * @param {string} level - Log level (info, warn, error)
     * @param {string} message - Log message
     * @param {*} data - Additional data to log
     */
    function logSafe(level, message, data = null) {
        if (!DEBUG_MODE && level === 'info') return;
        
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        try {
            switch(level) {
                case 'error':
                    console.error(logMessage, data);
                    break;
                case 'warn':
                    console.warn(logMessage, data);
                    break;
                default:
                    console.log(logMessage, data);
            }
        } catch (e) {
            // Fallback if console is unavailable
        }
    }

    // ── Seuils par paramètre (caution / warning) ──
    const THRESHOLDS = {
        n1: { caution: 95, warning: 101, max: 104 },
        egt: { caution: 750, warning: 900, max: 950 },
        n2: { caution: 97, warning: 102, max: 105 },
        ff: { max: 3000 },
        oilPress: { cautionLo: 30, warningLo: 20, cautionHi: 85, warningHi: 95, max: 100 },
        vibN1: { caution: 3.0, warning: 4.5, max: 6.0 }
    };

    // ── État global ──
    const state = {
        activeSystem: 'engines',
        frozen: false,
        testMode: false,
        flightStartTime: Date.now(),
        alarms: [],
        warnCount: 0,
        cautCount: 0,
        masterStatus: 'normal', // normal | caution | warning
        sensorData: {
            eng1: { n1: 85.2, egt: 580, n2: 88.1, ff: 1240, oilPress: 62, vibN1: 1.2 },
            eng2: { n1: 84.8, egt: 575, n2: 87.6, ff: 1235, oilPress: 64, vibN1: 1.1 },
            hydraulics: {
                greenPress: 3000, bluePress: 3000, yellowPress: 3000,
                greenQty: 98, blueQty: 97, yellowQty: 99,
                greenTemp: 45, blueTemp: 43, yellowTemp: 46
            },
            electrical: {
                acBus1V: 115, acBus2V: 115, dcBus1V: 28, dcBus2V: 28,
                gen1Load: 42, gen2Load: 45, apuGenLoad: 0,
                batV: 28.5, batTemp: 22
            },
            pressurization: {
                cabinAlt: 6200, deltaP: 7.8, cabinRate: -300,
                outflowValve: 42, safetyValve: 0, packFlow1: 100, packFlow2: 100
            },
            flightControls: {
                elac1: 'ON', elac2: 'ON', sec1: 'ON', sec2: 'ON', sec3: 'ON',
                fac1: 'ON', fac2: 'ON',
                aileronL: 0, aileronR: 0, elevatorL: 0, elevatorR: 0,
                rudder: 0, slatPos: 0, flapPos: 0
            },
            fuel: {
                innerL: 4250, innerR: 4230, center: 1800, totalFuel: 10280,
                fuelFlow: 2475, fuelTemp: -18, xFeed: 'CLOSED'
            },
            apu: {
                apuN: 0, apuEgt: 0, apuBleed: 'OFF', apuGen: 'OFF',
                apuOilPress: 0, apuStatus: 'OFF'
            }
        }
    };

    // ── System panel definitions ──
    const SYSTEM_PANELS = {
        engines: {
            title: '<i class="fas fa-fan"></i> MOTEURS — CFM56-5B4',
            panelId: 'engines-panel'
        },
        hydraulics: {
            title: '<i class="fas fa-tint"></i> HYDRAULIQUE — 3 Circuits',
            panelId: 'hydraulics-panel',
            paramsId: 'hyd-params',
            params: [
                { key: 'greenPress', label: 'GREEN PRESS', unit: 'PSI', max: 3500, caution: 2500, warning: 1500 },
                { key: 'bluePress', label: 'BLUE PRESS', unit: 'PSI', max: 3500, caution: 2500, warning: 1500 },
                { key: 'yellowPress', label: 'YELLOW PRESS', unit: 'PSI', max: 3500, caution: 2500, warning: 1500 },
                { key: 'greenQty', label: 'GREEN QTY', unit: '%', max: 100 },
                { key: 'blueQty', label: 'BLUE QTY', unit: '%', max: 100 },
                { key: 'yellowQty', label: 'YELLOW QTY', unit: '%', max: 100 },
                { key: 'greenTemp', label: 'GREEN TEMP', unit: '°C', max: 120, caution: 85, warning: 100 },
                { key: 'blueTemp', label: 'BLUE TEMP', unit: '°C', max: 120, caution: 85, warning: 100 },
                { key: 'yellowTemp', label: 'YELLOW TEMP', unit: '°C', max: 120, caution: 85, warning: 100 }
            ]
        },
        electrical: {
            title: '<i class="fas fa-bolt"></i> ÉLECTRIQUE — AC/DC',
            panelId: 'electrical-panel',
            paramsId: 'elec-params',
            params: [
                { key: 'acBus1V', label: 'AC BUS 1', unit: 'V', max: 130, caution: 105, warning: 95 },
                { key: 'acBus2V', label: 'AC BUS 2', unit: 'V', max: 130, caution: 105, warning: 95 },
                { key: 'dcBus1V', label: 'DC BUS 1', unit: 'V', max: 32, caution: 25, warning: 22 },
                { key: 'dcBus2V', label: 'DC BUS 2', unit: 'V', max: 32, caution: 25, warning: 22 },
                { key: 'gen1Load', label: 'GEN 1 LOAD', unit: '%', max: 100, caution: 80, warning: 95 },
                { key: 'gen2Load', label: 'GEN 2 LOAD', unit: '%', max: 100, caution: 80, warning: 95 },
                { key: 'batV', label: 'BAT VOLTAGE', unit: 'V', max: 32 },
                { key: 'batTemp', label: 'BAT TEMP', unit: '°C', max: 70, caution: 45, warning: 55 }
            ]
        },
        pressurization: {
            title: '<i class="fas fa-compress-arrows-alt"></i> PRESSURISATION',
            panelId: 'pressurization-panel',
            paramsId: 'press-params',
            params: [
                { key: 'cabinAlt', label: 'CABIN ALT', unit: 'ft', max: 14000, caution: 8000, warning: 10000 },
                { key: 'deltaP', label: 'DELTA P', unit: 'PSI', max: 9.5, caution: 8.5, warning: 9.0 },
                { key: 'cabinRate', label: 'CABIN RATE', unit: 'ft/min', max: 2000 },
                { key: 'outflowValve', label: 'OUTFLOW VALVE', unit: '%', max: 100 },
                { key: 'packFlow1', label: 'PACK 1 FLOW', unit: '%', max: 100 },
                { key: 'packFlow2', label: 'PACK 2 FLOW', unit: '%', max: 100 }
            ]
        },
        'flight-controls': {
            title: '<i class="fas fa-sliders-h"></i> COMMANDES DE VOL — EFCS',
            panelId: 'flight-controls-panel',
            paramsId: 'fctl-params',
            params: [
                { key: 'aileronL', label: 'AILERON L', unit: '°', max: 25, isControl: true },
                { key: 'aileronR', label: 'AILERON R', unit: '°', max: 25, isControl: true },
                { key: 'elevatorL', label: 'ELEVATOR L', unit: '°', max: 30, isControl: true },
                { key: 'elevatorR', label: 'ELEVATOR R', unit: '°', max: 30, isControl: true },
                { key: 'rudder', label: 'RUDDER', unit: '°', max: 30, isControl: true },
                { key: 'slatPos', label: 'SLAT POS', unit: '°', max: 27 },
                { key: 'flapPos', label: 'FLAP POS', unit: '°', max: 40 }
            ]
        },
        fuel: {
            title: '<i class="fas fa-gas-pump"></i> CARBURANT',
            panelId: 'fuel-panel',
            paramsId: 'fuel-params',
            params: [
                { key: 'innerL', label: 'INNER L', unit: 'kg', max: 5500 },
                { key: 'innerR', label: 'INNER R', unit: 'kg', max: 5500 },
                { key: 'center', label: 'CENTER', unit: 'kg', max: 6300 },
                { key: 'totalFuel', label: 'TOTAL FUEL', unit: 'kg', max: 18000, caution: 2500, warning: 1500 },
                { key: 'fuelFlow', label: 'FUEL FLOW', unit: 'kg/h', max: 4000 },
                { key: 'fuelTemp', label: 'FUEL TEMP', unit: '°C', max: 50 }
            ]
        },
        apu: {
            title: '<i class="fas fa-cog"></i> APU — APS3200',
            panelId: 'apu-panel',
            paramsId: 'apu-params',
            params: [
                { key: 'apuN', label: 'APU N', unit: '%', max: 105 },
                { key: 'apuEgt', label: 'APU EGT', unit: '°C', max: 700, caution: 600, warning: 650 },
                { key: 'apuOilPress', label: 'APU OIL PRESS', unit: 'PSI', max: 100 }
            ]
        }
    };

    // ── Fault code database ──
    const FAULT_CODES = [
        { code: 'ENG-N1-HI', msg: 'ENGINE 1 N1 ABOVE LIMIT', sys: 'engines', level: 'warning' },
        { code: 'ENG-EGT-HI', msg: 'ENGINE EGT EXCEEDANCE', sys: 'engines', level: 'warning' },
        { code: 'ENG-OIL-LO', msg: 'ENGINE OIL PRESSURE LOW', sys: 'engines', level: 'caution' },
        { code: 'ENG-VIB-HI', msg: 'ENGINE VIBRATION HIGH', sys: 'engines', level: 'caution' },
        { code: 'HYD-GRN-LO', msg: 'GREEN HYDRAULIC PRESSURE LOW', sys: 'hydraulics', level: 'warning' },
        { code: 'HYD-BLU-LO', msg: 'BLUE HYDRAULIC PRESSURE LOW', sys: 'hydraulics', level: 'caution' },
        { code: 'ELEC-GEN-HI', msg: 'AC GENERATOR OVERLOAD', sys: 'electrical', level: 'caution' },
        { code: 'ELEC-BAT-HI', msg: 'BATTERY TEMPERATURE HIGH', sys: 'electrical', level: 'warning' },
        { code: 'PRESS-CAB-HI', msg: 'CABIN ALTITUDE HIGH', sys: 'pressurization', level: 'warning' },
        { code: 'PRESS-DP-HI', msg: 'CABIN DIFFERENTIAL PRESSURE HIGH', sys: 'pressurization', level: 'caution' },
        { code: 'FCTL-ELAC-1', msg: 'ELAC 1 FAULT', sys: 'flight-controls', level: 'warning' },
        { code: 'FUEL-QTY-LO', msg: 'FUEL QUANTITY LOW', sys: 'fuel', level: 'caution' },
        { code: 'FUEL-TEMP-HI', msg: 'FUEL TEMPERATURE HIGH', sys: 'fuel', level: 'caution' }
    ];


    // ═══════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════
    // v2.6.0 ENHANCEMENTS INITIALIZATION
    // ═══════════════════════════════════════════════════════

    /**
     * Initialize v2.6.0 enhancement features
     */
    function initEnhancements() {
        // Wait for ES6 modules to load before initializing
        const tryInit = () => {
            // Initialize language selector (v2.6.0)
            if (window.i18n) {
                const container = document.getElementById('language-selector-container');
                if (container && !container.hasChildNodes()) {
                    // Apply initial translations to DOM elements
                    window.i18n.updateDOM();
                    
                    const selector = window.i18n.createLanguageSelector();
                    container.appendChild(selector);
                    
                    // Listen for language changes to update app state labels
                    document.addEventListener('languageChanged', (e) => {
                        console.log('[APP] Language changed to:', e.detail.language);
                        // Refresh dynamic content
                        renderAlarmLog();
                        updateMasterStatus();
                    });
                }
            }

            // Initialize profile selector (v2.7.0)
            if (window.userProfiles) {
                const profileContainer = document.getElementById('profile-selector-container');
                if (profileContainer && !profileContainer.hasChildNodes()) {
                    const profileSelector = window.userProfiles.createProfileSelector();
                    profileContainer.appendChild(profileSelector);
                    
                    // Apply current profile preferences
                    const currentProfile = window.userProfiles.getCurrentProfile();
                    if (currentProfile) {
                        window.userProfiles.applyProfilePreferences(currentProfile);
                        console.log('[APP] Profile preferences applied:', currentProfile.name);
                    }

                    // Increment session count
                    window.userProfiles.incrementSession();
                }
            }

            // Initialize theme manager (v2.7.0)
            if (window.themeManager) {
                console.log('[APP] Theme manager initialized:', window.themeManager.getCurrentTheme());
            }

            // Initialize audio manager (v2.7.0)
            if (window.audioManager) {
                // Start ambient cockpit sounds only if explicitly enabled by user
                const profile = window.userProfiles?.getCurrentProfile();
                if (profile?.preferences.soundEffects && profile?.preferences.ambientSounds) {
                    window.audioManager.setAmbientEnabled(true);
                }
                console.log('[APP] Audio manager initialized');
            }

            // Initialize touch gestures (v2.7.0)
            if (window.touchGestures) {
                console.log('[APP] Touch gestures initialized');
            }

            // Initialize animations (v2.7.0)
            if (window.animations) {
                console.log('[APP] Animations manager initialized');
            }
        };

        // Try immediately
        tryInit();
        
        // Retry after a short delay in case modules aren't loaded yet
        setTimeout(tryInit, 100);
        setTimeout(tryInit, 500);
    }

    // ═══════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════

    function init() {
        bindEvents();
        renderGenericPanels();
        
        // Initialize v2.6.0 features
        initEnhancements();
        
        // Initialize simulation manager UI
        simulationManager.initUI();
        
        // Expose fault injection for training mode
        window.triggerTestFault = (faultCode, details = {}) => {
            // Map training fault codes to simulation fault types
            const faultMapping = {
                // Engine faults
                'ENG-N1-HI': { type: 'ENG_FLAMEOUT', target: details.engine === 1 ? 'eng1' : 'eng2' },
                'ENG-EGT-HI': { type: 'ENG_OVERHEAT', target: details.engine === 1 ? 'eng1' : 'eng2' },
                'ENG-FAIL': { type: 'ENG_FLAMEOUT', target: details.engine === 1 ? 'eng1' : 'eng2' },
                'ENG-FIRE': { type: 'ENG_OVERHEAT', target: details.engine === 1 ? 'eng1' : 'eng2' },
                'ENG-OIL-LO': { type: 'ENG_OIL_LOSS', target: details.engine === 1 ? 'eng1' : 'eng2' },
                'ENG-VIB-HI': { type: 'ENG_HIGH_VIB', target: details.engine === 1 ? 'eng1' : 'eng2' },
                
                // Hydraulic faults
                'HYD-GRN-LO': { type: 'HYD_LEAK', target: 'green' },
                'HYD-YEL-LO': { type: 'HYD_LEAK', target: 'yellow' },
                'HYD-BLU-LO': { type: 'HYD_LEAK', target: 'blue' },
                
                // Electrical faults
                'ELEC-GEN-HI': { type: 'ELEC_GEN_FAIL', target: details.generator === 1 ? 'gen1' : 'gen2' },
                'ELEC-GEN-FAIL': { type: 'ELEC_GEN_FAIL', target: details.generator === 1 ? 'gen1' : 'gen2' },
                
                // Pressurization faults
                'PRESS-CAB-HI': { type: 'PRESS_LOSS', target: null },
                'PRESS-LOSS': { type: 'PRESS_LOSS', target: null },
                
                // Fuel faults
                'FUEL-LEAK': { type: 'FUEL_LEAK', target: details.tank || null },
                'FUEL-IMBALANCE': { type: 'FUEL_IMBALANCE', target: null }
            };
            
            const fault = faultMapping[faultCode];
            if (fault) {
                console.log(`[TRAINING] Injecting fault: ${faultCode} -> ${fault.type} (${fault.target || 'none'})`);
                simulationManager.injectFault(fault.type, fault.target);
                return true;
            } else {
                console.warn(`[TRAINING] Unknown fault code: ${faultCode}`);
                return false;
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
        setInterval(() => {
            if (!state.frozen) {
                // Utiliser le modèle de vol réaliste
                simulationManager.update(state.frozen);
                state.sensorData = simulationManager.getSensorData();
                updateAllDisplays();
                simulationManager.updateScenarioDisplay();
                simulationManager.updateFaultDisplay();
            }
        }, UPDATE_INTERVAL);
        setInterval(() => {
            if (!state.frozen) randomAlarmCheck();
        }, ALARM_CHECK_INTERVAL);
        // Initial display
        updateAllDisplays();
    }


    // ═══════════════════════════════════════════════════════
    // EVENT BINDINGS
    // ═══════════════════════════════════════════════════════

    function bindEvents() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar__item').forEach(btn => {
            btn.addEventListener('click', () => switchSystem(btn.dataset.system));
        });

        // Freeze / Snapshot
        document.getElementById('btn-freeze').addEventListener('click', toggleFreeze);
        document.getElementById('btn-snapshot').addEventListener('click', takeSnapshot);

        // Acknowledge / Reset
        document.getElementById('btn-ack').addEventListener('click', acknowledgeAll);
        document.getElementById('btn-reset').addEventListener('click', resetSystem);
        document.getElementById('btn-export').addEventListener('click', () => {
            // Use new export manager if available, otherwise fallback to old export
            if (window.exportManager) {
                window.exportManager.showExportDialog();
            } else {
                exportReport();
            }
        });
        document.getElementById('btn-test-mode').addEventListener('click', toggleTestMode);

        // v2.6.0 Enhancement Features
        document.getElementById('btn-analytics')?.addEventListener('click', () => {
            if (window.analytics) {
                window.analytics.show();
            } else {
                console.error('Analytics module not loaded');
            }
        });

        document.getElementById('btn-documentation')?.addEventListener('click', () => {
            if (window.documentation) {
                window.documentation.show('quick-start');
            } else {
                console.error('Documentation module not loaded');
            }
        });

        // v2.7.0 UX Enhancement Features
        document.getElementById('btn-theme-settings')?.addEventListener('click', () => {
            if (window.themeManager) {
                window.themeManager.showSettings();
            } else {
                console.error('Theme manager module not loaded');
            }
        });

        document.getElementById('btn-audio-settings')?.addEventListener('click', () => {
            if (window.audioManager) {
                window.audioManager.showSettings();
            } else {
                console.error('Audio manager module not loaded');
            }
        });

        // Simulation panel toggle
        document.getElementById('btn-simulation')?.addEventListener('click', () => {
            const panel = document.getElementById('simulation-panel');
            if (panel) {
                const isVisible = panel.style.display !== 'none';
                panel.style.display = isVisible ? 'none' : 'block';
            }
        });

        document.getElementById('close-simulation-panel')?.addEventListener('click', () => {
            const panel = document.getElementById('simulation-panel');
            if (panel) {
                panel.style.display = 'none';
            }
        });

        // Show FDR playback controls when file is loaded
        document.getElementById('fdr-file-input')?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const playbackPanel = document.getElementById('fdr-playback');
                if (playbackPanel) {
                    playbackPanel.style.display = 'block';
                }
            }
        });

        // Master buttons
        document.getElementById('btn-master-warn').addEventListener('click', () => flashMaster('warning'));
        document.getElementById('btn-master-caut').addEventListener('click', () => flashMaster('caution'));

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    /**
     * Handle keyboard shortcuts for accessibility
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleKeyboardShortcuts(e) {
        // Ignore if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key.toLowerCase();
        
        switch(key) {
            case 'f':
                e.preventDefault();
                toggleFreeze();
                logSafe('info', 'Keyboard shortcut: Freeze toggled');
                break;
            case 's':
                e.preventDefault();
                takeSnapshot();
                logSafe('info', 'Keyboard shortcut: Snapshot taken');
                break;
            case 'a':
                e.preventDefault();
                acknowledgeAll();
                logSafe('info', 'Keyboard shortcut: All alarms acknowledged');
                break;
            case 'r':
                if (e.ctrlKey || e.metaKey) return; // Don't override browser refresh
                e.preventDefault();
                resetSystem();
                logSafe('info', 'Keyboard shortcut: System reset');
                break;
            case 't':
                e.preventDefault();
                toggleTestMode();
                logSafe('info', 'Keyboard shortcut: Test mode toggled');
                break;
            case 'escape':
                e.preventDefault();
                acknowledgeAll();
                logSafe('info', 'Keyboard shortcut: Alarms dismissed');
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
                e.preventDefault();
                const systems = ['engines', 'hydraulics', 'electrical', 'pressurization', 'flight-controls', 'fuel', 'apu'];
                const index = parseInt(key) - 1;
                if (systems[index]) {
                    switchSystem(systems[index]);
                    logSafe('info', `Keyboard shortcut: Switched to ${systems[index]}`);
                }
                break;
        }
    }


    // ═══════════════════════════════════════════════════════
    // CLOCK
    // ═══════════════════════════════════════════════════════

    function updateClock() {
        const now = new Date();
        const utc = now.toISOString().substr(11, 8);
        document.getElementById('utc-clock').textContent = utc;

        const elapsed = Date.now() - state.flightStartTime;
        const h = String(Math.floor(elapsed / 3600000)).padStart(2, '0');
        const m = String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
        document.getElementById('flt-time').textContent = `${h}:${m}:${s}`;
    }


    // ═══════════════════════════════════════════════════════
    // SENSOR SIMULATION
    // ═══════════════════════════════════════════════════════
    
    // NOTE: La simulation basique de capteurs a été remplacée par le modèle
    // de vol réaliste (SimulationManager). L'ancienne fonction simulateSensors()
    // est conservée ci-dessous pour référence mais n'est plus utilisée.
    
    // Les données proviennent maintenant de:
    // - simulation/flight-model.js (physique de vol A320)
    // - simulation/fault-injection.js (pannes et scénarios)
    // - simulation/fdr-replay.js (rejeu de données FDR)

    /**
     * Validate and clamp a numeric value within bounds
     * @param {number} value - Value to validate
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {number} Clamped value
     */
    function validateValue(value, min, max) {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            console.warn(`Invalid sensor value: ${value}`);
            return (min + max) / 2; // Return midpoint as safe default
        }
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Add controlled jitter to a value for simulation
     * @param {number} value - Base value
     * @param {number} range - Jitter range
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Jittered value
     */
    function jitter(value, range, min = 0, max = Infinity) {
        const delta = (Math.random() - 0.5) * 2 * range;
        const newValue = value + delta;
        return validateValue(newValue, min, max);
    }

    // LEGACY: Ancienne simulation simplifiée (non utilisée)
    /*
    function simulateSensors() {
        const d = state.sensorData;

        // Engines
        for (const eng of ['eng1', 'eng2']) {
            d[eng].n1 = jitter(d[eng].n1, 0.3, 60, 104);
            d[eng].egt = jitter(d[eng].egt, 5, 350, 950);
            d[eng].n2 = jitter(d[eng].n2, 0.2, 65, 105);
            d[eng].ff = jitter(d[eng].ff, 15, 800, 3000);
            d[eng].oilPress = jitter(d[eng].oilPress, 1, 10, 95);
            d[eng].vibN1 = jitter(d[eng].vibN1, 0.15, 0.3, 5.5);
        }

        // Hydraulics
        d.hydraulics.greenPress = jitter(d.hydraulics.greenPress, 20, 500, 3500);
        d.hydraulics.bluePress = jitter(d.hydraulics.bluePress, 20, 500, 3500);
        d.hydraulics.yellowPress = jitter(d.hydraulics.yellowPress, 20, 500, 3500);
        d.hydraulics.greenQty = jitter(d.hydraulics.greenQty, 0.3, 70, 100);
        d.hydraulics.blueQty = jitter(d.hydraulics.blueQty, 0.3, 70, 100);
        d.hydraulics.yellowQty = jitter(d.hydraulics.yellowQty, 0.3, 70, 100);
        d.hydraulics.greenTemp = jitter(d.hydraulics.greenTemp, 0.5, 20, 100);
        d.hydraulics.blueTemp = jitter(d.hydraulics.blueTemp, 0.5, 20, 100);
        d.hydraulics.yellowTemp = jitter(d.hydraulics.yellowTemp, 0.5, 20, 100);

        // Electrical
        d.electrical.acBus1V = jitter(d.electrical.acBus1V, 0.3, 90, 125);
        d.electrical.acBus2V = jitter(d.electrical.acBus2V, 0.3, 90, 125);
        d.electrical.dcBus1V = jitter(d.electrical.dcBus1V, 0.1, 20, 30);
        d.electrical.dcBus2V = jitter(d.electrical.dcBus2V, 0.1, 20, 30);
        d.electrical.gen1Load = jitter(d.electrical.gen1Load, 1, 10, 95);
        d.electrical.gen2Load = jitter(d.electrical.gen2Load, 1, 10, 95);
        d.electrical.batV = jitter(d.electrical.batV, 0.05, 24, 30);
        d.electrical.batTemp = jitter(d.electrical.batTemp, 0.3, 15, 55);

        // Pressurization
        d.pressurization.cabinAlt = jitter(d.pressurization.cabinAlt, 30, 0, 12000);
        d.pressurization.deltaP = jitter(d.pressurization.deltaP, 0.05, 0, 9.2);
        d.pressurization.cabinRate = jitter(d.pressurization.cabinRate, 20, -600, 800);
        d.pressurization.outflowValve = jitter(d.pressurization.outflowValve, 1, 0, 100);
        d.pressurization.packFlow1 = jitter(d.pressurization.packFlow1, 1, 80, 100);
        d.pressurization.packFlow2 = jitter(d.pressurization.packFlow2, 1, 80, 100);

        // Flight controls — small deflections
        d.flightControls.aileronL = jitter(d.flightControls.aileronL, 0.5, -20, 20);
        d.flightControls.aileronR = -d.flightControls.aileronL;
        d.flightControls.elevatorL = jitter(d.flightControls.elevatorL, 0.3, -25, 25);
        d.flightControls.elevatorR = d.flightControls.elevatorL + jitter(0, 0.1, -1, 1);
        d.flightControls.rudder = jitter(d.flightControls.rudder, 0.2, -25, 25);

        // Fuel — slowly decreasing
        const fuelBurn = d.fuel.fuelFlow / 3600; // per second
        d.fuel.innerL = Math.max(0, d.fuel.innerL - fuelBurn * 0.4 + jitter(0, 0.5));
        d.fuel.innerR = Math.max(0, d.fuel.innerR - fuelBurn * 0.4 + jitter(0, 0.5));
        d.fuel.center = Math.max(0, d.fuel.center - fuelBurn * 0.2 + jitter(0, 0.3));
        d.fuel.totalFuel = d.fuel.innerL + d.fuel.innerR + d.fuel.center;
        d.fuel.fuelFlow = jitter(d.fuel.fuelFlow, 10, 2000, 3500);
        d.fuel.fuelTemp = jitter(d.fuel.fuelTemp, 0.2, -40, 30);
    }
    */
    // Fin de l'ancienne fonction simulateSensors (remplacée par SimulationManager)


    // ═══════════════════════════════════════════════════════
    // DISPLAY UPDATES
    // ═══════════════════════════════════════════════════════

    function updateAllDisplays() {
        updateEngineDisplay();
        updateGenericPanels();
        updateMasterStatus();
    }

    // ── Engine displays ──
    function updateEngineDisplay() {
        for (const eng of ['eng1', 'eng2']) {
            const d = state.sensorData[eng];

            // N1 Ring
            const n1Pct = d.n1 / THRESHOLDS.n1.max;
            updateRingGauge(`${eng}-n1-ring`, n1Pct);
            updateValueDisplay(`${eng}-n1-val`, d.n1.toFixed(1), getStatus(d.n1, THRESHOLDS.n1));
            updateRingColor(`${eng}-n1-ring`, getStatus(d.n1, THRESHOLDS.n1));

            // EGT Bar
            const egtPct = (d.egt / THRESHOLDS.egt.max) * 100;
            updateBarGauge(`${eng}-egt-bar`, egtPct, getStatus(d.egt, THRESHOLDS.egt));
            updateValueDisplay(`${eng}-egt-val`, Math.round(d.egt), getStatus(d.egt, THRESHOLDS.egt));

            // N2 Bar
            const n2Pct = (d.n2 / THRESHOLDS.n2.max) * 100;
            updateBarGauge(`${eng}-n2-bar`, n2Pct, getStatus(d.n2, THRESHOLDS.n2));
            updateValueDisplay(`${eng}-n2-val`, d.n2.toFixed(1), getStatus(d.n2, THRESHOLDS.n2));

            // FF Bar
            const ffPct = (d.ff / THRESHOLDS.ff.max) * 100;
            document.getElementById(`${eng}-ff-bar`).style.width = `${Math.min(100, ffPct)}%`;
            document.getElementById(`${eng}-ff-val`).textContent = Math.round(d.ff);

            // Oil Pressure
            const oilStatus = getStatusOil(d.oilPress);
            updateValueDisplay(`${eng}-oil-val`, Math.round(d.oilPress), oilStatus);

            // Vibration
            const vibStatus = getStatus(d.vibN1, THRESHOLDS.vibN1);
            updateValueDisplay(`${eng}-vib-val`, d.vibN1.toFixed(1), vibStatus);

            // Card highlights
            updateCardStatus(`${eng}-n1`, getStatus(d.n1, THRESHOLDS.n1));
            updateCardStatus(`${eng}-egt`, getStatus(d.egt, THRESHOLDS.egt));
            updateCardStatus(`${eng}-oil`, oilStatus);
            updateCardStatus(`${eng}-vib`, vibStatus);
        }
    }

    function getStatus(value, threshold) {
        if (threshold.warning !== undefined && value >= threshold.warning) return 'warning';
        if (threshold.caution !== undefined && value >= threshold.caution) return 'caution';
        return 'normal';
    }

    function getStatusOil(value) {
        if (value <= THRESHOLDS.oilPress.warningLo || value >= THRESHOLDS.oilPress.warningHi) return 'warning';
        if (value <= THRESHOLDS.oilPress.cautionLo || value >= THRESHOLDS.oilPress.cautionHi) return 'caution';
        return 'normal';
    }

    function updateRingGauge(id, pct) {
        const el = document.getElementById(id);
        if (!el) {
            logSafe('warn', `Ring gauge element not found: ${id}`);
            return;
        }
        const circumference = 2 * Math.PI * 52;
        const offset = circumference * (1 - Math.min(1, pct));
        el.style.strokeDashoffset = offset;
    }

    function updateRingColor(id, status) {
        const el = document.getElementById(id);
        if (!el) {
            logSafe('warn', `Ring element not found: ${id}`);
            return;
        }
        el.classList.remove('ring-gauge__fill--normal', 'ring-gauge__fill--caution', 'ring-gauge__fill--warning');
        el.classList.add(`ring-gauge__fill--${status}`);
    }

    function updateBarGauge(id, pct, status) {
        const el = document.getElementById(id);
        if (!el) {
            logSafe('warn', `Bar gauge element not found: ${id}`);
            return;
        }
        el.style.width = `${Math.min(100, pct)}%`;
        el.classList.remove('bar-gauge__fill--normal', 'bar-gauge__fill--caution', 'bar-gauge__fill--warning');
        el.classList.add(`bar-gauge__fill--${status}`);
    }

    function updateValueDisplay(id, value, status) {
        const el = document.getElementById(id);
        if (!el) {
            logSafe('warn', `Value display element not found: ${id}`);
            return;
        }
        el.textContent = value;
        el.classList.remove('gauge-card__value--caution', 'gauge-card__value--warning');
        if (status === 'caution') el.classList.add('gauge-card__value--caution');
        if (status === 'warning') el.classList.add('gauge-card__value--warning');

        // Update inline values' color for horizontal cards
        if (el.classList.contains('gauge-card__value--inline')) {
            if (status === 'normal') {
                el.style.color = '';
                el.style.textShadow = '';
            }
        }
    }

    function updateCardStatus(id, status) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('gauge-card--caution', 'gauge-card--warning');
        if (status !== 'normal') el.classList.add(`gauge-card--${status}`);
    }


    // ── Generic panel rendering ──
    function renderGenericPanels() {
        Object.entries(SYSTEM_PANELS).forEach(([sysKey, cfg]) => {
            if (sysKey === 'engines' || !cfg.params) return;
            const container = document.getElementById(cfg.paramsId);
            if (!container) return;

            container.innerHTML = cfg.params.map(p => `
                <div class="param-card" id="param-${sysKey}-${p.key}">
                    <div class="param-card__header">
                        <span class="param-card__name">${p.label}</span>
                        <span class="param-card__unit">${p.unit}</span>
                    </div>
                    <div class="param-card__body">
                        <span class="param-card__value" id="pval-${sysKey}-${p.key}">--</span>
                        <div class="param-card__bar">
                            <div class="param-card__bar-fill" id="pbar-${sysKey}-${p.key}" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            `).join('');
        });
    }

    function updateGenericPanels() {
        Object.entries(SYSTEM_PANELS).forEach(([sysKey, cfg]) => {
            if (sysKey === 'engines' || !cfg.params) return;

            const dataKey = sysKey === 'flight-controls' ? 'flightControls' : sysKey;
            const data = state.sensorData[dataKey];
            if (!data) return;

            cfg.params.forEach(p => {
                const val = data[p.key];
                if (val === undefined) return;

                const valEl = document.getElementById(`pval-${sysKey}-${p.key}`);
                const barEl = document.getElementById(`pbar-${sysKey}-${p.key}`);
                const cardEl = document.getElementById(`param-${sysKey}-${p.key}`);

                if (!valEl) return;

                // Determine display value
                if (typeof val === 'string') {
                    valEl.textContent = val;
                    return;
                }

                const displayVal = Math.abs(val) >= 100 ? Math.round(val) : val.toFixed(1);
                valEl.textContent = displayVal;

                // Bar fill
                if (barEl && p.max) {
                    const absVal = Math.abs(val);
                    const pct = (absVal / p.max) * 100;
                    barEl.style.width = `${Math.min(100, pct)}%`;
                }

                // Status coloring
                let status = 'normal';
                if (p.warning !== undefined && Math.abs(val) >= p.warning) status = 'warning';
                else if (p.caution !== undefined && Math.abs(val) >= p.caution) status = 'caution';

                valEl.classList.remove('param-card__value--caution', 'param-card__value--warning');
                if (status !== 'normal') valEl.classList.add(`param-card__value--${status}`);

                if (cardEl) {
                    cardEl.classList.remove('param-card--caution', 'param-card--warning');
                    if (status !== 'normal') cardEl.classList.add(`param-card--${status}`);
                }

                if (barEl) {
                    barEl.style.background = '';
                    if (status === 'caution') barEl.style.background = 'linear-gradient(90deg, var(--status-caution), #ee9900)';
                    if (status === 'warning') barEl.style.background = 'linear-gradient(90deg, var(--status-warning), #ee2233)';
                }
            });
        });
    }


    // ═══════════════════════════════════════════════════════
    // SYSTEM NAVIGATION
    // ═══════════════════════════════════════════════════════

    function switchSystem(sysKey) {
        state.activeSystem = sysKey;

        // Update sidebar
        document.querySelectorAll('.sidebar__item').forEach(el => {
            const isActive = el.dataset.system === sysKey;
            el.classList.toggle('sidebar__item--active', isActive);
            el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        // Update title
        const cfg = SYSTEM_PANELS[sysKey];
        if (cfg) {
            document.getElementById('diag-title').innerHTML = cfg.title;
        }

        // Show/hide panels
        const allPanels = ['engines-panel', 'hydraulics-panel', 'electrical-panel',
            'pressurization-panel', 'flight-controls-panel', 'fuel-panel', 'apu-panel'];

        allPanels.forEach(pid => {
            const el = document.getElementById(pid);
            if (!el) return;
            if (pid === cfg.panelId) {
                el.classList.remove('hidden');
                el.setAttribute('aria-hidden', 'false');
            } else {
                el.classList.add('hidden');
                el.setAttribute('aria-hidden', 'true');
            }
        });

        // Special: engines has section label and dual grid wrapper
        const sectionLabel = document.querySelector('.diagnostic__section-label');
        if (sectionLabel) {
            sectionLabel.style.display = sysKey === 'engines' ? '' : 'none';
        }

        logSafe('info', `Switched to system: ${sysKey}`);
    }


    // ═══════════════════════════════════════════════════════
    // ALARM SYSTEM
    // ═══════════════════════════════════════════════════════

    function randomAlarmCheck() {
        // Small random chance of triggering a fault
        if (Math.random() > 0.15) return; // 15% chance per check

        const fault = FAULT_CODES[Math.floor(Math.random() * FAULT_CODES.length)];

        // Don't add duplicate active faults
        if (state.alarms.some(a => a.code === fault.code && !a.acknowledged)) return;

        addAlarm(fault);
    }

    function addAlarm(fault) {
        const now = new Date();
        const time = now.toISOString().substr(11, 8);

        const alarm = {
            id: Date.now(),
            time,
            code: fault.code,
            msg: fault.msg,
            level: fault.level,
            sys: fault.sys,
            acknowledged: false
        };

        state.alarms.unshift(alarm);
        if (state.alarms.length > MAX_LOG_ENTRIES) state.alarms.pop();

        // Trigger voice alert if features loaded
        if (window.appFeatures) {
            window.appFeatures.triggerVoiceAlertForFault(fault.code, fault.level);
        }

        // Update counts
        updateAlarmCounts();

        // Update sidebar system status
        updateSystemStatuses();

        // Render log entry
        renderAlarmLog();

        // Audio feedback indicator (flash)
        flashMaster(fault.level);
    }

    function updateAlarmCounts() {
        const active = state.alarms.filter(a => !a.acknowledged);
        state.warnCount = active.filter(a => a.level === 'warning').length;
        state.cautCount = active.filter(a => a.level === 'caution').length;

        document.querySelector('#warn-count span').textContent = state.warnCount;
        document.querySelector('#caut-count span').textContent = state.cautCount;

        // Update badges
        const warnBadge = document.getElementById('master-warn-badge');
        const cautBadge = document.getElementById('master-caut-badge');

        if (state.warnCount > 0) {
            warnBadge.textContent = state.warnCount;
            warnBadge.classList.remove('hidden');
        } else {
            warnBadge.classList.add('hidden');
        }

        if (state.cautCount > 0) {
            cautBadge.textContent = state.cautCount;
            cautBadge.classList.remove('hidden');
        } else {
            cautBadge.classList.add('hidden');
        }
    }

    function updateSystemStatuses() {
        const active = state.alarms.filter(a => !a.acknowledged);
        const systemStatus = {};

        active.forEach(a => {
            const current = systemStatus[a.sys] || 'normal';
            if (a.level === 'warning') systemStatus[a.sys] = 'warning';
            else if (a.level === 'caution' && current !== 'warning') systemStatus[a.sys] = 'caution';
        });

        // Update each sidebar item's status icon
        Object.keys(SYSTEM_PANELS).forEach(sysKey => {
            const statusEl = document.getElementById(`sys-${sysKey}-status`);
            if (!statusEl) return;

            const status = systemStatus[sysKey] || 'normal';
            statusEl.classList.remove('sidebar__item-status--normal', 'sidebar__item-status--caution', 'sidebar__item-status--warning');
            statusEl.classList.add(`sidebar__item-status--${status}`);

            if (status === 'normal') {
                statusEl.innerHTML = '<i class="fas fa-check-circle"></i>';
            } else if (status === 'caution') {
                statusEl.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
            } else {
                statusEl.innerHTML = '<i class="fas fa-times-circle"></i>';
            }
        });
    }

    function renderAlarmLog() {
        const list = document.getElementById('alarm-list');
        
        // Helper to get translations
        const t = (key) => window.i18n ? window.i18n.t(key) : key;
        
        if (state.alarms.length === 0) {
            const noFaultsMsg = t('msg.no_faults');
            list.innerHTML = `
                <div class="alarm-log__empty">
                    <i class="fas fa-shield-alt"></i>
                    <span>${noFaultsMsg}</span>
                </div>`;
            return;
        }

        const procBtnText = t('proc.button');
        const procViewTitle = t('proc.view');
        
        list.innerHTML = state.alarms.map(a => `
            <div class="alarm-entry alarm-entry--${a.level}" style="${a.acknowledged ? 'opacity: 0.4;' : ''}">
                <div class="alarm-entry__time">${a.time} UTC</div>
                <div class="alarm-entry__code">${a.acknowledged ? '✓ ' : ''}${a.code}</div>
                <div class="alarm-entry__msg">${a.msg}</div>
                <button class="alarm-entry__proc-btn" data-fault="${a.code}" title="${procViewTitle}">
                    <i class="fas fa-book"></i> ${procBtnText}
                </button>
            </div>
        `).join('');
        
        // Add event listeners to PROC buttons
        list.querySelectorAll('.alarm-entry__proc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const faultCode = e.currentTarget.dataset.fault;
                if (window.appFeatures) {
                    window.appFeatures.showProcedureModal(faultCode);
                }
            });
        });
    }

    function updateMasterStatus() {
        const masterEl = document.getElementById('master-status');
        const textEl = document.getElementById('master-text');
        const t = (key) => window.i18n ? window.i18n.t(key) : key;

        let status = 'normal';
        if (state.warnCount > 0) status = 'warning';
        else if (state.cautCount > 0) status = 'caution';

        masterEl.classList.remove('status--caution', 'status--warning');
        if (status === 'caution') {
            masterEl.classList.add('status--caution');
            textEl.textContent = t('topbar.status.caution');
        } else if (status === 'warning') {
            masterEl.classList.add('status--warning');
            textEl.textContent = '⚠ ' + t('topbar.status.warning');
        } else {
            textEl.textContent = t('topbar.status.normal');
        }
        state.masterStatus = status;
    }

    function flashMaster(level) {
        const btn = level === 'warning'
            ? document.getElementById('btn-master-warn')
            : document.getElementById('btn-master-caut');

        btn.style.transform = 'scale(1.08)';
        btn.style.boxShadow = level === 'warning'
            ? '0 0 25px rgba(255, 51, 68, 0.5)'
            : '0 0 25px rgba(255, 170, 0, 0.5)';

        setTimeout(() => {
            btn.style.transform = '';
            btn.style.boxShadow = '';
        }, 600);
    }


    // ═══════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════

    function toggleFreeze() {
        state.frozen = !state.frozen;
        const btn = document.getElementById('btn-freeze');
        if (state.frozen) {
            btn.innerHTML = '<i class="fas fa-play"></i> RESUME';
            btn.classList.add('btn--active');
        } else {
            btn.innerHTML = '<i class="fas fa-pause"></i> FREEZE';
            btn.classList.remove('btn--active');
        }
    }

    function takeSnapshot() {
        const btn = document.getElementById('btn-snapshot');
        btn.innerHTML = '<i class="fas fa-check"></i> CAPTURED';
        btn.classList.add('btn--active');
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-camera"></i> SNAPSHOT';
            btn.classList.remove('btn--active');
        }, 1500);
    }

    function acknowledgeAll() {
        state.alarms.forEach(a => a.acknowledged = true);
        state.warnCount = 0;
        state.cautCount = 0;
        updateAlarmCounts();
        updateSystemStatuses();
        updateMasterStatus();
        renderAlarmLog();

        // Visual feedback
        const btn = document.getElementById('btn-ack');
        btn.innerHTML = '<i class="fas fa-check-double"></i> ACKNOWLEDGED';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check-double"></i> ACK ALL';
        }, 2000);
    }

    function resetSystem() {
        state.alarms = [];
        state.warnCount = 0;
        state.cautCount = 0;
        state.flightStartTime = Date.now();

        // Reset sensor data to nominal
        state.sensorData.eng1 = { n1: 85.2, egt: 580, n2: 88.1, ff: 1240, oilPress: 62, vibN1: 1.2 };
        state.sensorData.eng2 = { n1: 84.8, egt: 575, n2: 87.6, ff: 1235, oilPress: 64, vibN1: 1.1 };

        updateAlarmCounts();
        updateSystemStatuses();
        updateMasterStatus();
        renderAlarmLog();
        updateAllDisplays();
    }

    function exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            aircraft: document.getElementById('aircraft-reg').textContent,
            session: document.getElementById('session-id').textContent,
            alarmCount: { warnings: state.warnCount, cautions: state.cautCount },
            alarms: state.alarms.map(a => ({
                time: a.time, code: a.code, message: a.msg, level: a.level, acknowledged: a.acknowledged
            })),
            sensors: JSON.parse(JSON.stringify(state.sensorData))
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CFR_${report.session}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        const btn = document.getElementById('btn-export');
        btn.innerHTML = '<i class="fas fa-check"></i> EXPORTED';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-download"></i> EXPORT CFR';
        }, 2000);
    }

    function toggleTestMode() {
        state.testMode = !state.testMode;
        const btn = document.getElementById('btn-test-mode');

        if (state.testMode) {
            btn.classList.add('btn--active');
            btn.innerHTML = '<i class="fas fa-flask"></i> TEST ON';

            // Trigger multiple test faults
            FAULT_CODES.slice(0, 4).forEach((fault, i) => {
                setTimeout(() => addAlarm(fault), i * 500);
            });
        } else {
            btn.classList.remove('btn--active');
            btn.innerHTML = '<i class="fas fa-flask"></i> TEST MODE';
        }
    }


    // ═══════════════════════════════════════════════════════
    // BOOT
    // ═══════════════════════════════════════════════════════

    document.addEventListener('DOMContentLoaded', init);

    // Expose state for feature modules
    window.appState = state;
    window.simulationManager = simulationManager;

})();
