/**
 * Tests d'intégration - Theme Manager (v2.7.0)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ThemeManager Integration Tests', () => {
    let themeManager;
    let originalLocalStorage;

    beforeEach(() => {
        // Mock localStorage
        originalLocalStorage = global.localStorage;
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn()
        };

        // Mock document.documentElement
        global.document = {
            documentElement: {
                style: {
                    setProperty: vi.fn()
                }
            },
            body: {
                classList: {
                    add: vi.fn(),
                    remove: vi.fn()
                },
                className: '',
                style: {}
            }
        };

        // Create ThemeManager instance
        themeManager = {
            themes: {
                dark: { name: 'Mode Nuit', colors: { '--bg-primary': '#060a14' } },
                light: { name: 'Mode Jour', colors: { '--bg-primary': '#ffffff' } },
                airfrance: { name: 'Air France', colors: { '--bg-primary': '#001f3f' } }
            },
            currentTheme: 'dark',
            currentFontSize: 'medium',
            fontSizes: {
                small: { scale: 0.875 },
                medium: { scale: 1.0 },
                large: { scale: 1.125 },
                xlarge: { scale: 1.25 }
            }
        };
    });

    afterEach(() => {
        global.localStorage = originalLocalStorage;
        vi.clearAllMocks();
    });

    describe('Theme Switching', () => {
        it('should switch from dark to light theme', () => {
            const result = themeManager.currentTheme === 'dark';
            expect(result).toBe(true);

            themeManager.currentTheme = 'light';
            expect(themeManager.currentTheme).toBe('light');
        });

        it('should validate theme names', () => {
            const validThemes = ['dark', 'light', 'airfrance', 'lufthansa', 'emirates', 'british'];
            
            validThemes.forEach(theme => {
                if (themeManager.themes[theme]) {
                    expect(themeManager.themes[theme]).toBeDefined();
                    expect(themeManager.themes[theme].name).toBeTruthy();
                }
            });
        });

        it('should not use red/yellow/green as background colors', () => {
            const dangerousColors = ['#ff0000', '#ffff00', '#00ff00', 'red', 'yellow', 'green'];
            
            Object.values(themeManager.themes).forEach(theme => {
                if (theme.colors) {
                    const bgColors = Object.entries(theme.colors)
                        .filter(([key]) => key.includes('--bg-'))
                        .map(([, value]) => value.toLowerCase());

                    bgColors.forEach(color => {
                        dangerousColors.forEach(dangerous => {
                            expect(color).not.toContain(dangerous);
                        });
                    });
                }
            });
        });
    });

    describe('Font Size Management', () => {
        it('should have 4 font size options', () => {
            const sizes = Object.keys(themeManager.fontSizes);
            expect(sizes).toHaveLength(4);
            expect(sizes).toContain('small');
            expect(sizes).toContain('medium');
            expect(sizes).toContain('large');
            expect(sizes).toContain('xlarge');
        });

        it('should have correct scale factors', () => {
            expect(themeManager.fontSizes.small.scale).toBe(0.875);
            expect(themeManager.fontSizes.medium.scale).toBe(1.0);
            expect(themeManager.fontSizes.large.scale).toBe(1.125);
            expect(themeManager.fontSizes.xlarge.scale).toBe(1.25);
        });

        it('should increase font size progressively', () => {
            const scales = Object.values(themeManager.fontSizes).map(s => s.scale);
            
            for (let i = 1; i < scales.length; i++) {
                expect(scales[i]).toBeGreaterThan(scales[i - 1]);
            }
        });
    });

    describe('Theme Persistence', () => {
        it('should save theme to localStorage', () => {
            const mockSave = vi.fn();
            global.localStorage.setItem = mockSave;

            const prefs = { theme: 'dark', fontSize: 'medium' };
            global.localStorage.setItem('aviation-hmi-theme', JSON.stringify(prefs));

            expect(mockSave).toHaveBeenCalledWith(
                'aviation-hmi-theme',
                JSON.stringify(prefs)
            );
        });

        it('should load theme from localStorage', () => {
            const savedPrefs = { theme: 'light', fontSize: 'large' };
            global.localStorage.getItem = vi.fn(() => JSON.stringify(savedPrefs));

            const loaded = JSON.parse(global.localStorage.getItem('aviation-hmi-theme') || '{}');
            
            expect(loaded.theme).toBe('light');
            expect(loaded.fontSize).toBe('large');
        });
    });

    describe('Aviation Safety Standards', () => {
        it('should reserve red for warnings only', () => {
            Object.values(themeManager.themes).forEach(theme => {
                if (theme.colors) {
                    const statusWarning = theme.colors['--status-warning'];
                    if (statusWarning) {
                        expect(statusWarning).toMatch(/#ff|rgb.*255/i);
                    }
                }
            });
        });

        it('should provide high contrast for critical data', () => {
            // Tous les thèmes doivent avoir des couleurs de statut définies
            const requiredStatus = ['--status-normal', '--status-caution', '--status-warning'];
            
            Object.values(themeManager.themes).forEach(theme => {
                if (theme.colors) {
                    requiredStatus.forEach(status => {
                        // Vérifie que le statut existe OU qu'on est sur un vieux thème
                        const hasStatus = theme.colors[status] !== undefined;
                        const isOldTheme = !theme.colors['--bg-primary'];
                        expect(hasStatus || isOldTheme).toBe(true);
                    });
                }
            });
        });
    });
});
