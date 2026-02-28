/**
 * Emergency and Caution Procedures Database
 * ECAM-style procedures for fault isolation and recovery
 * Based on EASA CS-25 and Airbus FCOM standards
 */

export const PROCEDURES = {
    'ENG-N1-HI': {
        level: 'warning',
        title: 'ENG 1 N1 ABOVE LIMIT',
        immediateActions: [
            { action: 'THR LEVER 1.....................IDLE', type: 'action' },
            { action: 'If no improvement:', type: 'condition' },
            { action: 'ENG 1 MASTER................OFF', type: 'action', critical: true }
        ],
        effects: [
            'Engine performance degraded',
            'Single engine operation required',
            'Maximum altitude limited'
        ],
        limitations: [
            'MAX ALT: FL250 (single engine)',
            'MAX SPEED: 250 kt below FL100',
            'Landing distance increased'
        ],
        references: [
            'FCOM 3.04.70 p1',
            'QRH ENG-01'
        ]
    },

    'ENG-EGT-HI': {
        level: 'warning',
        title: 'ENGINE EGT EXCEEDANCE',
        immediateActions: [
            { action: 'AFFECTED ENGINE:', type: 'title' },
            { action: 'THR LEVER.....................IDLE', type: 'action' },
            { action: 'Monitor EGT decrease', type: 'monitor' },
            { action: 'If EGT > 900°C for > 15 sec:', type: 'condition' },
            { action: 'ENG MASTER..................OFF', type: 'action', critical: true }
        ],
        effects: [
            'Engine damage risk',
            'Possible turbine failure',
            'Oil system degradation'
        ],
        limitations: [
            'LAND AS SOON AS POSSIBLE',
            'Single engine approach required',
            'Maintenance action required'
        ],
        maintenance: {
            task: 'BORESCOPE INSPECTION',
            amm: '72-00-00',
            category: 'CAT 1 - Before next flight'
        },
        references: [
            'FCOM 3.04.71 p2',
            'QRH ENG-02',
            'AMM 72-00-00-860-801'
        ]
    },

    'ENG-OIL-LO': {
        level: 'caution',
        title: 'ENGINE OIL PRESSURE LOW',
        immediateActions: [
            { action: 'AFFECTED ENGINE:', type: 'title' },
            { action: 'Monitor oil pressure and quantity', type: 'monitor' },
            { action: 'If pressure < 20 PSI:', type: 'condition' },
            { action: 'THR LEVER.....................IDLE', type: 'action' },
            { action: 'ENG MASTER..................OFF', type: 'action', critical: true }
        ],
        effects: [
            'Engine lubrication compromised',
            'Bearing damage risk',
            'Possible engine seizure'
        ],
        limitations: [
            'DO NOT ATTEMPT RELIGHT',
            'Land at nearest suitable airport',
            'Avoid high power settings'
        ],
        maintenance: {
            task: 'OIL SYSTEM CHECK',
            amm: '79-10-00',
            category: 'CAT 1 - Before next flight'
        },
        references: [
            'FCOM 3.04.72 p1',
            'QRH ENG-05'
        ]
    },

    'HYD-GRN-LO': {
        level: 'warning',
        title: 'GREEN HYDRAULIC PRESSURE LOW',
        immediateActions: [
            { action: 'CHECK:', type: 'title' },
            { action: '- Green system pressure', type: 'monitor' },
            { action: '- Green reservoir quantity', type: 'monitor' },
            { action: 'ENG 1 N2 > 63%', type: 'verify' },
            { action: 'If pressure remains LOW:', type: 'condition' },
            { action: 'GREEN HYD PUMP..............OFF', type: 'action' }
        ],
        effects: [
            'Normal braking degraded',
            'Nose wheel steering limited',
            'One spoiler inoperative',
            'Cargo doors inoperative'
        ],
        limitations: [
            'Landing distance increased by 1.4',
            'Use alternate brakes (Yellow + Blue)',
            'Parking brake inoperative',
            'Avoid contaminated runway'
        ],
        compensations: [
            'Blue hydraulic provides alternate braking',
            'Yellow hydraulic provides backup systems',
            'Emergency braking available'
        ],
        references: [
            'FCOM 3.02.29 p1',
            'QRH HYD-01'
        ]
    },

    'PRESS-CAB-HI': {
        level: 'warning',
        title: 'CABIN ALTITUDE HIGH',
        immediateActions: [
            { action: 'CREW OXYGEN MASKS............ON', type: 'action', critical: true },
            { action: '100% OXYGEN', type: 'action' },
            { action: 'ANNOUNCE: Emergency descent', type: 'action' },
            { action: 'EMER DESCENT..............INITIATE', type: 'action', critical: true },
            { action: 'Target: FL100 or MSA', type: 'target' }
        ],
        effects: [
            'Hypoxia risk for crew and passengers',
            'Time of useful consciousness limited',
            'Immediate action required'
        ],
        limitations: [
            'EMERGENCY DESCENT REQUIRED',
            'MAX SPEED: VMO/MMO',
            'LAND AS SOON AS POSSIBLE'
        ],
        timeConstraints: {
            '25000 ft': '3-5 minutes TUC',
            '30000 ft': '1-2 minutes TUC',
            '35000 ft': '30-60 seconds TUC',
            '40000 ft': '15-20 seconds TUC'
        },
        references: [
            'FCOM 3.07.35 p1',
            'QRH PRESS-01',
            'EMERGENCY DESCENT procedure'
        ]
    },

    'ELEC-GEN-HI': {
        level: 'caution',
        title: 'AC GENERATOR OVERLOAD',
        immediateActions: [
            { action: 'AFFECTED GENERATOR:', type: 'title' },
            { action: 'Shed non-essential electrical loads', type: 'action' },
            { action: 'Monitor generator load', type: 'monitor' },
            { action: 'If load remains > 100%:', type: 'condition' },
            { action: 'GEN............OFF then RESET', type: 'action' }
        ],
        effects: [
            'Generator trip risk',
            'Electrical system degraded',
            'Battery discharge if single gen'
        ],
        loadShedding: [
            'Galley power (if installed)',
            'Window heat (if possible)',
            'Non-essential lighting',
            'Entertainment systems'
        ],
        references: [
            'FCOM 3.03.24 p2',
            'QRH ELEC-02'
        ]
    },

    'FUEL-QTY-LO': {
        level: 'caution',
        title: 'FUEL QUANTITY LOW',
        immediateActions: [
            { action: 'CHECK fuel quantity all tanks', type: 'monitor' },
            { action: 'VERIFY flight plan fuel', type: 'verify' },
            { action: 'CONSIDER diversion to nearest suitable', type: 'action' },
            { action: 'If quantity critical:', type: 'condition' },
            { action: 'DECLARE MINIMUM FUEL', type: 'action', critical: true }
        ],
        effects: [
            'Flight endurance limited',
            'Diversion capability reduced',
            'Holding not possible'
        ],
        minFuel: {
            reserve: '30 min at 1500 ft',
            alternate: 'Cruise to alternate + descent',
            final: 'Circuit + approach + go-around'
        },
        references: [
            'FCOM 3.05.28 p1',
            'QRH FUEL-01',
            'ICAO Annex 6 fuel requirements'
        ]
    },

    'FCTL-ELAC-1': {
        level: 'warning',
        title: 'ELAC 1 FAULT',
        immediateActions: [
            { action: 'FLIGHT CONTROLS - CHECK', type: 'verify' },
            { action: 'Normal control law degraded to:', type: 'info' },
            { action: 'ALTERNATE LAW (without protections)', type: 'info' },
            { action: 'Monitor control surfaces', type: 'monitor' }
        ],
        effects: [
            'Elevator/THS control degraded',
            'No pitch normal law',
            'No high AOA protection',
            'No high speed protection',
            'Load factor limited to +2.5g / -1.0g'
        ],
        limitations: [
            'DIRECT LAW if both ELAC fail',
            'MAX SPEED: 320 kt / M 0.82',
            'Smooth control inputs required',
            'Landing configuration early recommended'
        ],
        pilotingTechnique: [
            'Manual pitch trim required',
            'Smooth inputs to avoid overshoot',
            'Monitor speed carefully',
            'Anticipate control responses',
            'Increased landing distance'
        ],
        references: [
            'FCOM 3.01.27 p3',
            'QRH FCTL-01',
            'FCTM Alternate Law procedures'
        ]
    }
};

/**
 * Get procedure for a given fault code
 * @param {string} faultCode - The ECAM fault code
 * @returns {object|null} Procedure object or null if not found
 */
export function getProcedure(faultCode) {
    return PROCEDURES[faultCode] || null;
}

/**
 * Get all procedures for a given severity level
 * @param {string} level - 'warning' or 'caution'
 * @returns {Array} Array of procedures
 */
export function getProceduresByLevel(level) {
    return Object.entries(PROCEDURES)
        .filter(([_, proc]) => proc.level === level)
        .map(([code, proc]) => ({ code, ...proc }));
}

/**
 * Format procedure for display
 * @param {object} procedure - Procedure object
 * @returns {string} Formatted HTML string
 */
export function formatProcedure(procedure) {
    if (!procedure) return '';

    // Helper function to get translation
    const t = (key) => window.i18n ? window.i18n.t(key) : key;

    let html = `<div class="procedure">`;
    html += `<h3 class="procedure__title">${procedure.title}</h3>`;

    // Immediate actions
    if (procedure.immediateActions?.length) {
        html += `<div class="procedure__section">`;
        html += `<h4 class="procedure__section-title">${t('proc.immediate_actions')}</h4>`;
        html += `<ul class="procedure__actions">`;
        
        procedure.immediateActions.forEach(action => {
            const className = action.critical ? 'critical' : action.type;
            html += `<li class="procedure__action procedure__action--${className}">`;
            html += action.action;
            html += `</li>`;
        });
        
        html += `</ul></div>`;
    }

    // Effects
    if (procedure.effects?.length) {
        html += `<div class="procedure__section">`;
        html += `<h4 class="procedure__section-title">${t('proc.effects')}</h4>`;
        html += `<ul class="procedure__list">`;
        procedure.effects.forEach(effect => {
            html += `<li>${effect}</li>`;
        });
        html += `</ul></div>`;
    }

    // Limitations
    if (procedure.limitations?.length) {
        html += `<div class="procedure__section procedure__section--warning">`;
        html += `<h4 class="procedure__section-title">${t('proc.limitations')}</h4>`;
        html += `<ul class="procedure__list">`;
        procedure.limitations.forEach(limit => {
            html += `<li>${limit}</li>`;
        });
        html += `</ul></div>`;
    }

    // Maintenance
    if (procedure.maintenance) {
        html += `<div class="procedure__section procedure__section--maint">`;
        html += `<h4 class="procedure__section-title">${t('proc.maintenance')}</h4>`;
        html += `<p><strong>${t('proc.task')}: ${procedure.maintenance.task}</strong></p>`;
        html += `<p>AMM: ${procedure.maintenance.amm}</p>`;
        html += `<p>${t('proc.category')}: ${procedure.maintenance.category}</p>`;
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

export default PROCEDURES;
