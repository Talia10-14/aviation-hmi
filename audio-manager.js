/**
 * Audio Manager - Aviation HMI v2.7.0
 * Gestion des sons d'ambiance cockpit, alertes vocales et effets sonores
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.enabled = true;
        this.ambientEnabled = true;
        this.ambientVolume = 0.3;
        this.effectsVolume = 0.7;
        this.voiceEnabled = true;
        
        this.ambientSources = [];
        this.activeEffects = new Map();

        this.loadPreferences();
        this.initAudioContext();
    }

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        const saved = localStorage.getItem('aviation-hmi-audio');
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                this.enabled = prefs.enabled !== false;
                this.ambientEnabled = prefs.ambientEnabled !== false;
                this.voiceEnabled = prefs.voiceEnabled !== false;
                this.masterVolume = prefs.masterVolume ?? 0.5;
                this.ambientVolume = prefs.ambientVolume ?? 0.3;
                this.effectsVolume = prefs.effectsVolume ?? 0.7;
            } catch (e) {
                console.error('[AUDIO] Failed to load preferences:', e);
            }
        }
    }

    /**
     * Save preferences
     */
    savePreferences() {
        const prefs = {
            enabled: this.enabled,
            ambientEnabled: this.ambientEnabled,
            voiceEnabled: this.voiceEnabled,
            masterVolume: this.masterVolume,
            ambientVolume: this.ambientVolume,
            effectsVolume: this.effectsVolume
        };
        localStorage.setItem('aviation-hmi-audio', JSON.stringify(prefs));
    }

    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('[AUDIO] Audio context initialized');
        } catch (e) {
            console.error('[AUDIO] Failed to initialize audio context:', e);
        }
    }

    /**
     * Resume audio context (required after user interaction)
     */
    resumeContext() {
        if (this.audioContext?.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Generate tone using Web Audio API
     */
    generateTone(frequency, duration, volume = 1.0, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        this.resumeContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume * this.masterVolume * this.effectsVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    /**
     * Play ambient cockpit sounds
     */
    playAmbientSound() {
        if (!this.enabled || !this.ambientEnabled || !this.audioContext) return;

        this.resumeContext();
        this.stopAmbientSound();

        // Create low-frequency hum (engine noise)
        const hum = this.audioContext.createOscillator();
        const humGain = this.audioContext.createGain();
        
        hum.type = 'sawtooth';
        hum.frequency.setValueAtTime(80, this.audioContext.currentTime);
        humGain.gain.setValueAtTime(this.ambientVolume * this.masterVolume * 0.3, this.audioContext.currentTime);
        
        hum.connect(humGain);
        humGain.connect(this.audioContext.destination);
        hum.start();
        
        this.ambientSources.push({ oscillator: hum, gain: humGain });

        // Add subtle white noise (air conditioning)
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();
        
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 500;
        noiseGain.gain.setValueAtTime(this.ambientVolume * this.masterVolume * 0.1, this.audioContext.currentTime);
        
        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        whiteNoise.start();
        
        this.ambientSources.push({ source: whiteNoise, gain: noiseGain, filter: noiseFilter });

        console.log('[AUDIO] Ambient sounds started');
    }

    /**
     * Stop ambient sounds
     */
    stopAmbientSound() {
        this.ambientSources.forEach(source => {
            try {
                if (source.oscillator) source.oscillator.stop();
                if (source.source) source.source.stop();
            } catch (e) {
                // Already stopped
            }
        });
        this.ambientSources = [];
    }

    /**
     * Play click sound
     */
    playClick() {
        this.generateTone(800, 0.05, 0.3, 'square');
    }

    /**
     * Play success sound
     */
    playSuccess() {
        this.generateTone(523, 0.1, 0.4, 'sine'); // C5
        setTimeout(() => this.generateTone(659, 0.1, 0.4, 'sine'), 100); // E5
        setTimeout(() => this.generateTone(784, 0.2, 0.4, 'sine'), 200); // G5
    }

    /**
     * Play error sound
     */
    playError() {
        this.generateTone(200, 0.15, 0.5, 'sawtooth');
        setTimeout(() => this.generateTone(150, 0.15, 0.5, 'sawtooth'), 150);
    }

    /**
     * Play warning sound (continuous)
     */
    playWarning() {
        const warningId = 'warning_alert';
        
        // Stop if already playing
        if (this.activeEffects.has(warningId)) {
            this.stopEffect(warningId);
        }

        const playWarningTone = () => {
            if (!this.activeEffects.has(warningId)) return;
            
            this.generateTone(800, 0.3, 0.6, 'square');
            setTimeout(() => {
                if (this.activeEffects.has(warningId)) {
                    this.generateTone(600, 0.3, 0.6, 'square');
                }
            }, 300);
            
            setTimeout(playWarningTone, 800);
        };

        this.activeEffects.set(warningId, true);
        playWarningTone();
    }

    /**
     * Play caution sound
     */
    playCaution() {
        this.generateTone(600, 0.3, 0.5, 'triangle');
    }

    /**
     * Play alert chime
     */
    playChime() {
        this.generateTone(1047, 0.1, 0.4, 'sine'); // C6
        setTimeout(() => this.generateTone(1319, 0.2, 0.4, 'sine'), 100); // E6
    }

    /**
     * Stop specific effect
     */
    stopEffect(effectId) {
        this.activeEffects.delete(effectId);
    }

    /**
     * Stop all effects
     */
    stopAllEffects() {
        this.activeEffects.clear();
    }

    /**
     * Speak text using Web Speech API
     */
    speak(text, language = 'fr-FR', rate = 1.0, pitch = 1.0) {
        if (!this.enabled || !this.voiceEnabled) return;

        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language;
            utterance.rate = rate;
            utterance.pitch = pitch;
            utterance.volume = this.masterVolume;

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('[AUDIO] Speech synthesis not supported');
        }
    }

    /**
     * Announce alarm with voice
     */
    announceAlarm(code, severity) {
        if (!this.voiceEnabled) return;

        const t = (key) => window.i18n ? window.i18n.t(key) : key;
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'fr';
        
        const langCodes = {
            fr: 'fr-FR',
            en: 'en-US',
            es: 'es-ES',
            de: 'de-DE',
            it: 'it-IT'
        };

        let message = '';
        if (severity === 'warning') {
            message = t('audio.warning_alarm') + ' ' + code;
            this.playWarning();
        } else if (severity === 'caution') {
            message = t('audio.caution_alarm') + ' ' + code;
            this.playCaution();
        } else {
            message = t('audio.advisory_alarm') + ' ' + code;
            this.playChime();
        }

        setTimeout(() => {
            this.speak(message, langCodes[currentLang] || 'en-US', 0.9, 0.9);
        }, 500);
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.savePreferences();
        
        // Update ambient sound volume
        this.ambientSources.forEach(source => {
            if (source.gain) {
                source.gain.gain.setValueAtTime(
                    this.ambientVolume * this.masterVolume * 0.3,
                    this.audioContext.currentTime
                );
            }
        });
    }

    /**
     * Set ambient volume
     */
    setAmbientVolume(volume) {
        this.ambientVolume = Math.max(0, Math.min(1, volume));
        this.savePreferences();
        
        // Update ambient sound volume
        this.ambientSources.forEach(source => {
            if (source.gain) {
                source.gain.gain.setValueAtTime(
                    this.ambientVolume * this.masterVolume * 0.3,
                    this.audioContext.currentTime
                );
            }
        });
    }

    /**
     * Set effects volume
     */
    setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
        this.savePreferences();
    }

    /**
     * Enable/disable all audio
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.savePreferences();
        
        if (!enabled) {
            this.stopAmbientSound();
            this.stopAllEffects();
            window.speechSynthesis?.cancel();
        }
    }

    /**
     * Enable/disable ambient sounds
     */
    setAmbientEnabled(enabled) {
        this.ambientEnabled = enabled;
        this.savePreferences();
        
        if (enabled) {
            this.playAmbientSound();
        } else {
            this.stopAmbientSound();
        }
    }

    /**
     * Enable/disable voice alerts
     */
    setVoiceEnabled(enabled) {
        this.voiceEnabled = enabled;
        this.savePreferences();
        
        if (!enabled) {
            window.speechSynthesis?.cancel();
        }
    }

    /**
     * Create audio settings panel
     */
    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'audio-settings';
        panel.innerHTML = `
            <div class="audio-settings__header">
                <h3 data-i18n="audio.title">Paramètres Audio</h3>
                <button class="audio-settings__close" id="audio-close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="audio-settings__content">
                <div class="audio-settings__section">
                    <label class="audio-settings__checkbox">
                        <input type="checkbox" id="audio-enabled-toggle" ${this.enabled ? 'checked' : ''}>
                        <span data-i18n="audio.enable_all">Activer tous les sons</span>
                    </label>
                </div>

                <div class="audio-settings__section">
                    <label>
                        <span data-i18n="audio.master_volume">Volume Principal</span>
                        <input type="range" id="master-volume-slider" min="0" max="100" 
                               value="${this.masterVolume * 100}" step="1">
                        <span id="master-volume-value">${Math.round(this.masterVolume * 100)}%</span>
                    </label>
                </div>

                <div class="audio-settings__section">
                    <label class="audio-settings__checkbox">
                        <input type="checkbox" id="ambient-enabled-toggle" ${this.ambientEnabled ? 'checked' : ''}>
                        <span data-i18n="audio.ambient_sounds">Sons d'ambiance cockpit</span>
                    </label>
                    <label>
                        <span data-i18n="audio.ambient_volume">Volume ambiance</span>
                        <input type="range" id="ambient-volume-slider" min="0" max="100" 
                               value="${this.ambientVolume * 100}" step="1" 
                               ${!this.ambientEnabled ? 'disabled' : ''}>
                        <span id="ambient-volume-value">${Math.round(this.ambientVolume * 100)}%</span>
                    </label>
                </div>

                <div class="audio-settings__section">
                    <label>
                        <span data-i18n="audio.effects_volume">Volume effets sonores</span>
                        <input type="range" id="effects-volume-slider" min="0" max="100" 
                               value="${this.effectsVolume * 100}" step="1">
                        <span id="effects-volume-value">${Math.round(this.effectsVolume * 100)}%</span>
                    </label>
                </div>

                <div class="audio-settings__section">
                    <label class="audio-settings__checkbox">
                        <input type="checkbox" id="voice-enabled-toggle" ${this.voiceEnabled ? 'checked' : ''}>
                        <span data-i18n="audio.voice_alerts">Alertes vocales</span>
                    </label>
                </div>

                <div class="audio-settings__section">
                    <h4 data-i18n="audio.test_sounds">Test des Sons</h4>
                    <div class="audio-settings__test-buttons">
                        <button class="btn btn--ghost btn--small" id="test-click-btn">
                            <i class="fas fa-mouse-pointer"></i> <span data-i18n="audio.test_click">Clic</span>
                        </button>
                        <button class="btn btn--ghost btn--small" id="test-success-btn">
                            <i class="fas fa-check"></i> <span data-i18n="audio.test_success">Succès</span>
                        </button>
                        <button class="btn btn--ghost btn--small" id="test-error-btn">
                            <i class="fas fa-times"></i> <span data-i18n="audio.test_error">Erreur</span>
                        </button>
                        <button class="btn btn--ghost btn--small" id="test-warning-btn">
                            <i class="fas fa-exclamation-triangle"></i> <span data-i18n="audio.test_warning">Alerte</span>
                        </button>
                        <button class="btn btn--ghost btn--small" id="test-voice-btn">
                            <i class="fas fa-volume-up"></i> <span data-i18n="audio.test_voice">Voix</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.bindPanelEvents(panel);

        return panel;
    }

    /**
     * Bind events to settings panel
     */
    bindPanelEvents(panel) {
        // Close button
        panel.querySelector('#audio-close-btn')?.addEventListener('click', () => {
            panel.remove();
        });

        // Enable/disable all audio
        panel.querySelector('#audio-enabled-toggle')?.addEventListener('change', (e) => {
            this.setEnabled(e.target.checked);
        });

        // Master volume
        const masterSlider = panel.querySelector('#master-volume-slider');
        const masterValue = panel.querySelector('#master-volume-value');
        masterSlider?.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            this.setMasterVolume(value);
            masterValue.textContent = `${Math.round(value * 100)}%`;
        });

        // Ambient toggle
        const ambientToggle = panel.querySelector('#ambient-enabled-toggle');
        const ambientSlider = panel.querySelector('#ambient-volume-slider');
        ambientToggle?.addEventListener('change', (e) => {
            this.setAmbientEnabled(e.target.checked);
            if (ambientSlider) ambientSlider.disabled = !e.target.checked;
        });

        // Ambient volume
        const ambientValue = panel.querySelector('#ambient-volume-value');
        ambientSlider?.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            this.setAmbientVolume(value);
            ambientValue.textContent = `${Math.round(value * 100)}%`;
        });

        // Effects volume
        const effectsSlider = panel.querySelector('#effects-volume-slider');
        const effectsValue = panel.querySelector('#effects-volume-value');
        effectsSlider?.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            this.setEffectsVolume(value);
            effectsValue.textContent = `${Math.round(value * 100)}%`;
        });

        // Voice toggle
        panel.querySelector('#voice-enabled-toggle')?.addEventListener('change', (e) => {
            this.setVoiceEnabled(e.target.checked);
        });

        // Test buttons
        panel.querySelector('#test-click-btn')?.addEventListener('click', () => this.playClick());
        panel.querySelector('#test-success-btn')?.addEventListener('click', () => this.playSuccess());
        panel.querySelector('#test-error-btn')?.addEventListener('click', () => this.playError());
        panel.querySelector('#test-warning-btn')?.addEventListener('click', () => {
            this.playWarning();
            setTimeout(() => this.stopEffect('warning_alert'), 3000);
        });
        panel.querySelector('#test-voice-btn')?.addEventListener('click', () => {
            const t = (key) => window.i18n ? window.i18n.t(key) : key;
            this.speak(t('audio.test_voice_message') || 'Test du système vocal');
        });
    }

    /**
     * Show audio settings
     */
    showSettings() {
        let panel = document.querySelector('.audio-settings');
        if (!panel) {
            panel = this.createSettingsPanel();
            document.body.appendChild(panel);
        }
        
        // Update translations if i18n is available
        if (window.i18n) {
            window.i18n.updateDOM();
        }
    }
}

// Export singleton instance
export const audioManager = new AudioManager();
window.audioManager = audioManager;

// Resume audio context on first user interaction
document.addEventListener('click', () => {
    audioManager.resumeContext();
}, { once: true });

export default audioManager;
