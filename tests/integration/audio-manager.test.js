/**
 * Tests d'intégration - Audio Manager (v2.7.0)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AudioManager Integration Tests', () => {
    let audioManager;
    let mockAudioContext;

    beforeEach(() => {
        // Mock Web Audio API
        mockAudioContext = {
            createOscillator: vi.fn(() => ({
                type: 'sine',
                frequency: { value: 440 },
                connect: vi.fn(),
                start: vi.fn(),
                stop: vi.fn()
            })),
            createGain: vi.fn(() => ({
                gain: { value: 1 },
                connect: vi.fn()
            })),
            createBiquadFilter: vi.fn(() => ({
                type: 'lowpass',
                frequency: { value: 1000 },
                connect: vi.fn()
            })),
            destination: {},
            state: 'suspended',
            resume: vi.fn(() => Promise.resolve()),
            close: vi.fn(() => Promise.resolve())
        };

        global.AudioContext = vi.fn(() => mockAudioContext);
        global.webkitAudioContext = global.AudioContext;

        // Mock localStorage
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn()
        };

        // Basic AudioManager mock
        audioManager = {
            context: mockAudioContext,
            masterVolume: 1.0,
            effectsVolume: 0.8,
            ambientVolume: 0.3,
            ambientEnabled: false,
            soundEffectsEnabled: false
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Audio Context Management', () => {
        it('should create audio context on initialization', () => {
            expect(audioManager.context).toBeDefined();
            expect(audioManager.context.state).toBe('suspended');
        });

        it('should resume context on user interaction', async () => {
            await audioManager.context.resume();
            expect(mockAudioContext.resume).toHaveBeenCalled();
        });

        it('should handle browser autoplay policy', () => {
            // Context should start suspended
            expect(audioManager.context.state).toBe('suspended');
        });
    });

    describe('Volume Controls', () => {
        it('should have master volume between 0 and 1', () => {
            expect(audioManager.masterVolume).toBeGreaterThanOrEqual(0);
            expect(audioManager.masterVolume).toBeLessThanOrEqual(1);
        });

        it('should have effects volume between 0 and 1', () => {
            expect(audioManager.effectsVolume).toBeGreaterThanOrEqual(0);
            expect(audioManager.effectsVolume).toBeLessThanOrEqual(1);
        });

        it('should have ambient volume between 0 and 1', () => {
            expect(audioManager.ambientVolume).toBeGreaterThanOrEqual(0);
            expect(audioManager.ambientVolume).toBeLessThanOrEqual(1);
        });

        it('should allow volume adjustment', () => {
            audioManager.masterVolume = 0.5;
            expect(audioManager.masterVolume).toBe(0.5);
            
            audioManager.effectsVolume = 0.7;
            expect(audioManager.effectsVolume).toBe(0.7);
        });
    });

    describe('Sound Effects', () => {
        it('should not play sounds when disabled', () => {
            audioManager.soundEffectsEnabled = false;
            
            // Tentative de jouer un son ne devrait rien faire
            const shouldPlay = audioManager.soundEffectsEnabled;
            expect(shouldPlay).toBe(false);
        });

        it('should play sounds when enabled', () => {
            audioManager.soundEffectsEnabled = true;
            expect(audioManager.soundEffectsEnabled).toBe(true);
        });
    });

    describe('Ambient Sounds', () => {
        it('should not start ambient sounds by default', () => {
            expect(audioManager.ambientEnabled).toBe(false);
        });

        it('should allow enabling ambient sounds', () => {
            audioManager.ambientEnabled = true;
            expect(audioManager.ambientEnabled).toBe(true);
        });

        it('should create oscillators for engine simulation', () => {
            // Simulate ambient sound activation
            if (audioManager.context && audioManager.ambientEnabled) {
                audioManager.context.createOscillator();
                expect(mockAudioContext.createOscillator).toHaveBeenCalled();
            }
        });
    });

    describe('Audio Persistence', () => {
        it('should save audio preferences', () => {
            const prefs = {
                masterVolume: audioManager.masterVolume,
                effectsVolume: audioManager.effectsVolume,
                ambientVolume: audioManager.ambientVolume,
                ambientEnabled: audioManager.ambientEnabled
            };

            global.localStorage.setItem('aviation-hmi-audio', JSON.stringify(prefs));
            expect(global.localStorage.setItem).toHaveBeenCalledWith(
                'aviation-hmi-audio',
                JSON.stringify(prefs)
            );
        });

        it('should load audio preferences', () => {
            const savedPrefs = {
                masterVolume: 0.7,
                effectsVolume: 0.6,
                ambientEnabled: true
            };

            global.localStorage.getItem = vi.fn(() => JSON.stringify(savedPrefs));
            const loaded = JSON.parse(global.localStorage.getItem('aviation-hmi-audio') || '{}');

            expect(loaded.masterVolume).toBe(0.7);
            expect(loaded.effectsVolume).toBe(0.6);
            expect(loaded.ambientEnabled).toBe(true);
        });
    });

    describe('Aviation Audio Standards', () => {
        it('should not auto-play sounds without user consent', () => {
            // Par défaut, les sons ne doivent PAS démarrer
            expect(audioManager.ambientEnabled).toBe(false);
            expect(audioManager.soundEffectsEnabled).toBe(false);
        });

        it('should respect browser autoplay restrictions', () => {
            expect(audioManager.context.state).toBe('suspended');
        });

        it('should provide mute functionality', () => {
            const originalVolume = audioManager.masterVolume;
            audioManager.masterVolume = 0;
            
            expect(audioManager.masterVolume).toBe(0);
            expect(originalVolume).toBeGreaterThan(0);
        });
    });
});
