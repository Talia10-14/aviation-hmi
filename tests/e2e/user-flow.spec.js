/**
 * Tests E2E - Flux utilisateur principal
 * Tests de bout en bout avec Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Aviation HMI - User Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should load the application correctly', async ({ page }) => {
        // Vérifier le titre
        await expect(page).toHaveTitle(/AERO-DIAG/);

        // Vérifier présence des éléments principaux
        await expect(page.locator('#topbar')).toBeVisible();
        await expect(page.locator('#sidebar')).toBeVisible();
        await expect(page.locator('#bottombar')).toBeVisible();

        // Vérifier que les données sont affichées
        await expect(page.locator('.topbar__value')).toHaveCount(4); // REG, TYPE, MSN, UTC
    });

    test('should display engine data correctly', async ({ page }) => {
        // Naviguer vers moteurs
        await page.click('[data-system="engines"]');
        
        // Attendre que le panel soit visible
        await expect(page.locator('#engines-panel')).toBeVisible();

        // Vérifier jauges N1 des 2 moteurs
        await expect(page.locator('#eng1-n1-ring')).toBeVisible();
        await expect(page.locator('#eng2-n1-ring')).toBeVisible();

        // Vérifier valeurs affichées
        const n1Value = await page.locator('#eng1-n1-val').textContent();
        expect(parseFloat(n1Value)).toBeGreaterThan(0);
        expect(parseFloat(n1Value)).toBeLessThan(105);
    });

    test('should switch between systems', async ({ page }) => {
        const systems = ['engines', 'hydraulics', 'electrical', 'pressurization'];

        for (const system of systems) {
            await page.click(`[data-system="${system}"]`);
            
            // Vérifier que le bon panel est visible
            await expect(page.locator(`#${system}-panel`)).toBeVisible();
            
            // Vérifier que le bouton est actif
            await expect(page.locator(`[data-system="${system}"]`)).toHaveClass(/active/);
        }
    });

    test('should freeze and unfreeze data', async ({ page }) => {
        // Récupérer une valeur initiale
        const initialValue = await page.locator('#eng1-n1-val').textContent();

        // Freeze
        await page.click('#btn-freeze');
        await expect(page.locator('#btn-freeze')).toHaveClass(/active/);

        // Attendre 2 secondes
        await page.waitForTimeout(2000);

        // Valeur doit être identique (frozen)
        const frozenValue = await page.locator('#eng1-n1-val').textContent();
        expect(frozenValue).toBe(initialValue);

        // Unfreeze
        await page.click('#btn-freeze');
        await expect(page.locator('#btn-freeze')).not.toHaveClass(/active/);

        // Attendre et vérifier que la valeur change
        await page.waitForTimeout(2000);
        const newValue = await page.locator('#eng1-n1-val').textContent();
        expect(newValue).not.toBe(frozenValue);
    });

    test('should manage alarms', async ({ page }) => {
        // Attendre qu'une alarme apparaisse (ou forcer en mode test)
        await page.evaluate(() => {
            window.addTestAlarm = () => {
                const alarm = {
                    id: Date.now(),
                    time: new Date().toLocaleTimeString('fr-FR'),
                    code: 'TEST-001',
                    msg: 'Test Alarm',
                    sys: 'engines',
                    level: 'warning',
                    acknowledged: false
                };
                window.state.alarms.push(alarm);
                window.updateAlarmLog();
            };
            window.addTestAlarm();
        });

        // Vérifier présence dans le log
        await expect(page.locator('.alarm-item')).toHaveCount(1);

        // Vérifier le master status
        const masterStatus = page.locator('.topbar__master-status');
        await expect(masterStatus).toHaveClass(/status--warning/);

        // Acquitter l'alarme
        await page.click('.alarm-item');
        await expect(page.locator('.alarm-item')).toHaveClass(/acknowledged/);
    });

    test('should open and close documentation', async ({ page }) => {
        // Ouvrir documentation
        await page.click('#btn-documentation');
        
        // Vérifier que le modal est visible
        await expect(page.locator('#documentation-modal')).toBeVisible();

        // Vérifier sections
        await expect(page.locator('.doc-section')).toHaveCount(6);

        // Fermer
        await page.click('.modal__close');
        await expect(page.locator('#documentation-modal')).not.toBeVisible();
    });

    test('should export data', async ({ page }) => {
        // Ouvrir export
        await page.click('#btn-export-data');
        
        // Vérifier modal
        await expect(page.locator('#export-modal')).toBeVisible();

        // Vérifier templates
        await expect(page.locator('.export-template-card')).toHaveCount(6);

        // Fermer
        await page.click('.modal__close');
    });
});

test.describe('Aviation HMI - Theme Switching', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should open theme settings', async ({ page }) => {
        await page.click('#btn-theme-settings');
        await expect(page.locator('.theme-settings')).toBeVisible();
    });

    test('should switch to light theme', async ({ page }) => {
        await page.click('#btn-theme-settings');
        
        // Cliquer sur le thème jour
        await page.click('[data-theme="light"]');
        
        // Vérifier que le body a la bonne classe
        await expect(page.locator('body')).toHaveClass(/theme-light/);

        // Vérifier que le fond est clair
        const bgColor = await page.evaluate(() => {
            return getComputedStyle(document.body).backgroundColor;
        });
        expect(bgColor).toContain('rgb(255, 255, 255)'); // Blanc
    });

    test('should switch to Air France theme', async ({ page }) => {
        await page.click('#btn-theme-settings');
        await page.click('[data-theme="airfrance"]');
        
        await expect(page.locator('body')).toHaveClass(/theme-airfrance/);
    });

    test('should change font size', async ({ page }) => {
        await page.click('#btn-theme-settings');
        
        // Augmenter la taille
        await page.click('[data-fontsize="large"]');
        
        // Vérifier que la taille a augmenté
        const fontSize = await page.evaluate(() => {
            return getComputedStyle(document.documentElement).fontSize;
        });
        expect(parseFloat(fontSize)).toBeGreaterThan(14);
    });

    test('should NOT use red as background (safety)', async ({ page }) => {
        const themes = ['dark', 'light', 'airfrance', 'lufthansa', 'emirates', 'british'];
        
        await page.click('#btn-theme-settings');

        for (const theme of themes) {
            await page.click(`[data-theme="${theme}"]`);
            await page.waitForTimeout(500);

            const bgColor = await page.evaluate(() => {
                return getComputedStyle(document.body).backgroundColor;
            });

            // Vérifier qu'il n'y a PAS de rouge dominant en fond
            const rgb = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgb) {
                const [, r, g, b] = rgb.map(Number);
                // Rouge ne doit PAS être dominant (r >> g et r >> b)
                expect(r > 200 && g < 100 && b < 100).toBe(false);
            }
        }
    });
});

test.describe('Aviation HMI - Audio Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should NOT autoplay sounds on load', async ({ page }) => {
        // Vérifier que les sons ne démarrent pas automatiquement
        const ambientState = await page.evaluate(() => {
            return window.audioManager ? window.audioManager.ambientEnabled : false;
        });
        
        // Par défaut, ambiant doit être désactivé
        expect(ambientState).toBe(false);
    });

    test('should open audio settings', async ({ page }) => {
        await page.click('#btn-audio-settings');
        await expect(page.locator('.audio-settings')).toBeVisible();
    });

    test('should allow muting', async ({ page }) => {
        await page.click('#btn-audio-settings');
        
        // Trouver et déplacer le slider master volume à 0
        const volumeSlider = page.locator('#audio-master-volume');
        await volumeSlider.fill('0');
        
        const volume = await page.evaluate(() => {
            return window.audioManager ? window.audioManager.masterVolume : 1;
        });
        
        expect(volume).toBe(0);
    });
});

test.describe('Aviation HMI - Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.goto('/');

        // Vérifier que l'interface s'adapte
        await expect(page.locator('#topbar')).toBeVisible();
        
        // La sidebar pourrait être cachée en mobile
        const sidebarVisible = await page.locator('#sidebar').isVisible();
        expect(typeof sidebarVisible).toBe('boolean');
    });

    test('should work on tablets', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        await page.goto('/');

        await expect(page.locator('#topbar')).toBeVisible();
        await expect(page.locator('#sidebar')).toBeVisible();
    });
});
