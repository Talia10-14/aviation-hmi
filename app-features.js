/**
 * App Features Integration
 * Initializes voice alerts, synoptics, and procedures features
 */

import { voiceAlerts } from './voice-alerts.js';
import SynopticDisplay from './synoptics.js';
import { PROCEDURES, getProcedure, formatProcedure } from './procedures.js';
import { FaultHistoryManager, MaintenanceTracker } from './fault-history.js';

// Initialize features
const synopticDisplay = new SynopticDisplay('synoptic-container');
const faultHistory = new FaultHistoryManager();
const maintenanceTracker = new MaintenanceTracker();

let synopticVisible = false;

// Function to trigger voice alert from fault code
function triggerVoiceAlertForFault(faultCode, level) {
    if (!voiceAlerts.enabled) return;
    
    // Map fault code to voice alert
    const alertType = voiceAlerts.mapFaultToAlert(faultCode);
    if (alertType) {
        voiceAlerts.trigger(alertType);
    } else if (level === 'warning') {
        voiceAlerts.trigger('MASTER_WARNING');
    } else if (level === 'caution') {
        voiceAlerts.trigger('MASTER_CAUTION');
    }
}

// Function to cancel voice alert for cleared fault
function cancelVoiceAlertForFault(faultCode) {
    const alertType = voiceAlerts.mapFaultToAlert(faultCode);
    if (alertType) {
        voiceAlerts.cancel(alertType);
    }
}

// Function to show procedure modal
function showProcedureModal(faultCode) {
    const procedure = getProcedure(faultCode);
    
    if (!procedure) {
        const message = window.i18n ? 
            window.i18n.t('msg.no_procedure', { code: faultCode }) : 
            `No procedure available for ${faultCode}`;
        const title = window.i18n ? window.i18n.t('proc.title') : 'PROCEDURE';
        window.showError(title, message);
        return;
    }
    
    // Helper function to get translation
    const t = (key) => window.i18n ? window.i18n.t(key) : key;
    const closeLabel = window.i18n ? window.i18n.t('btn.close') : 'CLOSE';
    const printLabel = window.i18n ? window.i18n.t('btn.print') : 'PRINT';
    const procTitle = window.i18n ? window.i18n.t('proc.title') : 'PROCEDURE:';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'procedure-modal';
    modal.innerHTML = `
        <div class="procedure-modal__backdrop"></div>
        <div class="procedure-modal__content">
            <div class="procedure-modal__header">
                <h2><i class="fas fa-book"></i> ${procTitle} ${procedure.code}</h2>
                <button class="procedure-modal__close" aria-label="${closeLabel}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="procedure-modal__body">
                ${formatProcedure(procedure)}
            </div>
            <div class="procedure-modal__footer">
                <button class="btn btn--ghost procedure-modal__print">
                    <i class="fas fa-print"></i> ${printLabel}
                </button>
                <button class="btn btn--primary procedure-modal__close-btn">
                    <i class="fas fa-check"></i> ${closeLabel}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add close handlers
    modal.querySelectorAll('.procedure-modal__close, .procedure-modal__close-btn, .procedure-modal__backdrop').forEach(el => {
        el.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // Print handler
    modal.querySelector('.procedure-modal__print')?.addEventListener('click', () => {
        window.print();
    });
    
    // ESC key handler
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Toggle synoptic display
function toggleSynoptic(systemKey, data) {
    const container = document.getElementById('synoptic-container');
    const allPanels = document.querySelectorAll('.diagnostic__engines, .diagnostic__generic-panel');
    const btn = document.getElementById('btn-synoptic');
    
    synopticVisible = !synopticVisible;
    
    if (synopticVisible) {
        // Show synoptic
        allPanels.forEach(panel => panel.classList.add('hidden'));
        container.classList.remove('hidden');
        btn.classList.add('btn--active');
        btn.setAttribute('aria-pressed', 'true');
        
        // Display synoptic for current system
        synopticDisplay.show(getSystemKey(systemKey), data);
    } else {
        // Hide synoptic
        container.classList.add('hidden');
        allPanels.forEach(panel => {
            const panelId = panel.id.replace('-panel', '');
            if (panelId === systemKey || panel.id === 'engines-panel') {
                panel.classList.remove('hidden');
            }
        });
        btn.classList.remove('btn--active');
        btn.setAttribute('aria-pressed', 'false');
        synopticDisplay.hide();
    }
}

// Map system key for synoptics (convert to uppercase shorthand)
function getSystemKey(systemKey) {
    const mapping = {
        'hydraulics': 'HYD',
        'electrical': 'ELEC',
        'fuel': 'FUEL',
        'pressurization': 'PRESS',
        'flight-controls': 'FCTL',
        'engines': 'ENG',
        'apu': 'APU'
    };
    return mapping[systemKey] || systemKey.toUpperCase();
}

// Update synoptic if visible
function updateSynopticIfVisible(systemKey, data) {
    if (synopticVisible) {
        synopticDisplay.show(getSystemKey(systemKey), data);
    }
}

// Initialize event listeners
function initFeatures() {
    console.log('🚀 Initializing Aviation HMI Features...');
    
    // Voice alerts button
    const voiceAlertsBtn = document.getElementById('btn-voice-alerts');
    if (voiceAlertsBtn) {
        voiceAlertsBtn.addEventListener('click', () => {
            voiceAlerts.setEnabled(!voiceAlerts.enabled);
            voiceAlertsBtn.classList.toggle('btn--active', voiceAlerts.enabled);
            voiceAlertsBtn.setAttribute('aria-pressed', voiceAlerts.enabled.toString());
            
            const icon = voiceAlertsBtn.querySelector('i');
            if (icon) {
                icon.className = voiceAlerts.enabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            }
            
            console.log(`Voice alerts ${voiceAlerts.enabled ? 'enabled' : 'disabled'}`);
        });
    }
    
    // Synoptic button
    const synopticBtn = document.getElementById('btn-synoptic');
    if (synopticBtn) {
        synopticBtn.addEventListener('click', () => {
            // Get current system from global state (if available)
            const currentSystem = window.appState?.activeSystem || 'engines';
            const currentData = window.appState?.sensorData || {};
            toggleSynoptic(currentSystem, currentData[currentSystem] || currentData);
        });
    }
    
    console.log('✅ Features initialized');
    console.log(`   - Voice Alerts: ${voiceAlerts.enabled ? 'ON' : 'OFF'}`);
    console.log(`   - Synoptics: Ready`);
    console.log(`   - Procedures: ${Object.keys(PROCEDURES).length} loaded`);
}

// Expose to global scope for app.js integration
window.appFeatures = {
    voiceAlerts,
    synopticDisplay,
    faultHistory,
    maintenanceTracker,
    triggerVoiceAlertForFault,
    cancelVoiceAlertForFault,
    showProcedureModal,
    toggleSynoptic,
    updateSynopticIfVisible,
    initFeatures
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeatures);
} else {
    initFeatures();
}

export {
    voiceAlerts,
    synopticDisplay,
    faultHistory,
    maintenanceTracker,
    triggerVoiceAlertForFault,
    cancelVoiceAlertForFault,
    showProcedureModal,
    toggleSynoptic,
    updateSynopticIfVisible,
    initFeatures
};
