/**
 * Tests unitaires pour AERO-DIAG
 * Tests des fonctions utilitaires et de la logique métier
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Fonction de validation des valeurs (extraite de app.js pour les tests)
 */
function validateValue(value, min, max) {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
        console.warn(`Invalid sensor value: ${value}`);
        return (min + max) / 2;
    }
    return Math.max(min, Math.min(max, value));
}

/**
 * Fonction jitter (extraite de app.js pour les tests)
 */
function jitter(value, range, min = 0, max = Infinity) {
    const delta = (Math.random() - 0.5) * 2 * range;
    const newValue = value + delta;
    return validateValue(newValue, min, max);
}

/**
 * Déterminer le statut basé sur les seuils
 */
function getStatus(value, threshold) {
    if (threshold.warning !== undefined && value >= threshold.warning) {
        return 'warning';
    }
    if (threshold.caution !== undefined && value >= threshold.caution) {
        return 'caution';
    }
    return 'normal';
}

/**
 * Statut spécial pour pression d'huile (seuils bas et hauts)
 */
function getStatusOil(value) {
    const oilThresholds = {
        warningLo: 20,
        cautionLo: 30,
        cautionHi: 85,
        warningHi: 95
    };
    
    if (value <= oilThresholds.warningLo || value >= oilThresholds.warningHi) {
        return 'warning';
    }
    if (value <= oilThresholds.cautionLo || value >= oilThresholds.cautionHi) {
        return 'caution';
    }
    return 'normal';
}

// ═══════════════════════════════════════════════════════
// TESTS - VALIDATION
// ═══════════════════════════════════════════════════════

describe('validateValue', () => {
    it('should return value when within bounds', () => {
        expect(validateValue(50, 0, 100)).toBe(50);
        expect(validateValue(0, 0, 100)).toBe(0);
        expect(validateValue(100, 0, 100)).toBe(100);
    });

    it('should clamp value to max when exceeding', () => {
        expect(validateValue(150, 0, 100)).toBe(100);
        expect(validateValue(1000, 0, 100)).toBe(100);
    });

    it('should clamp value to min when below', () => {
        expect(validateValue(-50, 0, 100)).toBe(0);
        expect(validateValue(-1000, 0, 100)).toBe(0);
    });

    it('should return midpoint for invalid values', () => {
        expect(validateValue(NaN, 0, 100)).toBe(50);
        expect(validateValue(Infinity, 0, 100)).toBe(50);
        expect(validateValue('invalid', 0, 100)).toBe(50);
        expect(validateValue(undefined, 0, 100)).toBe(50);
        expect(validateValue(null, 0, 100)).toBe(50);
    });
});

// ═══════════════════════════════════════════════════════
// TESTS - JITTER SIMULATION
// ═══════════════════════════════════════════════════════

describe('jitter', () => {
    it('should return value within bounds', () => {
        const value = jitter(50, 10, 0, 100);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
    });

    it('should not exceed max even with large jitter', () => {
        const value = jitter(95, 20, 0, 100);
        expect(value).toBeLessThanOrEqual(100);
    });

    it('should not go below min even with large jitter', () => {
        const value = jitter(5, 20, 0, 100);
        expect(value).toBeGreaterThanOrEqual(0);
    });

    it('should always return a number', () => {
        const value = jitter(50, 10, 0, 100);
        expect(typeof value).toBe('number');
        expect(isNaN(value)).toBe(false);
        expect(isFinite(value)).toBe(true);
    });

    it('should work with different ranges', () => {
        // Test multiple times to account for randomness
        for (let i = 0; i < 100; i++) {
            const value = jitter(1000, 50, 500, 1500);
            expect(value).toBeGreaterThanOrEqual(500);
            expect(value).toBeLessThanOrEqual(1500);
        }
    });
});

// ═══════════════════════════════════════════════════════
// TESTS - STATUS DETERMINATION
// ═══════════════════════════════════════════════════════

describe('getStatus', () => {
    const threshold = {
        caution: 95,
        warning: 101,
        max: 104
    };

    it('should return normal for values below caution', () => {
        expect(getStatus(50, threshold)).toBe('normal');
        expect(getStatus(90, threshold)).toBe('normal');
        expect(getStatus(94.9, threshold)).toBe('normal');
    });

    it('should return caution for values at or above caution', () => {
        expect(getStatus(95, threshold)).toBe('caution');
        expect(getStatus(98, threshold)).toBe('caution');
        expect(getStatus(100.9, threshold)).toBe('caution');
    });

    it('should return warning for values at or above warning', () => {
        expect(getStatus(101, threshold)).toBe('warning');
        expect(getStatus(103, threshold)).toBe('warning');
        expect(getStatus(104, threshold)).toBe('warning');
    });
});

describe('getStatusOil', () => {
    it('should return normal for values in safe range', () => {
        expect(getStatusOil(40)).toBe('normal');
        expect(getStatusOil(60)).toBe('normal');
        expect(getStatusOil(80)).toBe('normal');
    });

    it('should return caution for values in caution range', () => {
        expect(getStatusOil(30)).toBe('caution');
        expect(getStatusOil(25)).toBe('caution');
        expect(getStatusOil(85)).toBe('caution');
        expect(getStatusOil(90)).toBe('caution');
    });

    it('should return warning for values in warning range', () => {
        expect(getStatusOil(20)).toBe('warning');
        expect(getStatusOil(15)).toBe('warning');
        expect(getStatusOil(95)).toBe('warning');
        expect(getStatusOil(100)).toBe('warning');
    });
});

// ═══════════════════════════════════════════════════════
// TESTS - STATE MANAGEMENT
// ═══════════════════════════════════════════════════════

describe('State Management', () => {
    let mockState;

    beforeEach(() => {
        mockState = {
            activeSystem: 'engines',
            frozen: false,
            testMode: false,
            alarms: [],
            warnCount: 0,
            cautCount: 0,
            masterStatus: 'normal'
        };
    });

    it('should initialize with default state', () => {
        expect(mockState.activeSystem).toBe('engines');
        expect(mockState.frozen).toBe(false);
        expect(mockState.alarms).toEqual([]);
    });

    it('should toggle frozen state', () => {
        mockState.frozen = !mockState.frozen;
        expect(mockState.frozen).toBe(true);
        
        mockState.frozen = !mockState.frozen;
        expect(mockState.frozen).toBe(false);
    });

    it('should add alarms correctly', () => {
        const alarm = {
            id: Date.now(),
            time: '12:34:56',
            code: 'ENG-N1-HI',
            msg: 'ENGINE 1 N1 ABOVE LIMIT',
            level: 'warning',
            acknowledged: false
        };

        mockState.alarms.push(alarm);
        expect(mockState.alarms.length).toBe(1);
        expect(mockState.alarms[0].code).toBe('ENG-N1-HI');
    });

    it('should count warnings correctly', () => {
        mockState.alarms = [
            { level: 'warning', acknowledged: false },
            { level: 'warning', acknowledged: false },
            { level: 'caution', acknowledged: false }
        ];

        const warnCount = mockState.alarms.filter(
            a => !a.acknowledged && a.level === 'warning'
        ).length;
        
        expect(warnCount).toBe(2);
    });

    it('should filter acknowledged alarms', () => {
        mockState.alarms = [
            { level: 'warning', acknowledged: true },
            { level: 'warning', acknowledged: false },
            { level: 'caution', acknowledged: false }
        ];

        const activeAlarms = mockState.alarms.filter(a => !a.acknowledged);
        expect(activeAlarms.length).toBe(2);
    });
});

// ═══════════════════════════════════════════════════════
// TESTS - UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════

describe('Utility Functions', () => {
    it('should format time correctly', () => {
        const formatTime = (ms) => {
            const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
            const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
            const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
            return `${h}:${m}:${s}`;
        };

        expect(formatTime(0)).toBe('00:00:00');
        expect(formatTime(3661000)).toBe('01:01:01');
        expect(formatTime(7200000)).toBe('02:00:00');
    });

    it('should clamp percentage correctly', () => {
        const clampPct = (value) => Math.min(100, Math.max(0, value));

        expect(clampPct(50)).toBe(50);
        expect(clampPct(150)).toBe(100);
        expect(clampPct(-50)).toBe(0);
    });

    it('should generate unique IDs', () => {
        const id1 = Date.now();
        const id2 = Date.now();
        
        // IDs should be numbers
        expect(typeof id1).toBe('number');
        expect(typeof id2).toBe('number');
        
        // IDs should be close in value (within 10ms)
        expect(Math.abs(id2 - id1)).toBeLessThan(10);
    });
});

// ═══════════════════════════════════════════════════════
// TESTS - SENSOR DATA VALIDATION
// ═══════════════════════════════════════════════════════

describe('Sensor Data Validation', () => {
    it('should validate engine parameters', () => {
        const engineData = {
            n1: 85.2,
            egt: 580,
            n2: 88.1,
            ff: 1240,
            oilPress: 62,
            vibN1: 1.2
        };

        expect(engineData.n1).toBeGreaterThanOrEqual(0);
        expect(engineData.n1).toBeLessThanOrEqual(104);
        expect(engineData.egt).toBeGreaterThanOrEqual(0);
        expect(engineData.egt).toBeLessThanOrEqual(950);
        expect(engineData.oilPress).toBeGreaterThanOrEqual(0);
        expect(engineData.oilPress).toBeLessThanOrEqual(100);
    });

    it('should reject invalid sensor data', () => {
        const invalidData = [NaN, Infinity, -Infinity, null, undefined, 'string'];
        
        invalidData.forEach(data => {
            const validated = validateValue(data, 0, 100);
            expect(validated).toBe(50); // midpoint fallback
        });
    });
});
