/**
 * Configuration centralisée pour l'application AERO-DIAG
 * Modifiez ces valeurs pour personnaliser le comportement de l'application
 */

export const CONFIG = {
    // ── Timings ──
    UPDATE_INTERVAL: 1000,          // Fréquence de mise à jour des capteurs (ms)
    ALARM_CHECK_INTERVAL: 3000,     // Fréquence de vérification des alarmes (ms)
    ANIMATION_DURATION: 300,        // Durée des animations de transition (ms)
    
    // ── Limits ──
    MAX_LOG_ENTRIES: 50,            // Nombre maximum d'entrées dans le log ECAM
    MAX_ALARMS_BEFORE_CRITICAL: 10, // Seuil pour passer en mode critique
    
    // ── Debug ──
    DEBUG_MODE: false,              // Active les logs verbeux en console
    VERBOSE_LOGGING: false,         // Logs encore plus détaillés
    
    // ── Simulation ──
    ALARM_PROBABILITY: 0.15,        // Probabilité d'alarme par vérification (0-1)
    JITTER_MULTIPLIER: 1.0,         // Multiplicateur de variation des capteurs
    
    // ── Aircraft Data ──
    AIRCRAFT: {
        registration: 'F-GKXA',
        type: 'A320-214',
        msn: '2145',
        engineType: 'CFM56-5B4'
    },
    
    // ── UI ──
    THEME: 'dark',                  // 'dark' ou 'light' (à implémenter)
    SHOW_SCANLINE: true,            // Afficher l'effet scanline
    ENABLE_SOUNDS: false,           // Sons d'alerte (à implémenter)
    
    // ── Export ──
    EXPORT_FORMAT: 'json',          // Format d'export par défaut
    INCLUDE_SENSOR_DATA: true,      // Inclure les données capteurs dans l'export
    
    // ── Performance ──
    ENABLE_ANIMATIONS: true,        // Activer/désactiver les animations
    REDUCE_MOTION: false,           // Mode réduit pour accessibilité
};

/**
 * Seuils des paramètres par système
 * Format : { caution, warning, max, [cautionLo, warningLo] }
 */
export const THRESHOLDS = {
    // ── Moteurs ──
    n1: { 
        caution: 95, 
        warning: 101, 
        max: 104,
        unit: '%',
        name: 'N1 - Fan Speed'
    },
    egt: { 
        caution: 750, 
        warning: 900, 
        max: 950,
        unit: '°C',
        name: 'Exhaust Gas Temperature'
    },
    n2: { 
        caution: 97, 
        warning: 102, 
        max: 105,
        unit: '%',
        name: 'N2 - Core Speed'
    },
    ff: { 
        max: 3000,
        unit: 'kg/h',
        name: 'Fuel Flow'
    },
    oilPress: { 
        cautionLo: 30, 
        warningLo: 20, 
        cautionHi: 85, 
        warningHi: 95, 
        max: 100,
        unit: 'PSI',
        name: 'Oil Pressure'
    },
    vibN1: { 
        caution: 3.0, 
        warning: 4.5, 
        max: 6.0,
        unit: 'mils',
        name: 'N1 Vibration'
    },
    
    // ── Hydraulique ──
    hydraulicPress: {
        warning: 1500,
        caution: 2500,
        max: 3500,
        unit: 'PSI',
        name: 'Hydraulic Pressure'
    },
    hydraulicTemp: {
        caution: 85,
        warning: 100,
        max: 120,
        unit: '°C',
        name: 'Hydraulic Temperature'
    },
    
    // ── Électrique ──
    acBusVoltage: {
        warningLo: 95,
        cautionLo: 105,
        nominal: 115,
        cautionHi: 125,
        warningHi: 130,
        unit: 'V',
        name: 'AC Bus Voltage'
    },
    dcBusVoltage: {
        warningLo: 22,
        cautionLo: 25,
        nominal: 28,
        cautionHi: 30,
        warningHi: 32,
        unit: 'V',
        name: 'DC Bus Voltage'
    },
    generatorLoad: {
        caution: 80,
        warning: 95,
        max: 100,
        unit: '%',
        name: 'Generator Load'
    },
    batteryTemp: {
        caution: 45,
        warning: 55,
        max: 70,
        unit: '°C',
        name: 'Battery Temperature'
    },
    
    // ── Pressurisation ──
    cabinAltitude: {
        caution: 8000,
        warning: 10000,
        max: 14000,
        unit: 'ft',
        name: 'Cabin Altitude'
    },
    deltaP: {
        caution: 8.5,
        warning: 9.0,
        max: 9.5,
        unit: 'PSI',
        name: 'Cabin Delta P'
    },
    
    // ── Carburant ──
    fuelQuantity: {
        warning: 1500,
        caution: 2500,
        max: 18000,
        unit: 'kg',
        name: 'Fuel Quantity'
    }
};

/**
 * Codes de fautes ECAM
 */
export const FAULT_CODES = [
    { code: 'ENG-N1-HI', msg: 'ENGINE 1 N1 ABOVE LIMIT', sys: 'engines', level: 'warning' },
    { code: 'ENG-EGT-HI', msg: 'ENGINE EGT EXCEEDANCE', sys: 'engines', level: 'warning' },
    { code: 'ENG-OIL-LO', msg: 'ENGINE OIL PRESSURE LOW', sys: 'engines', level: 'caution' },
    { code: 'ENG-VIB-HI', msg: 'ENGINE VIBRATION HIGH', sys: 'engines', level: 'caution' },
    { code: 'HYD-GRN-LO', msg: 'GREEN HYDRAULIC PRESSURE LOW', sys: 'hydraulics', level: 'warning' },
    { code: 'HYD-BLU-LO', msg: 'BLUE HYDRAULIC PRESSURE LOW', sys: 'hydraulics', level: 'caution' },
    { code: 'HYD-YEL-LO', msg: 'YELLOW HYDRAULIC PRESSURE LOW', sys: 'hydraulics', level: 'caution' },
    { code: 'ELEC-GEN-HI', msg: 'AC GENERATOR OVERLOAD', sys: 'electrical', level: 'caution' },
    { code: 'ELEC-BAT-HI', msg: 'BATTERY TEMPERATURE HIGH', sys: 'electrical', level: 'warning' },
    { code: 'ELEC-BUS-LO', msg: 'AC BUS VOLTAGE LOW', sys: 'electrical', level: 'warning' },
    { code: 'PRESS-CAB-HI', msg: 'CABIN ALTITUDE HIGH', sys: 'pressurization', level: 'warning' },
    { code: 'PRESS-DP-HI', msg: 'CABIN DIFFERENTIAL PRESSURE HIGH', sys: 'pressurization', level: 'caution' },
    { code: 'FCTL-ELAC-1', msg: 'ELAC 1 FAULT', sys: 'flight-controls', level: 'warning' },
    { code: 'FCTL-SEC-2', msg: 'SEC 2 FAULT', sys: 'flight-controls', level: 'caution' },
    { code: 'FUEL-QTY-LO', msg: 'FUEL QUANTITY LOW', sys: 'fuel', level: 'caution' },
    { code: 'FUEL-TEMP-HI', msg: 'FUEL TEMPERATURE HIGH', sys: 'fuel', level: 'caution' },
    { code: 'APU-EGT-HI', msg: 'APU EGT HIGH', sys: 'apu', level: 'warning' },
];

export default CONFIG;
