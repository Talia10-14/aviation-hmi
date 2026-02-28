/**
 * Simulation Manager - Intégration du modèle de vol réaliste
 * Coordonne FlightModel, FaultInjector et FlightDataReplay
 */

import { FlightModel } from './flight-model.js';
import { FaultInjector } from './fault-injection.js';
import { FlightDataReplay } from './fdr-replay.js';

class SimulationManager {
    constructor() {
        this.flightModel = new FlightModel();
        this.faultInjector = new FaultInjector(this.flightModel);
        this.fdrReplay = new FlightDataReplay(this.flightModel);
        
        this.mode = 'live'; // 'live' | 'replay'
        this.lastUpdateTime = performance.now();
        
        this.activeScenario = null;
        this.scenarioStartTime = 0;
        
        // État UI
        this.ui = {
            scenarioSelect: null,
            replayFile: null,
            replayPlayPause: null,
            replaySpeed: null,
            replayProgress: null
        };
    }

    /**
     * Initialise l'UI
     */
    initUI() {
        this.ui.scenarioSelect = document.getElementById('scenario-select');
        this.ui.replayFile = document.getElementById('fdr-file-input');
        this.ui.replayPlayPause = document.getElementById('replay-play-pause');
        this.ui.replaySpeed = document.getElementById('replay-speed');
        this.ui.replayProgress = document.getElementById('replay-progress');

        // Event listeners
        if (this.ui.scenarioSelect) {
            this.ui.scenarioSelect.addEventListener('change', (e) => {
                this.runScenario(e.target.value);
            });
        }

        if (this.ui.replayFile) {
            this.ui.replayFile.addEventListener('change', (e) => {
                this.loadFDRFile(e.target.files[0]);
            });
        }

        if (this.ui.replayPlayPause) {
            this.ui.replayPlayPause.addEventListener('click', () => {
                this.toggleReplay();
            });
        }

        if (this.ui.replaySpeed) {
            this.ui.replaySpeed.addEventListener('input', (e) => {
                this.fdrReplay.setSpeed(parseFloat(e.target.value));
                this.updateReplaySpeedDisplay();
            });
        }

        // Boutons de pannes individuelles
        this.setupFaultButtons();
    }

    /**
     * Configure les boutons de pannes individuelles
     */
    setupFaultButtons() {
        // Engine faults
        const eng1FlameoutBtn = document.getElementById('fault-eng1-flameout');
        if (eng1FlameoutBtn) {
            eng1FlameoutBtn.addEventListener('click', () => {
                this.injectFault('ENG_FLAMEOUT', 'eng1');
            });
        }

        const eng2FlameoutBtn = document.getElementById('fault-eng2-flameout');
        if (eng2FlameoutBtn) {
            eng2FlameoutBtn.addEventListener('click', () => {
                this.injectFault('ENG_FLAMEOUT', 'eng2');
            });
        }

        // Hydraulic faults
        const hydGreenLeakBtn = document.getElementById('fault-hyd-green-leak');
        if (hydGreenLeakBtn) {
            hydGreenLeakBtn.addEventListener('click', () => {
                this.injectFault('HYD_LEAK', 'green');
            });
        }

        // Electrical faults
        const elecGen1FailBtn = document.getElementById('fault-elec-gen1-fail');
        if (elecGen1FailBtn) {
            elecGen1FailBtn.addEventListener('click', () => {
                this.injectFault('ELEC_GEN_FAIL', 'gen1');
            });
        }

        // Pressurization faults
        const pressLossBtn = document.getElementById('fault-press-loss');
        if (pressLossBtn) {
            pressLossBtn.addEventListener('click', () => {
                this.injectFault('PRESS_LOSS', null);
            });
        }

        // Clear all faults
        const clearFaultsBtn = document.getElementById('clear-all-faults');
        if (clearFaultsBtn) {
            clearFaultsBtn.addEventListener('click', () => {
                this.clearAllFaults();
            });
        }
    }

    /**
     * Met à jour la simulation
     * @param {number} frozen - Si la simulation est gelée
     */
    update(frozen = false) {
        if (frozen) return;

        const now = performance.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000; // En secondes
        this.lastUpdateTime = now;

        if (this.mode === 'live') {
            // Mode simulation en direct
            this.flightModel.update(deltaTime);
            this.faultInjector.updateScenario(deltaTime);
        } else if (this.mode === 'replay') {
            // Mode replay FDR
            this.fdrReplay.update(deltaTime);
            this.updateReplayUI();
        }
    }

    /**
     * Récupère les données de simulation pour l'affichage
     * @returns {Object} Données formattées pour app.js
     */
    getSensorData() {
        const flightData = this.flightModel.getFlightData();
        const eng1Data = this.flightModel.getEngineData('eng1');
        const eng2Data = this.flightModel.getEngineData('eng2');
        const systemsData = this.flightModel.getSystemsData();

        return {
            eng1: {
                n1: eng1Data.n1,
                egt: eng1Data.egt,
                n2: eng1Data.n2,
                ff: eng1Data.fuelFlow,
                oilPress: eng1Data.oilPressure,
                vibN1: eng1Data.vibrationN1
            },
            eng2: {
                n1: eng2Data.n1,
                egt: eng2Data.egt,
                n2: eng2Data.n2,
                ff: eng2Data.fuelFlow,
                oilPress: eng2Data.oilPressure,
                vibN1: eng2Data.vibrationN1
            },
            hydraulics: {
                greenPress: systemsData.hydraulics.green.pressure,
                bluePress: systemsData.hydraulics.blue.pressure,
                yellowPress: systemsData.hydraulics.yellow.pressure,
                greenQty: systemsData.hydraulics.green.quantity,
                blueQty: systemsData.hydraulics.blue.quantity,
                yellowQty: systemsData.hydraulics.yellow.quantity,
                greenTemp: systemsData.hydraulics.green.temperature,
                blueTemp: systemsData.hydraulics.blue.temperature,
                yellowTemp: systemsData.hydraulics.yellow.temperature
            },
            electrical: {
                acBus1V: systemsData.electrical.acBus1,
                acBus2V: systemsData.electrical.acBus2,
                dcBus1V: systemsData.electrical.dcBus1,
                dcBus2V: systemsData.electrical.dcBus2,
                gen1Load: systemsData.electrical.gen1Load,
                gen2Load: systemsData.electrical.gen2Load,
                apuGenLoad: systemsData.electrical.apuGenLoad,
                batV: systemsData.electrical.battery1Voltage,
                batTemp: systemsData.electrical.battery1Temperature
            },
            pressurization: {
                cabinAlt: systemsData.pressurization.cabinAltitude,
                deltaP: systemsData.pressurization.deltaP,
                cabinRate: systemsData.pressurization.cabinRate,
                outflowValve: systemsData.pressurization.outflowValvePosition,
                safetyValve: systemsData.pressurization.safetyValve,
                packFlow1: systemsData.pressurization.pack1Flow,
                packFlow2: systemsData.pressurization.pack2Flow
            },
            flightControls: {
                elac1: systemsData.flightControls.elac1,
                elac2: systemsData.flightControls.elac2,
                sec1: systemsData.flightControls.sec1,
                sec2: systemsData.flightControls.sec2,
                sec3: systemsData.flightControls.sec3,
                fac1: systemsData.flightControls.fac1,
                fac2: systemsData.flightControls.fac2,
                aileronL: systemsData.flightControls.aileronLeft,
                aileronR: systemsData.flightControls.aileronRight,
                elevatorL: systemsData.flightControls.elevatorLeft,
                elevatorR: systemsData.flightControls.elevatorRight,
                rudder: systemsData.flightControls.rudder,
                slatPos: systemsData.flightControls.slatPosition,
                flapPos: systemsData.flightControls.flapPosition
            },
            fuel: {
                innerL: systemsData.fuel.innerLeft,
                innerR: systemsData.fuel.innerRight,
                center: systemsData.fuel.center,
                totalFuel: systemsData.fuel.totalFuel,
                fuelFlow: systemsData.fuel.totalFuelFlow,
                fuelTemp: systemsData.fuel.temperature,
                xFeed: systemsData.fuel.crossfeed ? 'OPEN' : 'CLOSED'
            },
            apu: {
                apuN: 0,
                apuEgt: 0,
                apuBleed: 'OFF',
                apuGen: 'OFF',
                apuOilPress: 0,
                apuStatus: 'OFF'
            }
        };
    }

    /**
     * Lance un scénario de panne
     * @param {string} scenarioName - Nom du scénario
     */
    runScenario(scenarioName) {
        if (!scenarioName || scenarioName === '') {
            this.activeScenario = null;
            return;
        }

        this.mode = 'live';
        this.faultInjector.runScenario(scenarioName);
        this.activeScenario = scenarioName;
        this.scenarioStartTime = performance.now();

        console.log(`[SimulationManager] Scénario lancé: ${scenarioName}`);
        this.updateScenarioDisplay();
    }

    /**
     * Injecte une panne individuelle
     * @param {string} faultType - Type de panne
     * @param {string|null} target - Cible de la panne
     */
    injectFault(faultType, target) {
        this.mode = 'live';
        this.faultInjector.injectFault(faultType, target);
        console.log(`[SimulationManager] Panne injectée: ${faultType} ${target || ''}`);
        this.updateFaultDisplay();
    }

    /**
     * Efface toutes les pannes actives
     */
    clearAllFaults() {
        this.faultInjector.clearAllFaults();
        this.activeScenario = null;
        if (this.ui.scenarioSelect) {
            this.ui.scenarioSelect.value = '';
        }
        console.log('[SimulationManager] Toutes les pannes effacées');
        this.updateFaultDisplay();
    }

    /**
     * Charge un fichier FDR
     * @param {File} file - Fichier FDR (CSV ou JSON)
     */
    async loadFDRFile(file) {
        if (!file) return;

        try {
            this.mode = 'replay';
            await this.fdrReplay.loadFromFile(file);
            console.log(`[SimulationManager] FDR chargé: ${file.name}`);
            this.updateReplayUI();
        } catch (error) {
            console.error('[SimulationManager] Erreur de chargement FDR:', error);
            if (window.showError) {
                window.showError('Simulation', `Erreur de chargement: ${error.message}`);
            } else {
                alert(`Erreur de chargement: ${error.message}`);
            }
        }
    }

    /**
     * Toggle play/pause du replay
     */
    toggleReplay() {
        if (this.fdrReplay.isPlaying) {
            this.fdrReplay.pause();
        } else {
            this.fdrReplay.play();
        }
        this.updateReplayPlayButton();
    }

    /**
     * Met à jour l'affichage du bouton play/pause
     */
    updateReplayPlayButton() {
        if (!this.ui.replayPlayPause) return;

        if (this.fdrReplay.isPlaying) {
            this.ui.replayPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
            this.ui.replayPlayPause.setAttribute('aria-label', 'Pause replay');
        } else {
            this.ui.replayPlayPause.innerHTML = '<i class="fas fa-play"></i>';
            this.ui.replayPlayPause.setAttribute('aria-label', 'Play replay');
        }
    }

    /**
     * Met à jour l'affichage de la vitesse de replay
     */
    updateReplaySpeedDisplay() {
        const speedDisplay = document.getElementById('replay-speed-display');
        if (speedDisplay) {
            const speed = this.fdrReplay.playbackSpeed.toFixed(1);
            speedDisplay.textContent = `${speed}x`;
        }
    }

    /**
     * Met à jour l'UI du replay
     */
    updateReplayUI() {
        const info = this.fdrReplay.getPlaybackInfo();

        // Progress bar
        if (this.ui.replayProgress) {
            this.ui.replayProgress.value = info.progress;
        }

        // Time display
        const timeDisplay = document.getElementById('replay-time-display');
        if (timeDisplay) {
            const current = this.formatTime(info.currentTime);
            const total = this.formatTime(info.totalTime);
            timeDisplay.textContent = `${current} / ${total}`;
        }

        // Status
        const statusDisplay = document.getElementById('replay-status');
        if (statusDisplay) {
            statusDisplay.textContent = info.isPlaying ? 'PLAYING' : 
                                        info.currentTime >= info.totalTime ? 'ENDED' : 'PAUSED';
        }

        this.updateReplayPlayButton();
        this.updateReplaySpeedDisplay();
    }

    /**
     * Formate un temps en secondes en HH:MM:SS
     * @param {number} seconds - Temps en secondes
     * @returns {string} Temps formatté
     */
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    /**
     * Met à jour l'affichage du scénario actif
     */
    updateScenarioDisplay() {
        const display = document.getElementById('active-scenario-display');
        if (display) {
            if (this.activeScenario) {
                const elapsed = Math.floor((performance.now() - this.scenarioStartTime) / 1000);
                display.innerHTML = `<span class="status-warning">⚠️ SCENARIO: ${this.activeScenario}</span> (${elapsed}s)`;
                display.style.display = 'block';
            } else {
                display.style.display = 'none';
            }
        }
    }

    /**
     * Met à jour l'affichage des pannes actives
     */
    updateFaultDisplay() {
        const faults = this.faultInjector.getActiveFaults();
        const display = document.getElementById('active-faults-display');
        
        if (display) {
            if (faults.length > 0) {
                const faultList = faults.map(f => 
                    `<li class="fault-item fault-item--${f.severity}">${f.type} ${f.target || ''}</li>`
                ).join('');
                display.innerHTML = `<ul class="fault-list">${faultList}</ul>`;
                display.style.display = 'block';
            } else {
                display.style.display = 'none';
            }
        }

        // Badge de compteur
        const badge = document.getElementById('fault-count-badge');
        if (badge) {
            badge.textContent = faults.length;
            badge.style.display = faults.length > 0 ? 'inline-block' : 'none';
        }
    }

    /**
     * Obtient les informations de vol du modèle
     * @returns {Object} Données de vol
     */
    getFlightInfo() {
        return this.flightModel.getFlightData();
    }
}

// Exporter l'instance unique
export default SimulationManager;
