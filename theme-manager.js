/**
 * Theme Manager - Aviation HMI v2.7.0
 * Gestion des thèmes (jour/nuit), personnalisation des couleurs, tailles de police
 */

class ThemeManager {
    constructor() {
        this.themes = {
            dark: {
                name: 'Mode Nuit',
                colors: {
                    // Surfaces
                    '--bg-primary': '#060a14',
                    '--bg-secondary': '#0c1222',
                    '--bg-panel': '#101828',
                    '--bg-card': '#151f30',
                    '--bg-card-hover': '#1a2740',
                    '--bg-overlay': 'rgba(6, 10, 20, 0.9)',
                    // Text
                    '--text-primary': '#e0e6ed',
                    '--text-secondary': '#8899aa',
                    '--text-muted': '#556677',
                    '--text-label': '#6b7f94',
                    // Status - Aviation Standard
                    '--status-normal': '#00ff88',
                    '--status-normal-dim': 'rgba(0, 255, 136, 0.15)',
                    '--status-caution': '#ffaa00',
                    '--status-caution-dim': 'rgba(255, 170, 0, 0.15)',
                    '--status-warning': '#ff3344',
                    '--status-warning-dim': 'rgba(255, 51, 68, 0.15)',
                    '--status-info': '#00bbff',
                    '--status-info-dim': 'rgba(0, 187, 255, 0.15)',
                    '--status-cyan': '#00e5ff',
                    // Borders
                    '--border-subtle': 'rgba(255, 255, 255, 0.06)',
                    '--border-medium': 'rgba(255, 255, 255, 0.1)',
                    '--border-highlight': 'rgba(0, 255, 136, 0.2)',
                    // Shadows
                    '--shadow-card': '0 2px 12px rgba(0, 0, 0, 0.4)',
                    '--shadow-glow-green': '0 0 20px rgba(0, 255, 136, 0.15)',
                    '--shadow-glow-red': '0 0 20px rgba(255, 51, 68, 0.3)',
                    '--shadow-glow-amber': '0 0 20px rgba(255, 170, 0, 0.2)'
                }
            },
            light: {
                name: 'Mode Jour',
                colors: {
                    // Surfaces - Contraste amélioré pour lisibilité
                    '--bg-primary': '#ffffff',
                    '--bg-secondary': '#f8f9fa',
                    '--bg-panel': '#f1f3f5',
                    '--bg-card': '#e9ecef',
                    '--bg-card-hover': '#dee2e6',
                    '--bg-overlay': 'rgba(255, 255, 255, 0.95)',
                    // Text - Contrastes forts pour sécurité
                    '--text-primary': '#000000',
                    '--text-secondary': '#1a1a1a',
                    '--text-muted': '#4a4a4a',
                    '--text-label': '#6a6a6a',
                    // Status - Couleurs saturées pour visibilité maximale
                    '--status-normal': '#087f5b',
                    '--status-normal-dim': 'rgba(8, 127, 91, 0.1)',
                    '--status-caution': '#e67700',
                    '--status-caution-dim': 'rgba(230, 119, 0, 0.1)',
                    '--status-warning': '#c92a2a',
                    '--status-warning-dim': 'rgba(201, 42, 42, 0.1)',
                    '--status-info': '#1864ab',
                    '--status-info-dim': 'rgba(24, 100, 171, 0.1)',
                    '--status-cyan': '#0c8599',
                    // Borders - Plus visibles
                    '--border-subtle': 'rgba(0, 0, 0, 0.1)',
                    '--border-medium': 'rgba(0, 0, 0, 0.2)',
                    '--border-highlight': 'rgba(8, 127, 91, 0.4)',
                    // Shadows
                    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '--shadow-glow-green': '0 0 12px rgba(8, 127, 91, 0.3)',
                    '--shadow-glow-red': '0 0 12px rgba(201, 42, 42, 0.4)',
                    '--shadow-glow-amber': '0 0 12px rgba(230, 119, 0, 0.3)'
                }
            },
            airfrance: {
                name: 'Air France',
                colors: {
                    // Surfaces - Bleu Air France
                    '--bg-primary': '#001f3f',
                    '--bg-secondary': '#002a54',
                    '--bg-panel': '#003366',
                    '--bg-card': '#003d7a',
                    '--bg-card-hover': '#00478f',
                    '--bg-overlay': 'rgba(0, 31, 63, 0.92)',
                    // Text - Blanc éclatant sur bleu
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#e6f2ff',
                    '--text-muted': '#b3d9ff',
                    '--text-label': '#80bfff',
                    // Status - Haute visibilité sur bleu foncé
                    '--status-normal': '#00ff88',
                    '--status-normal-dim': 'rgba(0, 255, 136, 0.15)',
                    '--status-caution': '#ffbb33',
                    '--status-caution-dim': 'rgba(255, 187, 51, 0.15)',
                    '--status-warning': '#ff4d4d',
                    '--status-warning-dim': 'rgba(255, 77, 77, 0.15)',
                    '--status-info': '#00d4ff',
                    '--status-info-dim': 'rgba(0, 212, 255, 0.15)',
                    '--status-cyan': '#00ffff',
                    // Borders
                    '--border-subtle': 'rgba(255, 255, 255, 0.08)',
                    '--border-medium': 'rgba(255, 255, 255, 0.15)',
                    '--border-highlight': 'rgba(0, 255, 136, 0.3)',
                    // Shadows
                    '--shadow-card': '0 4px 16px rgba(0, 0, 0, 0.5)',
                    '--shadow-glow-green': '0 0 24px rgba(0, 255, 136, 0.25)',
                    '--shadow-glow-red': '0 0 24px rgba(255, 77, 77, 0.4)',
                    '--shadow-glow-amber': '0 0 24px rgba(255, 187, 51, 0.3)',
                    // Accent
                    '--accent-blue': '#ed1c24'
                }
            },
            lufthansa: {
                name: 'Lufthansa',
                colors: {
                    // Surfaces - Bleu marine Lufthansa
                    '--bg-primary': '#05164d',
                    '--bg-secondary': '#071d62',
                    '--bg-panel': '#0a2472',
                    '--bg-card': '#0d2b85',
                    '--bg-card-hover': '#103299',
                    '--bg-overlay': 'rgba(5, 22, 77, 0.92)',
                    // Text - Jaune Lufthansa + blanc
                    '--text-primary': '#f9d71c',
                    '--text-secondary': '#ffffff',
                    '--text-muted': '#ffed99',
                    '--text-label': '#ffe566',
                    // Status - Optimisé pour fond bleu marine
                    '--status-normal': '#00ff88',
                    '--status-normal-dim': 'rgba(0, 255, 136, 0.15)',
                    '--status-caution': '#ffcc00',
                    '--status-caution-dim': 'rgba(255, 204, 0, 0.15)',
                    '--status-warning': '#ff4444',
                    '--status-warning-dim': 'rgba(255, 68, 68, 0.15)',
                    '--status-info': '#00ccff',
                    '--status-info-dim': 'rgba(0, 204, 255, 0.15)',
                    '--status-cyan': '#00ffff',
                    // Borders
                    '--border-subtle': 'rgba(249, 215, 28, 0.1)',
                    '--border-medium': 'rgba(249, 215, 28, 0.2)',
                    '--border-highlight': 'rgba(0, 255, 136, 0.3)',
                    // Shadows
                    '--shadow-card': '0 4px 16px rgba(0, 0, 0, 0.6)',
                    '--shadow-glow-green': '0 0 24px rgba(0, 255, 136, 0.3)',
                    '--shadow-glow-red': '0 0 24px rgba(255, 68, 68, 0.5)',
                    '--shadow-glow-amber': '0 0 24px rgba(255, 204, 0, 0.4)',
                    // Accent
                    '--accent-blue': '#f9d71c'
                }
            },
            emirates: {
                name: 'Emirates',
                colors: {
                    // Surfaces - Gris anthracite foncé (CONFORME standards aviation)
                    '--bg-primary': '#0d1117',
                    '--bg-secondary': '#161b22',
                    '--bg-panel': '#1f2937',
                    '--bg-card': '#2d3748',
                    '--bg-card-hover': '#374151',
                    '--bg-overlay': 'rgba(13, 17, 23, 0.95)',
                    // Text - Or Emirates comme accent (pas de rouge)
                    '--text-primary': '#ffd700',
                    '--text-secondary': '#f0e5d0',
                    '--text-muted': '#c9b77a',
                    '--text-label': '#b8a068',
                    // Status - STANDARDS AVIATION (vert/jaune/rouge UNIQUEMENT pour états)
                    '--status-normal': '#00ff88',
                    '--status-normal-dim': 'rgba(0, 255, 136, 0.15)',
                    '--status-caution': '#ffaa00',
                    '--status-caution-dim': 'rgba(255, 170, 0, 0.15)',
                    '--status-warning': '#ff3344',
                    '--status-warning-dim': 'rgba(255, 51, 68, 0.15)',
                    '--status-info': '#00bbff',
                    '--status-info-dim': 'rgba(0, 187, 255, 0.15)',
                    '--status-cyan': '#00e5ff',
                    // Borders - Accent or subtil
                    '--border-subtle': 'rgba(255, 215, 0, 0.08)',
                    '--border-medium': 'rgba(255, 215, 0, 0.15)',
                    '--border-highlight': 'rgba(255, 215, 0, 0.3)',
                    // Shadows
                    '--shadow-card': '0 4px 16px rgba(0, 0, 0, 0.6)',
                    '--shadow-glow-green': '0 0 24px rgba(0, 255, 136, 0.3)',
                    '--shadow-glow-red': '0 0 24px rgba(255, 51, 68, 0.5)',
                    '--shadow-glow-amber': '0 0 24px rgba(255, 170, 0, 0.4)',
                    // Accent - Or Emirates (identité visuelle sans danger)
                    '--accent-blue': '#ffd700'
                }
            },
            british: {
                name: 'British Airways',
                colors: {
                    // Surfaces - Bleu British Airways
                    '--bg-primary': '#075190',
                    '--bg-secondary': '#085da8',
                    '--bg-panel': '#0969c0',
                    '--bg-card': '#0a75d8',
                    '--bg-card-hover': '#0b81f0',
                    '--bg-overlay': 'rgba(7, 81, 144, 0.92)',
                    // Text - Blanc éclatant
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#e6f4ff',
                    '--text-muted': '#b3ddff',
                    '--text-label': '#80c7ff',
                    // Status - Optimisé pour bleu médium
                    '--status-normal': '#00ff88',
                    '--status-normal-dim': 'rgba(0, 255, 136, 0.15)',
                    '--status-caution': '#ffaa00',
                    '--status-caution-dim': 'rgba(255, 170, 0, 0.15)',
                    '--status-warning': '#ff3344',
                    '--status-warning-dim': 'rgba(255, 51, 68, 0.15)',
                    '--status-info': '#00d4ff',
                    '--status-info-dim': 'rgba(0, 212, 255, 0.15)',
                    '--status-cyan': '#00ffff',
                    // Borders
                    '--border-subtle': 'rgba(255, 255, 255, 0.1)',
                    '--border-medium': 'rgba(255, 255, 255, 0.2)',
                    '--border-highlight': 'rgba(0, 255, 136, 0.35)',
                    // Shadows
                    '--shadow-card': '0 4px 16px rgba(0, 0, 0, 0.5)',
                    '--shadow-glow-green': '0 0 24px rgba(0, 255, 136, 0.3)',
                    '--shadow-glow-red': '0 0 24px rgba(255, 51, 68, 0.5)',
                    '--shadow-glow-amber': '0 0 24px rgba(255, 170, 0, 0.35)',
                    // Accent
                    '--accent-blue': '#d32027'
                }
            }
        };

        this.fontSizes = {
            small: {
                name: 'Petit',
                scale: 0.875,
                'font-size-base': '13px',
                'font-size-small': '11px',
                'font-size-large': '15px',
                'font-size-xlarge': '17px'
            },
            medium: {
                name: 'Normal',
                scale: 1.0,
                'font-size-base': '14px',
                'font-size-small': '12px',
                'font-size-large': '16px',
                'font-size-xlarge': '20px'
            },
            large: {
                name: 'Grand',
                scale: 1.125,
                'font-size-base': '16px',
                'font-size-small': '14px',
                'font-size-large': '18px',
                'font-size-xlarge': '22px'
            },
            xlarge: {
                name: 'Très Grand',
                scale: 1.25,
                'font-size-base': '18px',
                'font-size-small': '15px',
                'font-size-large': '20px',
                'font-size-xlarge': '24px'
            }
        };

        this.currentTheme = 'dark';
        this.currentFontSize = 'medium';
        this.autoTheme = false;
        this.customColors = {};

        this.loadPreferences();
        this.initAutoTheme();
    }

    /**
     * Load user preferences from localStorage
     */
    loadPreferences() {
        const saved = localStorage.getItem('aviation-hmi-theme');
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                this.currentTheme = prefs.theme || 'dark';
                this.currentFontSize = prefs.fontSize || 'medium';
                this.autoTheme = prefs.autoTheme || false;
                this.customColors = prefs.customColors || {};
            } catch (e) {
                console.error('[THEME] Failed to load preferences:', e);
            }
        }
    }

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        const prefs = {
            theme: this.currentTheme,
            fontSize: this.currentFontSize,
            autoTheme: this.autoTheme,
            customColors: this.customColors
        };
        localStorage.setItem('aviation-hmi-theme', JSON.stringify(prefs));
    }

    /**
     * Initialize automatic theme switching based on time
     */
    initAutoTheme() {
        if (this.autoTheme) {
            this.updateAutoTheme();
            setInterval(() => this.updateAutoTheme(), 60000); // Check every minute
        }
    }

    /**
     * Update theme based on time of day
     */
    updateAutoTheme() {
        if (!this.autoTheme) return;

        const hour = new Date().getHours();
        const newTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
        
        if (newTheme !== this.currentTheme) {
            this.setTheme(newTheme, false);
        }
    }

    /**
     * Set current theme
     */
    setTheme(themeName, savePrefs = true) {
        if (!this.themes[themeName]) {
            console.error('[THEME] Unknown theme:', themeName);
            return false;
        }

        this.currentTheme = themeName;
        const theme = this.themes[themeName];

        // Apply theme colors
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Apply custom colors if any
        Object.entries(this.customColors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Update body class
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeName}`);

        if (savePrefs) {
            this.savePreferences();
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeName }
        }));

        return true;
    }

    /**
     * Set font size
     */
    setFontSize(sizeName) {
        if (!this.fontSizes[sizeName]) {
            console.error('[THEME] Unknown font size:', sizeName);
            return false;
        }

        this.currentFontSize = sizeName;
        const size = this.fontSizes[sizeName];

        // Apply font sizes to root element
        const root = document.documentElement;
        root.style.setProperty('--font-scale', size.scale);
        
        // Apply font size variables (they already have the correct format)
        if (size['font-size-base']) root.style.setProperty('--font-size-base', size['font-size-base']);
        if (size['font-size-small']) root.style.setProperty('--font-size-small', size['font-size-small']);
        if (size['font-size-large']) root.style.setProperty('--font-size-large', size['font-size-large']);
        if (size['font-size-xlarge']) root.style.setProperty('--font-size-xlarge', size['font-size-xlarge']);

        // Apply scale to body for immediate visual feedback
        document.body.style.fontSize = size['font-size-base'];

        this.savePreferences();

        // Dispatch event
        window.dispatchEvent(new CustomEvent('fontSizeChanged', {
            detail: { fontSize: sizeName }
        }));

        return true;
    }

    /**
     * Set auto theme switching
     */
    setAutoTheme(enabled) {
        this.autoTheme = enabled;
        this.savePreferences();

        if (enabled) {
            this.updateAutoTheme();
            this.autoThemeInterval = setInterval(() => this.updateAutoTheme(), 60000);
        } else if (this.autoThemeInterval) {
            clearInterval(this.autoThemeInterval);
        }
    }

    /**
     * Set custom color
     */
    setCustomColor(property, value) {
        this.customColors[property] = value;
        document.documentElement.style.setProperty(property, value);
        this.savePreferences();
    }

    /**
     * Reset custom colors
     */
    resetCustomColors() {
        this.customColors = {};
        this.setTheme(this.currentTheme, false);
        this.savePreferences();
    }

    /**
     * Get available themes
     */
    getAvailableThemes() {
        return Object.entries(this.themes).map(([key, theme]) => ({
            id: key,
            name: theme.name
        }));
    }

    /**
     * Get available font sizes
     */
    getAvailableFontSizes() {
        return Object.entries(this.fontSizes).map(([key, size]) => ({
            id: key,
            name: size.name
        }));
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get current font size
     */
    getCurrentFontSize() {
        return this.currentFontSize;
    }

    /**
     * Create theme settings panel
     */
    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'theme-settings';
        panel.innerHTML = `
            <div class="theme-settings__header">
                <h3 data-i18n="theme.title">Personnalisation</h3>
                <button class="theme-settings__close" id="theme-close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="theme-settings__content">
                <div class="theme-settings__section">
                    <h4 data-i18n="theme.theme_label">Thème</h4>
                    <div class="theme-settings__grid" id="theme-selector">
                        ${this.getAvailableThemes().map(theme => `
                            <button class="theme-card ${theme.id === this.currentTheme ? 'theme-card--active' : ''}" 
                                    data-theme="${theme.id}">
                                <div class="theme-card__preview theme-preview-${theme.id}"></div>
                                <span class="theme-card__name">${theme.name}</span>
                            </button>
                        `).join('')}
                    </div>
                    <label class="theme-settings__checkbox">
                        <input type="checkbox" id="auto-theme-toggle" ${this.autoTheme ? 'checked' : ''}>
                        <span data-i18n="theme.auto_theme">Mode automatique (jour/nuit)</span>
                    </label>
                </div>

                <div class="theme-settings__section">
                    <h4 data-i18n="theme.font_size_label">Taille de Police</h4>
                    <div class="theme-settings__font-sizes" id="font-size-selector">
                        ${this.getAvailableFontSizes().map(size => `
                            <button class="font-size-btn ${size.id === this.currentFontSize ? 'font-size-btn--active' : ''}" 
                                    data-size="${size.id}">
                                ${size.name}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="theme-settings__section">
                    <h4 data-i18n="theme.custom_colors">Couleurs Personnalisées</h4>
                    <div class="theme-settings__colors">
                        <div class="color-picker">
                            <label data-i18n="theme.warning_color">Avertissement:</label>
                            <input type="color" data-property="--color-warning" 
                                   value="${this.customColors['--color-warning'] || '#ff3344'}">
                        </div>
                        <div class="color-picker">
                            <label data-i18n="theme.caution_color">Attention:</label>
                            <input type="color" data-property="--color-caution" 
                                   value="${this.customColors['--color-caution'] || '#ffaa00'}">
                        </div>
                        <div class="color-picker">
                            <label data-i18n="theme.normal_color">Normal:</label>
                            <input type="color" data-property="--color-normal" 
                                   value="${this.customColors['--color-normal'] || '#00ff88'}">
                        </div>
                    </div>
                    <button class="btn btn--ghost" id="reset-colors-btn" data-i18n="theme.reset_colors">
                        Réinitialiser les couleurs
                    </button>
                </div>
            </div>
        `;

        // Bind events
        this.bindPanelEvents(panel);

        return panel;
    }

    /**
     * Bind events to settings panel
     */
    bindPanelEvents(panel) {
        // Close button
        const closeBtn = panel.querySelector('#theme-close-btn');
        closeBtn?.addEventListener('click', () => {
            panel.classList.add('hidden');
        });

        // Theme selection
        const themeButtons = panel.querySelectorAll('[data-theme]');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const themeName = btn.getAttribute('data-theme');
                this.setTheme(themeName);
                
                // Update active state
                themeButtons.forEach(b => b.classList.remove('theme-card--active'));
                btn.classList.add('theme-card--active');
            });
        });

        // Auto theme toggle
        const autoToggle = panel.querySelector('#auto-theme-toggle');
        autoToggle?.addEventListener('change', (e) => {
            this.setAutoTheme(e.target.checked);
        });

        // Font size selection
        const fontButtons = panel.querySelectorAll('[data-size]');
        fontButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sizeName = btn.getAttribute('data-size');
                this.setFontSize(sizeName);
                
                // Update active state
                fontButtons.forEach(b => b.classList.remove('font-size-btn--active'));
                btn.classList.add('font-size-btn--active');
            });
        });

        // Color pickers
        const colorInputs = panel.querySelectorAll('input[type="color"]');
        colorInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const property = input.getAttribute('data-property');
                this.setCustomColor(property, e.target.value);
            });
        });

        // Reset colors button
        const resetBtn = panel.querySelector('#reset-colors-btn');
        resetBtn?.addEventListener('click', () => {
            this.resetCustomColors();
            // Reset color input values
            colorInputs.forEach(input => {
                const property = input.getAttribute('data-property');
                input.value = this.themes[this.currentTheme].colors[property];
            });
        });
    }

    /**
     * Show settings panel
     */
    showSettings() {
        let panel = document.querySelector('.theme-settings');
        if (!panel) {
            panel = this.createSettingsPanel();
            document.body.appendChild(panel);
        }
        
        panel.classList.remove('hidden');
        
        // Update translations if i18n is available
        if (window.i18n) {
            window.i18n.updateDOM();
        }
    }
}

// Export singleton instance
export const themeManager = new ThemeManager();
window.themeManager = themeManager;

// Apply initial theme
themeManager.setTheme(themeManager.currentTheme, false);
themeManager.setFontSize(themeManager.currentFontSize);

export default themeManager;
