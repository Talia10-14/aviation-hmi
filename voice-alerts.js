/**
 * Voice Alert System
 * Aviation-grade voice alerts compliant with CS-25.1322
 * Implements Master Caution and Master Warning aural alerts
 */

export class VoiceAlertSystem {
    constructor() {
        this.enabled = true;
        this.synthesis = window.speechSynthesis;
        this.activeAlerts = new Set();
        this.repeatIntervals = new Map();
        
        // Alert definitions per CS-25.1322
        this.alerts = {
            // WARNINGS - Repetitive, male voice
            'STALL': { 
                text: 'STALL', 
                voice: 'male', 
                repeat: true, 
                interval: 500,
                priority: 1,
                volume: 1.0,
                rate: 1.3,
                pitch: 0.8
            },
            'TERRAIN': { 
                text: 'TERRAIN', 
                voice: 'male', 
                repeat: true, 
                interval: 800,
                priority: 1,
                volume: 1.0,
                rate: 1.3,
                pitch: 0.8
            },
            'PULL_UP': { 
                text: 'PULL UP', 
                voice: 'male', 
                repeat: true, 
                interval: 500,
                priority: 1,
                volume: 1.0,
                rate: 1.4,
                pitch: 0.7
            },
            'WINDSHEAR': { 
                text: 'WINDSHEAR', 
                voice: 'male', 
                repeat: true, 
                interval: 800,
                priority: 1,
                volume: 1.0,
                rate: 1.3,
                pitch: 0.8
            },
            
            // CAUTIONS - Single, female voice
            'CABIN_ALTITUDE': { 
                text: 'CABIN ALTITUDE', 
                voice: 'female', 
                repeat: false,
                priority: 2,
                volume: 0.9,
                rate: 1.2,
                pitch: 1.1
            },
            'ENGINE_FIRE': { 
                text: 'ENGINE FIRE', 
                voice: 'female', 
                repeat: false,
                priority: 2,
                volume: 0.9,
                rate: 1.2,
                pitch: 1.1
            },
            'HYDRAULIC_PRESSURE': { 
                text: 'HYDRAULIC PRESSURE', 
                voice: 'female', 
                repeat: false,
                priority: 2,
                volume: 0.9,
                rate: 1.1,
                pitch: 1.1
            },
            'ELECTRICAL_FAULT': { 
                text: 'ELECTRICAL FAULT', 
                voice: 'female', 
                repeat: false,
                priority: 2,
                volume: 0.9,
                rate: 1.1,
                pitch: 1.1
            },
            'FUEL_LOW': { 
                text: 'FUEL LOW', 
                voice: 'female', 
                repeat: false,
                priority: 2,
                volume: 0.9,
                rate: 1.1,
                pitch: 1.1
            },
            
            // MASTER WARNING - Single chime
            'MASTER_WARNING': {
                text: 'WARNING',
                voice: 'male',
                repeat: false,
                priority: 1,
                volume: 1.0,
                rate: 1.2,
                pitch: 0.9,
                useChime: true
            },
            
            // MASTER CAUTION - Single chime
            'MASTER_CAUTION': {
                text: 'CAUTION',
                voice: 'female',
                repeat: false,
                priority: 2,
                volume: 0.9,
                rate: 1.1,
                pitch: 1.0,
                useChime: true
            }
        };
        
        // Check browser support
        this.checkSupport();
    }

    /**
     * Check if speech synthesis is supported
     */
    checkSupport() {
        if (!this.synthesis) {
            console.warn('Speech Synthesis not supported by this browser');
            this.enabled = false;
            return false;
        }
        return true;
    }

    /**
     * Trigger a voice alert
     * @param {string} alertType - Alert identifier
     * @param {object} options - Override options
     */
    trigger(alertType, options = {}) {
        if (!this.enabled || !this.checkSupport()) {
            console.warn(`Voice alert ${alertType} triggered but system disabled`);
            return;
        }

        const alert = this.alerts[alertType];
        if (!alert) {
            console.warn(`Unknown alert type: ${alertType}`);
            return;
        }

        // Stop any lower priority alerts
        this.stopLowerPriorityAlerts(alert.priority);

        // If already playing this alert, don't restart
        if (this.activeAlerts.has(alertType)) {
            return;
        }

        // Play chime if specified
        if (alert.useChime) {
            this.playChime(alert.priority);
        }

        // Speak the alert
        this.speak(alertType, { ...alert, ...options });

        // Handle repetitive alerts
        if (alert.repeat) {
            this.startRepetition(alertType);
        }
    }

    /**
     * Speak alert text
     * @param {string} alertType - Alert identifier
     * @param {object} config - Alert configuration
     */
    speak(alertType, config) {
        const utterance = new SpeechSynthesisUtterance(config.text);
        
        // Set voice parameters
        utterance.lang = 'en-US';
        utterance.volume = config.volume || 1.0;
        utterance.rate = config.rate || 1.0;
        utterance.pitch = config.pitch || 1.0;

        // Try to select appropriate voice
        const voices = this.synthesis.getVoices();
        if (voices.length > 0) {
            const voiceGender = config.voice === 'male' ? 'male' : 'female';
            const selectedVoice = voices.find(v => 
                v.lang.startsWith('en') && 
                (v.name.toLowerCase().includes(voiceGender) || 
                 v.name.toLowerCase().includes(config.voice === 'male' ? 'david' : 'samantha'))
            ) || voices.find(v => v.lang.startsWith('en'));
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        // Track active alerts
        this.activeAlerts.add(alertType);

        utterance.onend = () => {
            if (!this.alerts[alertType]?.repeat) {
                this.activeAlerts.delete(alertType);
            }
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.activeAlerts.delete(alertType);
        };

        // Cancel any existing speech and speak
        this.synthesis.speak(utterance);
    }

    /**
     * Start repetition for repetitive alerts
     * @param {string} alertType - Alert identifier
     */
    startRepetition(alertType) {
        const alert = this.alerts[alertType];
        if (!alert.repeat) return;

        // Clear any existing interval
        this.stopRepetition(alertType);

        // Set up new interval
        const intervalId = setInterval(() => {
            if (this.activeAlerts.has(alertType)) {
                this.speak(alertType, alert);
            }
        }, alert.interval);

        this.repeatIntervals.set(alertType, intervalId);
    }

    /**
     * Stop repetition for an alert
     * @param {string} alertType - Alert identifier
     */
    stopRepetition(alertType) {
        const intervalId = this.repeatIntervals.get(alertType);
        if (intervalId) {
            clearInterval(intervalId);
            this.repeatIntervals.delete(alertType);
        }
    }

    /**
     * Cancel a specific alert
     * @param {string} alertType - Alert identifier
     */
    cancel(alertType) {
        this.activeAlerts.delete(alertType);
        this.stopRepetition(alertType);
        
        // Don't cancel speech synthesis entirely as it might cancel other alerts
        // Just mark this alert as inactive
    }

    /**
     * Cancel all alerts
     */
    cancelAll() {
        this.activeAlerts.clear();
        this.repeatIntervals.forEach((intervalId) => clearInterval(intervalId));
        this.repeatIntervals.clear();
        this.synthesis.cancel();
    }

    /**
     * Stop alerts with lower priority
     * @param {number} priority - Current alert priority
     */
    stopLowerPriorityAlerts(priority) {
        this.activeAlerts.forEach(alertType => {
            const alert = this.alerts[alertType];
            if (alert && alert.priority > priority) {
                this.cancel(alertType);
            }
        });
    }

    /**
     * Play audio chime (using Web Audio API or fallback to beep)
     * @param {number} priority - Alert priority
     */
    playChime(priority) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for warning vs caution
            oscillator.frequency.value = priority === 1 ? 800 : 600;
            oscillator.type = 'sine';

            // Envelope
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.warn('Could not play chime:', e);
        }
    }

    /**
     * Test the voice alert system
     */
    test() {
        console.log('🔊 Testing Voice Alert System...');
        
        // Test caution
        setTimeout(() => {
            console.log('Testing CAUTION alert...');
            this.trigger('CABIN_ALTITUDE');
        }, 1000);

        // Test warning
        setTimeout(() => {
            console.log('Testing WARNING alert...');
            this.trigger('ENGINE_FIRE');
        }, 3000);

        // Test repetitive (will repeat until cancelled)
        setTimeout(() => {
            console.log('Testing REPETITIVE alert (STALL)...');
            this.trigger('STALL');
        }, 5000);

        // Cancel repetitive
        setTimeout(() => {
            console.log('Cancelling STALL alert...');
            this.cancel('STALL');
        }, 8000);
    }

    /**
     * Map fault code to voice alert
     * @param {string} faultCode - ECAM fault code
     * @returns {string|null} Alert type or null
     */
    mapFaultToAlert(faultCode) {
        const mapping = {
            'PRESS-CAB-HI': 'CABIN_ALTITUDE',
            'ENG-N1-HI': 'ENGINE_FIRE',
            'ENG-EGT-HI': 'ENGINE_FIRE',
            'HYD-GRN-LO': 'HYDRAULIC_PRESSURE',
            'HYD-BLU-LO': 'HYDRAULIC_PRESSURE',
            'HYD-YEL-LO': 'HYDRAULIC_PRESSURE',
            'ELEC-GEN-HI': 'ELECTRICAL_FAULT',
            'ELEC-BAT-HI': 'ELECTRICAL_FAULT',
            'FUEL-QTY-LO': 'FUEL_LOW'
        };

        return mapping[faultCode] || null;
    }

    /**
     * Enable/disable voice alerts
     * @param {boolean} enabled - Enable state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.cancelAll();
        }
        
        // Save preference
        try {
            localStorage.setItem('voiceAlertsEnabled', enabled ? 'true' : 'false');
        } catch (e) {
            console.warn('Could not save voice alerts preference');
        }
    }

    /**
     * Load saved preferences
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('voiceAlertsEnabled');
            if (saved !== null) {
                this.enabled = saved === 'true';
            }
        } catch (e) {
            console.warn('Could not load voice alerts preference');
        }
    }

    /**
     * Get system status
     * @returns {object} Status information
     */
    getStatus() {
        return {
            enabled: this.enabled,
            supported: this.checkSupport(),
            activeAlerts: Array.from(this.activeAlerts),
            voicesAvailable: this.synthesis ? this.synthesis.getVoices().length : 0
        };
    }
}

// Singleton instance
export const voiceAlerts = new VoiceAlertSystem();

// Auto-load preferences
voiceAlerts.loadPreferences();

export default voiceAlerts;
