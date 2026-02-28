/**
 * Internationalization System for Aviation HMI
 * Supports: FR (Français), EN (English), ES (Español), DE (Deutsch), IT (Italiano)
 */

class I18nSystem {
    constructor() {
        this.currentLanguage = 'fr';
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.supportedLanguages = ['fr', 'en', 'es', 'de', 'it'];
        
        this.initTranslations();
        this.loadUserPreference();
    }

    /**
     * Initialize all translations
     */
    initTranslations() {
        this.translations = {
            fr: {
                // Topbar
                'topbar.brand': 'AERO-DIAG',
                'topbar.aircraft': 'AÉRONEF',
                'topbar.type': 'TYPE',
                'topbar.msn': 'MSN',
                'topbar.utc': 'UTC',
                'topbar.flt_time': 'TEMPS VOL',
                'topbar.session': 'SESSION',
                'topbar.status.normal': 'SYSTÈMES NORMAUX',
                'topbar.status.caution': 'ATTENTION',
                'topbar.status.warning': 'AVERTISSEMENT',

                // Systems
                'systems.engines': 'MOTEURS',
                'systems.hydraulics': 'HYDRAULIQUE',
                'systems.electrical': 'ÉLECTRIQUE',
                'systems.pressurization': 'PRESSURISATION',
                'systems.flight_controls': 'COMMANDES VOL',
                'systems.fuel': 'CARBURANT',
                'systems.apu': 'APU',

                // Parameters
                'param.n1': 'N1',
                'param.n2': 'N2',
                'param.egt': 'EGT',
                'param.ff': 'DÉB. CARB.',
                'param.oil_press': 'PRESS. HUILE',
                'param.vib': 'VIBRATIONS',
                'param.pressure': 'PRESSION',
                'param.quantity': 'QUANTITÉ',
                'param.temperature': 'TEMPÉRATURE',
                'param.voltage': 'TENSION',
                'param.load': 'CHARGE',
                'param.cabin_alt': 'ALT. CABINE',
                'param.delta_p': 'DELTA P',
                'param.rate': 'TAUX',
                'param.valve': 'VALVE',

                // Units
                'unit.percent': '%',
                'unit.celsius': '°C',
                'unit.psi': 'PSI',
                'unit.kg_h': 'kg/h',
                'unit.mils': 'mils',
                'unit.volts': 'V',
                'unit.feet': 'ft',
                'unit.fpm': 'ft/min',
                'unit.liters': 'L',
                'unit.kg': 'kg',

                // Status
                'status.normal': 'NORMAL',
                'status.caution': 'ATTENTION',
                'status.warning': 'AVERTISSEMENT',
                'status.on': 'MARCHE',
                'status.off': 'ARRÊT',
                'status.fault': 'DÉFAUT',
                'status.degraded': 'DÉGRADÉ',

                // Buttons
                'btn.master_warn': 'MASTER WARN',
                'btn.master_caut': 'MASTER CAUT',
                'btn.ack_all': 'ACQ. TOUT',
                'btn.reset': 'RÉINIT.',
                'btn.export': 'EXPORTER CFR',
                'btn.test_mode': 'MODE TEST',
                'btn.synoptic': 'SYNOPTIQUE',
                'btn.voice_alerts': 'ALERTES VOCALES',
                'btn.bite': 'BITE',
                'btn.training': 'FORMATION',
                'btn.trends': 'TENDANCES',
                'btn.analytics': 'ANALYTIQUE',
                'btn.close': 'FERMER',
                'btn.cancel': 'ANNULER',
                'btn.confirm': 'CONFIRMER',
                'btn.save': 'ENREGISTRER',
                'btn.delete': 'SUPPRIMER',
                'btn.clear': 'EFFACER',
                'btn.start': 'DÉMARRER',
                'btn.end': 'TERMINER',
                'btn.history': 'HISTORIQUE',
                'btn.export_csv': 'EXPORTER',
                'btn.ok': 'OK',

                // Training Mode
                'training.title': 'Mode Formation',
                'training.active_scenario': 'Scénario Actif',
                'training.elapsed': 'Temps Écoulé',
                'training.score': 'Score',
                'training.actions': 'Actions',
                'training.sessions': 'Sessions',
                'training.avg_score': 'Score Moy.',
                'training.pass_rate': 'Taux Réussite',
                'training.scenarios': 'Scénarios de Formation',
                'training.objectives': 'objectifs',
                'training.result': 'Résultat de Formation',
                'training.passed': '✓ RÉUSSI',
                'training.failed': '✗ ÉCHOUÉ',
                'training.scenario': 'Scénario',
                'training.duration': 'Durée',
                'training.completed': 'Actions Complétées',
                'training.missed_actions': 'Actions Manquées',
                'training.history_title': 'Historique de Formation',
                'training.no_history': 'Aucune session enregistrée',
                'training.date': 'Date',
                'training.difficulty.low': 'FACILE',
                'training.difficulty.medium': 'MOYEN',
                'training.difficulty.high': 'DIFFICILE',
                'training.guide.title': 'Guide d\'Utilisation',
                'training.guide.step1': '1. Choisissez un scénario de formation',
                'training.guide.step2': '2. Cliquez sur "DÉMARRER" pour lancer',
                'training.guide.step3': '3. Suivez les instructions à l\'écran',
                'training.guide.step4': '4. Effectuez les actions requises',
                'training.guide.step5': '5. Consultez votre score final',
                'training.guide.tip': 'Conseil : Les scénarios simulent des situations réelles que vous devez gérer correctement.',
                'btn.print': 'IMPRIMER',
                'btn.help': 'AIDE',
                'btn.settings': 'PARAMÈTRES',
                'btn.documentation': 'DOCUMENTATION',

                // Theme & Personalization
                'theme.title': 'Personnalisation',
                'theme.theme_label': 'Thème',
                'theme.font_size_label': 'Taille de Police',
                'theme.custom_colors': 'Couleurs Personnalisées',
                'theme.auto_theme': 'Mode automatique (jour/nuit)',
                'theme.warning_color': 'Avertissement',
                'theme.caution_color': 'Attention',
                'theme.normal_color': 'Normal',
                'theme.reset_colors': 'Réinitialiser les couleurs',

                // User Profiles
                'profile.new': 'Nouveau profil',
                'profile.manage': 'Gérer les profils',
                'profile.manage_title': 'Gestion des Profils',
                'profile.export': 'Exporter',
                'profile.delete': 'Supprimer',
                'profile.confirm_delete': 'Voulez-vous supprimer ce profil ?',
                'profile.enter_name': 'Nom du profil',
                'profile.enter_role': 'Rôle',
                'profile.enter_company': 'Compagnie',
                'profile.created_success': 'Profil {name} créé avec succès',

                // Audio Settings
                'audio.title': 'Paramètres Audio',
                'audio.enable_all': 'Activer tous les sons',
                'audio.master_volume': 'Volume Principal',
                'audio.ambient_sounds': 'Sons d\'ambiance cockpit',
                'audio.ambient_volume': 'Volume ambiance',
                'audio.effects_volume': 'Volume effets sonores',
                'audio.voice_alerts': 'Alertes vocales',
                'audio.test_sounds': 'Test des Sons',
                'audio.test_click': 'Clic',
                'audio.test_success': 'Succès',
                'audio.test_error': 'Erreur',
                'audio.test_warning': 'Alerte',
                'audio.test_voice': 'Voix',
                'audio.test_voice_message': 'Test du système vocal',
                'audio.warning_alarm': 'Avertissement',
                'audio.caution_alarm': 'Attention',
                'audio.advisory_alarm': 'Avis',

                // BITE
                'bite.title': 'BITE - Équipement de Test Intégré',
                'bite.available_systems': 'Systèmes Disponibles',
                'bite.total_tests': 'Tests Totaux',
                'bite.pass_rate': 'Taux de Réussite',
                'bite.failed': 'Échecs',
                'bite.run_test': 'Lancer Test',
                'bite.recent_results': 'Résultats Récents',
                'bite.criticality.critical': 'CRITIQUE',
                'bite.criticality.high': 'ÉLEVÉE',
                'bite.criticality.medium': 'MOYENNE',
                'bite.export_results': 'Exporter Résultats',
                'bite.clear_history': 'Effacer Historique',
                'bite.test_running': 'Test en cours',
                'bite.test_complete': 'Test terminé',

                // Training
                'training.title': 'Mode Formation',
                'training.scenarios': 'Scénarios de Formation',
                'training.total_sessions': 'Sessions',
                'training.avg_score': 'Score Moyen',
                'training.pass_rate': 'Taux de Réussite',
                'training.start': 'DÉMARRER',
                'training.end_scenario': 'Terminer Scénario',
                'training.difficulty.low': 'FACILE',
                'training.difficulty.medium': 'MOYEN',
                'training.difficulty.high': 'DIFFICILE',
                'training.score': 'Score',
                'training.actions': 'Actions',
                'training.elapsed': 'Écoulé',
                'training.passed': 'RÉUSSI',
                'training.failed': 'ÉCHOUÉ',
                'training.history': 'Historique',

                // Trends
                'trends.title': 'Surveillance des Tendances',
                'trends.flights_recorded': 'Vols Enregistrés',
                'trends.parameters': 'Paramètres',
                'trends.normal': 'NORMAL',
                'trends.degrading': 'DÉGRADÉ',
                'trends.active_alerts': 'Alertes Actives',
                'trends.recording': 'Enregistrement en cours',
                'trends.start_recording': 'Démarrer Enregistrement',
                'trends.generate_report': 'Générer Rapport',
                'trends.clear_data': 'Effacer Données',
                'trends.acknowledge': 'Acquitter',
                'trends.monitored_parameters': 'Paramètres Surveillés',

                // Messages
                'msg.confirm_reset': 'Confirmer la réinitialisation ?',
                'msg.confirm_clear': 'Effacer toutes les données ?',
                'msg.no_faults': 'AUCUN DÉFAUT ACTIF',
                'msg.loading': 'Chargement...',
                'msg.saving': 'Enregistrement...',
                'msg.export_success': '✅ Export {format} réussi !',
                'msg.export_error': '❌ Erreur lors de l\'export : {error}',
                'msg.test_started': 'Test démarré',
                'msg.test_failed': 'Test échoué',
                'msg.scenario_started': 'Scénario démarré',
                'msg.recording_started': 'Enregistrement démarré',
                'msg.no_procedure': 'Aucune procédure disponible pour {code}',
                'msg.confirm_bite_clear': 'Effacer tous les résultats des tests BITE ?',
                'msg.confirm_trend_clear': 'Effacer toutes les données de surveillance des tendances ?',
                'msg.confirm_analytics_reset': 'Réinitialiser toutes les données analytiques ?',
                'msg.analytics_reset_success': 'Données analytiques réinitialisées avec succès',
                'msg.confirm_history_clear': '⚠️ Effacer tout l\'historique des défauts ? Cette action ne peut pas être annulée.',
                'msg.confirm_end_scenario': 'Terminer le scénario de formation actuel ?',
                'msg.scenario_info': 'Scénario de formation démarré : {name}\n\nSuivez les objectifs et répondez aux événements.',
                'msg.scenario_error': 'Erreur lors du démarrage du scénario : {error}',

                // Documentation
                'doc.title': 'Documentation Système',
                'doc.quick_start': 'Démarrage Rapide',
                'doc.user_guide': 'Guide Utilisateur',
                'doc.troubleshooting': 'Dépannage',
                'doc.faq': 'FAQ',
                'doc.about': 'À Propos',
                'doc.version': 'Version',

                // Analytics
                'analytics.title': 'Tableau de Bord Analytique',
                'analytics.overview': 'Aperçu',
                'analytics.reliability': 'Fiabilité',
                'analytics.maintenance': 'Maintenance',
                'analytics.mtbf': 'MTBF',
                'analytics.mttr': 'MTTR',
                'analytics.predictions': 'Prédictions',

                // Procedures
                'proc.immediate_actions': 'ACTIONS IMMÉDIATES :',
                'proc.effects': 'EFFETS :',
                'proc.limitations': 'LIMITATIONS :',
                'proc.maintenance': 'MAINTENANCE :',
                'proc.references': 'RÉFÉRENCES :',
                'proc.category': 'Catégorie',
                'proc.task': 'Tâche',
                'proc.title': 'PROCÉDURE :',
                'proc.view': 'Voir Procédure',
                'proc.button': 'PROC'
            },

            en: {
                // Topbar
                'topbar.brand': 'AERO-DIAG',
                'topbar.aircraft': 'AIRCRAFT',
                'topbar.type': 'TYPE',
                'topbar.msn': 'MSN',
                'topbar.utc': 'UTC',
                'topbar.flt_time': 'FLT TIME',
                'topbar.session': 'SESSION',
                'topbar.status.normal': 'SYSTEMS NORMAL',
                'topbar.status.caution': 'CAUTION',
                'topbar.status.warning': 'WARNING',

                // Systems
                'systems.engines': 'ENGINES',
                'systems.hydraulics': 'HYDRAULICS',
                'systems.electrical': 'ELECTRICAL',
                'systems.pressurization': 'PRESSURIZATION',
                'systems.flight_controls': 'FLIGHT CONTROLS',
                'systems.fuel': 'FUEL',
                'systems.apu': 'APU',

                // Parameters
                'param.n1': 'N1',
                'param.n2': 'N2',
                'param.egt': 'EGT',
                'param.ff': 'FUEL FLOW',
                'param.oil_press': 'OIL PRESS',
                'param.vib': 'VIBRATION',
                'param.pressure': 'PRESSURE',
                'param.quantity': 'QUANTITY',
                'param.temperature': 'TEMPERATURE',
                'param.voltage': 'VOLTAGE',
                'param.load': 'LOAD',
                'param.cabin_alt': 'CABIN ALT',
                'param.delta_p': 'DELTA P',
                'param.rate': 'RATE',
                'param.valve': 'VALVE',

                // Units (same as French)
                'unit.percent': '%',
                'unit.celsius': '°C',
                'unit.psi': 'PSI',
                'unit.kg_h': 'kg/h',
                'unit.mils': 'mils',
                'unit.volts': 'V',
                'unit.feet': 'ft',
                'unit.fpm': 'ft/min',
                'unit.liters': 'L',
                'unit.kg': 'kg',

                // Status
                'status.normal': 'NORMAL',
                'status.caution': 'CAUTION',
                'status.warning': 'WARNING',
                'status.on': 'ON',
                'status.off': 'OFF',
                'status.fault': 'FAULT',
                'status.degraded': 'DEGRADED',

                // Buttons
                'btn.master_warn': 'MASTER WARN',
                'btn.master_caut': 'MASTER CAUT',
                'btn.ack_all': 'ACK ALL',
                'btn.reset': 'RESET',
                'btn.export': 'EXPORT CFR',
                'btn.test_mode': 'TEST MODE',
                'btn.synoptic': 'SYNOPTIC',
                'btn.voice_alerts': 'VOICE ALERTS',
                'btn.bite': 'BITE',
                'btn.training': 'TRAINING',
                'btn.trends': 'TRENDS',
                'btn.analytics': 'ANALYTICS',
                'btn.close': 'CLOSE',
                'btn.cancel': 'CANCEL',
                'btn.confirm': 'CONFIRM',
                'btn.save': 'SAVE',
                'btn.delete': 'DELETE',
                'btn.clear': 'CLEAR',
                'btn.print': 'PRINT',
                'btn.help': 'HELP',
                'btn.settings': 'SETTINGS',
                'btn.documentation': 'DOCUMENTATION',

                // Theme & Personalization
                'theme.title': 'Customization',
                'theme.theme_label': 'Theme',
                'theme.font_size_label': 'Font Size',
                'theme.custom_colors': 'Custom Colors',
                'theme.auto_theme': 'Automatic mode (day/night)',
                'theme.warning_color': 'Warning',
                'theme.caution_color': 'Caution',
                'theme.normal_color': 'Normal',
                'theme.reset_colors': 'Reset colors',

                // User Profiles
                'profile.new': 'New profile',
                'profile.manage': 'Manage profiles',
                'profile.manage_title': 'Profile Management',
                'profile.export': 'Export',
                'profile.delete': 'Delete',
                'profile.confirm_delete': 'Do you want to delete this profile?',
                'profile.enter_name': 'Profile name',
                'profile.enter_role': 'Role',
                'profile.enter_company': 'Company',
                'profile.created_success': 'Profile {name} created successfully',

                // Audio Settings
                'audio.title': 'Audio Settings',
                'audio.enable_all': 'Enable all sounds',
                'audio.master_volume': 'Master Volume',
                'audio.ambient_sounds': 'Cockpit ambient sounds',
                'audio.ambient_volume': 'Ambient volume',
                'audio.effects_volume': 'Sound effects volume',
                'audio.voice_alerts': 'Voice alerts',
                'audio.test_sounds': 'Test Sounds',
                'audio.test_click': 'Click',
                'audio.test_success': 'Success',
                'audio.test_error': 'Error',
                'audio.test_warning': 'Alert',
                'audio.test_voice': 'Voice',
                'audio.test_voice_message': 'Voice system test',
                'audio.warning_alarm': 'Warning',
                'audio.caution_alarm': 'Caution',
                'audio.advisory_alarm': 'Advisory',

                // BITE
                'bite.title': 'BITE - Built-In Test Equipment',
                'bite.available_systems': 'Available Systems',
                'bite.total_tests': 'Total Tests',
                'bite.pass_rate': 'Pass Rate',
                'bite.failed': 'Failed',
                'bite.run_test': 'Run Test',
                'bite.recent_results': 'Recent Results',
                'bite.criticality.critical': 'CRITICAL',
                'bite.criticality.high': 'HIGH',
                'bite.criticality.medium': 'MEDIUM',
                'bite.export_results': 'Export Results',
                'bite.clear_history': 'Clear History',
                'bite.test_running': 'Test running',
                'bite.test_complete': 'Test complete',

                // Training
                'training.title': 'Training Mode',
                'training.scenarios': 'Training Scenarios',
                'training.total_sessions': 'Sessions',
                'training.avg_score': 'Avg Score',
                'training.pass_rate': 'Pass Rate',
                'training.start': 'START',
                'training.end_scenario': 'End Scenario',
                'training.difficulty.low': 'LOW',
                'training.difficulty.medium': 'MEDIUM',
                'training.difficulty.high': 'HIGH',
                'training.score': 'Score',
                'training.actions': 'Actions',
                'training.elapsed': 'Elapsed',
                'training.passed': 'PASSED',
                'training.failed': 'FAILED',
                'training.history': 'History',
                'training.active_scenario': 'Active Scenario',
                'training.no_active_scenario': 'No active scenario',
                'training.select_scenario': 'Select one of the scenarios above to start training',
                'training.guide.title': 'How to use Training Mode',
                'training.guide.step1': '1. Choose a scenario from the list above based on your training goals',
                'training.guide.step2': '2. Click START to begin the simulation',
                'training.guide.step3': '3. Respond to events and system failures according to procedures',
                'training.guide.step4': '4. Your actions are evaluated in real-time',
                'training.guide.step5': '5. At the end, you receive a detailed performance report with feedback',
                'training.guide.tip': '💡 Tip: Read the scenario description before starting to prepare adequately',
                'training.history_title': 'Training History',
                'training.no_history': 'No training sessions recorded yet',
                'training.result': 'Training Result',
                'training.scenario': 'Scenario',
                'training.completion_time': 'Completion Time',
                'training.completed_at': 'Completed',
                'training.view_details': 'View Details',

                // Trends
                'trends.title': 'Trend Monitoring',
                'trends.flights_recorded': 'Flights Recorded',
                'trends.parameters': 'Parameters',
                'trends.normal': 'NORMAL',
                'trends.degrading': 'DEGRADING',
                'trends.active_alerts': 'Active Alerts',
                'trends.recording': 'Recording in progress',
                'trends.start_recording': 'Start Recording',
                'trends.generate_report': 'Generate Report',
                'trends.clear_data': 'Clear Data',
                'trends.acknowledge': 'Acknowledge',
                'trends.monitored_parameters': 'Monitored Parameters',

                // Messages
                'msg.confirm_reset': 'Confirm reset?',
                'msg.confirm_clear': 'Clear all data?',
                'msg.no_faults': 'NO ACTIVE FAULTS',
                'msg.loading': 'Loading...',
                'msg.saving': 'Saving...',
                'msg.export_success': '✅ {format} export successful!',
                'msg.export_error': '❌ Export error: {error}',
                'msg.test_started': 'Test started',
                'msg.test_failed': 'Test failed',
                'msg.scenario_started': 'Scenario started',
                'msg.recording_started': 'Recording started',
                'msg.no_procedure': 'No procedure available for {code}',
                'msg.confirm_bite_clear': 'Clear all BITE test results?',
                'msg.confirm_trend_clear': 'Clear all trend monitoring data?',
                'msg.confirm_analytics_reset': 'Reset all analytics data?',
                'msg.analytics_reset_success': 'Analytics data reset successfully',
                'msg.confirm_history_clear': '⚠️ Clear all fault history? This action cannot be undone.',
                'msg.confirm_end_scenario': 'End current training scenario?',
                'msg.scenario_info': 'Training scenario started: {name}\n\nFollow the objectives and respond to events.',
                'msg.scenario_error': 'Error starting scenario: {error}',

                // Documentation
                'doc.title': 'System Documentation',
                'doc.quick_start': 'Quick Start',
                'doc.user_guide': 'User Guide',
                'doc.troubleshooting': 'Troubleshooting',
                'doc.faq': 'FAQ',
                'doc.about': 'About',
                'doc.version': 'Version',

                // Analytics
                'analytics.title': 'Analytics Dashboard',
                'analytics.overview': 'Overview',
                'analytics.reliability': 'Reliability',
                'analytics.maintenance': 'Maintenance',
                'analytics.mtbf': 'MTBF',
                'analytics.mttr': 'MTTR',
                'analytics.predictions': 'Predictions',

                // Procedures
                'proc.immediate_actions': 'IMMEDIATE ACTIONS:',
                'proc.effects': 'EFFECTS:',
                'proc.limitations': 'LIMITATIONS:',
                'proc.maintenance': 'MAINTENANCE:',
                'proc.references': 'REFERENCES:',
                'proc.category': 'Category',
                'proc.task': 'Task',
                'proc.title': 'PROCEDURE:',
                'proc.view': 'View Procedure',
                'proc.button': 'PROC'
            },

            es: {
                // Topbar
                'topbar.brand': 'AERO-DIAG',
                'topbar.aircraft': 'AERONAVE',
                'topbar.type': 'TIPO',
                'topbar.msn': 'MSN',
                'topbar.utc': 'UTC',
                'topbar.flt_time': 'TIEMPO VUELO',
                'topbar.session': 'SESIÓN',
                'topbar.status.normal': 'SISTEMAS NORMALES',
                'topbar.status.caution': 'PRECAUCIÓN',
                'topbar.status.warning': 'ADVERTENCIA',

                // Systems
                'systems.engines': 'MOTORES',
                'systems.hydraulics': 'HIDRÁULICA',
                'systems.electrical': 'ELÉCTRICO',
                'systems.pressurization': 'PRESURIZACIÓN',
                'systems.flight_controls': 'CONTROLES VUELO',
                'systems.fuel': 'COMBUSTIBLE',
                'systems.apu': 'APU',

                // Buttons (abbreviated translations)
                'btn.master_warn': 'MASTER WARN',
                'btn.master_caut': 'MASTER CAUT',
                'btn.ack_all': 'ACK TODO',
                'btn.reset': 'REINICIAR',
                'btn.export': 'EXPORTAR CFR',
                'btn.test_mode': 'MODO TEST',
                'btn.synoptic': 'SINÓPTICO',
                'btn.voice_alerts': 'ALERTAS VOZ',
                'btn.bite': 'BITE',
                'btn.training': 'FORMACIÓN',
                'btn.trends': 'TENDENCIAS',
                'btn.analytics': 'ANALÍTICA',
                'btn.close': 'CERRAR',
                'btn.documentation': 'DOCUMENTACIÓN',

                // BITE
                'bite.title': 'BITE - Equipo de Prueba Integrado',
                'bite.available_systems': 'Sistemas Disponibles',
                'bite.run_test': 'Ejecutar Prueba',

                // Training
                'training.title': 'Modo Formación',
                'training.start': 'INICIAR',
                'training.passed': 'APROBADO',
                'training.failed': 'FALLADO',
                'training.history': 'Historial',
                'training.active_scenario': 'Escenario Activo',
                'training.no_active_scenario': 'Sin escenario activo',
                'training.select_scenario': 'Seleccione uno de los escenarios anteriores para iniciar la formación',
                'training.guide.title': 'Cómo usar el Modo Formación',
                'training.guide.step1': '1. Elija un escenario de la lista según sus objetivos de formación',
                'training.guide.step2': '2. Haga clic en INICIAR para comenzar la simulación',
                'training.guide.step3': '3. Responda a eventos y fallos del sistema según los procedimientos',
                'training.guide.step4': '4. Sus acciones son evaluadas en tiempo real',
                'training.guide.step5': '5. Al final, recibe un informe detallado de rendimiento con retroalimentación',
                'training.guide.tip': '💡 Consejo: Lea la descripción del escenario antes de comenzar para prepararse adecuadamente',
                'training.history_title': 'Historial de Formación',
                'training.no_history': 'Aún no se han registrado sesiones de formación',
                'training.result': 'Resultado de Formación',
                'training.scenario': 'Escenario',
                'training.completion_time': 'Tiempo de Finalización',
                'training.completed_at': 'Completado',
                'training.view_details': 'Ver Detalles',

                // Trends
                'trends.title': 'Monitoreo de Tendencias',

                // Messages
                'msg.no_faults': 'SIN FALLOS ACTIVOS',
                'msg.loading': 'Cargando...',
                'msg.no_procedure': 'No hay procedimiento disponible para {code}',
                'msg.confirm_bite_clear': '¿Borrar todos los resultados de pruebas BITE?',
                'msg.confirm_trend_clear': '¿Borrar todos los datos de monitoreo de tendencias?',
                'msg.confirm_analytics_reset': '¿Restablecer todos los datos analíticos?',
                'msg.analytics_reset_success': 'Datos analíticos restablecidos con éxito',
                'msg.confirm_history_clear': '⚠️ ¿Borrar todo el historial de fallos? Esta acción no se puede deshacer.',
                'msg.confirm_end_scenario': '¿Terminar el escenario de formación actual?',
                'msg.scenario_info': 'Escenario de formación iniciado: {name}\n\nSiga los objetivos y responda a los eventos.',
                'msg.scenario_error': 'Error al iniciar el escenario: {error}',
                'msg.export_success': '✅ ¡Exportación {format} exitosa!',
                'msg.export_error': '❌ Error de exportación: {error}',

                // Procedures
                'proc.immediate_actions': 'ACCIONES INMEDIATAS:',
                'proc.effects': 'EFECTOS:',
                'proc.limitations': 'LIMITACIONES:',
                'proc.maintenance': 'MANTENIMIENTO:',
                'proc.references': 'REFERENCIAS:',
                'proc.category': 'Categoría',
                'proc.task': 'Tarea',
                'proc.title': 'PROCEDIMIENTO:',
                'proc.view': 'Ver Procedimiento',
                'proc.button': 'PROC'
            },

            de: {
                // Topbar
                'topbar.brand': 'AERO-DIAG',
                'topbar.aircraft': 'FLUGZEUG',
                'topbar.type': 'TYP',
                'topbar.status.normal': 'SYSTEME NORMAL',
                'topbar.status.caution': 'VORSICHT',
                'topbar.status.warning': 'WARNUNG',

                // Systems
                'systems.engines': 'TRIEBWERKE',
                'systems.hydraulics': 'HYDRAULIK',
                'systems.electrical': 'ELEKTRISCH',
                'systems.pressurization': 'DRUCKBEAUFSCHLAGUNG',
                'systems.flight_controls': 'FLUGSTEUERUNG',
                'systems.fuel': 'KRAFTSTOFF',

                // Buttons
                'btn.master_warn': 'MASTER WARN',
                'btn.master_caut': 'MASTER CAUT',
                'btn.ack_all': 'ALLE BEST.',
                'btn.reset': 'ZURÜCKSETZEN',
                'btn.export': 'EXPORTIEREN CFR',
                'btn.test_mode': 'TESTMODUS',
                'btn.synoptic': 'SYNOPTIK',
                'btn.voice_alerts': 'SPRACHALARME',
                'btn.bite': 'BITE',
                'btn.training': 'SCHULUNG',
                'btn.trends': 'TRENDS',
                'btn.analytics': 'ANALYTIK',
                'btn.close': 'SCHLIESSEN',
                'btn.documentation': 'DOKUMENTATION',

                // BITE
                'bite.title': 'BITE - Integrierte Testausrüstung',
                'bite.run_test': 'Test Starten',

                // Training
                'training.title': 'Trainingsmodus',
                'training.start': 'START',
                'training.passed': 'BESTANDEN',
                'training.failed': 'FEHLGESCHLAGEN',
                'training.history': 'Verlauf',
                'training.active_scenario': 'Aktives Szenario',
                'training.no_active_scenario': 'Kein aktives Szenario',
                'training.select_scenario': 'Wählen Sie eines der oben genannten Szenarien aus, um mit dem Training zu beginnen',
                'training.guide.title': 'Verwendung des Trainingsmodus',
                'training.guide.step1': '1. Wählen Sie ein Szenario aus der Liste basierend auf Ihren Trainingszielen',
                'training.guide.step2': '2. Klicken Sie auf START, um die Simulation zu beginnen',
                'training.guide.step3': '3. Reagieren Sie auf Ereignisse und Systemausfälle gemäß den Verfahren',
                'training.guide.step4': '4. Ihre Aktionen werden in Echtzeit bewertet',
                'training.guide.step5': '5. Am Ende erhalten Sie einen detaillierten Leistungsbericht mit Feedback',
                'training.guide.tip': '💡 Tipp: Lesen Sie die Szenariobeschreibung, bevor Sie beginnen, um sich angemessen vorzubereiten',
                'training.history_title': 'Trainingsverlauf',
                'training.no_history': 'Noch keine Trainingssitzungen aufgezeichnet',
                'training.result': 'Trainingsergebnis',
                'training.scenario': 'Szenario',
                'training.completion_time': 'Abschlusszeit',
                'training.completed_at': 'Abgeschlossen',
                'training.view_details': 'Details Anzeigen',

                // Messages
                'msg.no_faults': 'KEINE AKTIVEN FEHLER',
                'msg.loading': 'Laden...',
                'msg.no_procedure': 'Kein Verfahren verfügbar für {code}',
                'msg.confirm_bite_clear': 'Alle BITE-Testergebnisse löschen?',
                'msg.confirm_trend_clear': 'Alle Trendüberwachungsdaten löschen?',
                'msg.confirm_analytics_reset': 'Alle Analysedaten zurücksetzen?',
                'msg.analytics_reset_success': 'Analysedaten erfolgreich zurückgesetzt',
                'msg.confirm_history_clear': '⚠️ Gesamten Fehlerverlauf löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
                'msg.confirm_end_scenario': 'Aktuelles Trainingsszenario beenden?',
                'msg.scenario_info': 'Trainingsszenario gestartet: {name}\n\nFolgen Sie den Zielen und reagieren Sie auf Ereignisse.',
                'msg.scenario_error': 'Fehler beim Starten des Szenarios: {error}',
                'msg.export_success': '✅ {format}-Export erfolgreich!',
                'msg.export_error': '❌ Exportfehler: {error}',

                // Procedures
                'proc.immediate_actions': 'SOFORTMASSNAHMEN:',
                'proc.effects': 'AUSWIRKUNGEN:',
                'proc.limitations': 'EINSCHRÄNKUNGEN:',
                'proc.maintenance': 'WARTUNG:',
                'proc.references': 'REFERENZEN:',
                'proc.category': 'Kategorie',
                'proc.task': 'Aufgabe',
                'proc.title': 'VERFAHREN:',
                'proc.view': 'Verfahren Anzeigen',
                'proc.button': 'VERF'
            },

            it: {
                // Topbar
                'topbar.brand': 'AERO-DIAG',
                'topbar.aircraft': 'AEROMOBILE',
                'topbar.type': 'TIPO',
                'topbar.status.normal': 'SISTEMI NORMALI',
                'topbar.status.caution': 'ATTENZIONE',
                'topbar.status.warning': 'AVVERTIMENTO',

                // Systems
                'systems.engines': 'MOTORI',
                'systems.hydraulics': 'IDRAULICA',
                'systems.electrical': 'ELETTRICO',
                'systems.pressurization': 'PRESSURIZZAZIONE',
                'systems.flight_controls': 'COMANDI VOLO',
                'systems.fuel': 'CARBURANTE',

                // Buttons
                'btn.master_warn': 'MASTER WARN',
                'btn.master_caut': 'MASTER CAUT',
                'btn.ack_all': 'ACK TUTTO',
                'btn.reset': 'RIPRISTINA',
                'btn.export': 'ESPORTA CFR',
                'btn.test_mode': 'MODO TEST',
                'btn.synoptic': 'SINOTTICO',
                'btn.voice_alerts': 'ALLARMI VOCALI',
                'btn.bite': 'BITE',
                'btn.training': 'ADDESTRAMENTO',
                'btn.trends': 'TENDENZE',
                'btn.analytics': 'ANALITICA',
                'btn.close': 'CHIUDI',
                'btn.documentation': 'DOCUMENTAZIONE',

                // BITE
                'bite.title': 'BITE - Apparecchiatura di Test Integrata',
                'bite.run_test': 'Avvia Test',

                // Training
                'training.title': 'Modalità Addestramento',
                'training.start': 'AVVIA',
                'training.passed': 'SUPERATO',
                'training.failed': 'FALLITO',
                'training.history': 'Cronologia',
                'training.active_scenario': 'Scenario Attivo',
                'training.no_active_scenario': 'Nessuno scenario attivo',
                'training.select_scenario': 'Seleziona uno degli scenari sopra per iniziare l\'addestramento',
                'training.guide.title': 'Come Usare la Modalità Addestramento',
                'training.guide.step1': '1. Scegli uno scenario dall\'elenco in base ai tuoi obiettivi di addestramento',
                'training.guide.step2': '2. Fai clic su AVVIA per iniziare la simulazione',
                'training.guide.step3': '3. Rispondi agli eventi e ai guasti del sistema secondo le procedure',
                'training.guide.step4': '4. Le tue azioni vengono valutate in tempo reale',
                'training.guide.step5': '5. Alla fine, ricevi un rapporto dettagliato sulle prestazioni con feedback',
                'training.guide.tip': '💡 Suggerimento: Leggi la descrizione dello scenario prima di iniziare per prepararti adeguatamente',
                'training.history_title': 'Cronologia Addestramento',
                'training.no_history': 'Nessuna sessione di addestramento ancora registrata',
                'training.result': 'Risultato Addestramento',
                'training.scenario': 'Scenario',
                'training.completion_time': 'Tempo di Completamento',
                'training.completed_at': 'Completato',
                'training.view_details': 'Visualizza Dettagli',

                // Messages
                'msg.no_faults': 'NESSUN GUASTO ATTIVO',
                'msg.loading': 'Caricamento...',
                'msg.no_procedure': 'Nessuna procedura disponibile per {code}',
                'msg.confirm_bite_clear': 'Cancellare tutti i risultati dei test BITE?',
                'msg.confirm_trend_clear': 'Cancellare tutti i dati di monitoraggio delle tendenze?',
                'msg.confirm_analytics_reset': 'Ripristinare tutti i dati analitici?',
                'msg.analytics_reset_success': 'Dati analitici ripristinati con successo',
                'msg.confirm_history_clear': '⚠️ Cancellare tutta la cronologia dei guasti? Questa azione non può essere annullata.',
                'msg.confirm_end_scenario': 'Terminare lo scenario di addestramento corrente?',
                'msg.scenario_info': 'Scenario di addestramento avviato: {name}\n\nSegui gli obiettivi e rispondi agli eventi.',
                'msg.scenario_error': 'Errore nell\'avvio dello scenario: {error}',
                'msg.export_success': '✅ Esportazione {format} riuscita!',
                'msg.export_error': '❌ Errore di esportazione: {error}',

                // Procedures
                'proc.immediate_actions': 'AZIONI IMMEDIATE:',
                'proc.effects': 'EFFETTI:',
                'proc.limitations': 'LIMITAZIONI:',
                'proc.maintenance': 'MANUTENZIONE:',
                'proc.references': 'RIFERIMENTI:',
                'proc.category': 'Categoria',
                'proc.task': 'Compito',
                'proc.title': 'PROCEDURA:',
                'proc.view': 'Visualizza Procedura',
                'proc.button': 'PROC'
            }
        };
    }

    /**
     * Load user language preference from localStorage
     */
    loadUserPreference() {
        const saved = localStorage.getItem('aviation-hmi-language');
        if (saved && this.supportedLanguages.includes(saved)) {
            this.currentLanguage = saved;
        } else {
            // Try to detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (this.supportedLanguages.includes(browserLang)) {
                this.currentLanguage = browserLang;
            }
        }
    }

    /**
     * Save language preference
     */
    saveUserPreference() {
        localStorage.setItem('aviation-hmi-language', this.currentLanguage);
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @param {object} params - Optional parameters for interpolation
     * @returns {string} - Translated string
     */
    t(key, params = {}) {
        const langData = this.translations[this.currentLanguage] || this.translations[this.fallbackLanguage];
        let translation = langData[key];

        // Fallback to English if not found
        if (!translation && this.currentLanguage !== this.fallbackLanguage) {
            translation = this.translations[this.fallbackLanguage][key];
        }

        // Fallback to key itself if still not found
        if (!translation) {
            console.warn(`[i18n] Missing translation: ${key}`);
            return key;
        }

        // Simple parameter interpolation {param}
        Object.keys(params).forEach(param => {
            translation = translation.replace(new RegExp(`{${param}}`, 'g'), params[param]);
        });

        return translation;
    }

    /**
     * Change current language
     * @param {string} langCode - Language code (fr, en, es, de, it)
     */
    setLanguage(langCode) {
        if (!this.supportedLanguages.includes(langCode)) {
            console.error(`[i18n] Unsupported language: ${langCode}`);
            return false;
        }

        this.currentLanguage = langCode;
        this.saveUserPreference();
        this.updateDOM();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: langCode } 
        }));

        return true;
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages.map(code => ({
            code,
            name: this.getLanguageName(code),
            flag: this.getLanguageFlag(code)
        }));
    }

    /**
     * Get language display name
     */
    getLanguageName(code) {
        const names = {
            fr: 'Français',
            en: 'English',
            es: 'Español',
            de: 'Deutsch',
            it: 'Italiano'
        };
        return names[code] || code;
    }

    /**
     * Get language flag emoji
     */
    getLanguageFlag(code) {
        const flags = {
            fr: '🇫🇷',
            en: '🇬🇧',
            es: '🇪🇸',
            de: '🇩🇪',
            it: '🇮🇹'
        };
        return flags[code] || '🌐';
    }

    /**
     * Update all DOM elements with data-i18n attribute
     */
    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // Check if we should update text content or attribute
            const attr = el.getAttribute('data-i18n-attr');
            if (attr) {
                el.setAttribute(attr, translation);
            } else {
                el.textContent = translation;
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // Update aria-labels
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            el.setAttribute('aria-label', this.t(key));
        });
        
        // Notify other components that DOM was updated
        window.dispatchEvent(new CustomEvent('i18nUpdated', { 
            detail: { language: this.currentLanguage } 
        }));
    }

    /**
     * Create language selector widget
     */
    createLanguageSelector() {
        const container = document.createElement('div');
        container.className = 'language-selector';
        container.innerHTML = `
            <button class="language-selector__btn" id="lang-selector-btn">
                <span class="language-selector__flag">${this.getLanguageFlag(this.currentLanguage)}</span>
                <span class="language-selector__code">${this.currentLanguage.toUpperCase()}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="language-selector__dropdown hidden" id="lang-dropdown">
                ${this.getSupportedLanguages().map(lang => `
                    <button class="language-selector__option ${lang.code === this.currentLanguage ? 'language-selector__option--active' : ''}" 
                            data-lang="${lang.code}">
                        <span class="language-selector__flag">${lang.flag}</span>
                        <span class="language-selector__name">${lang.name}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Add event listeners
        const btn = container.querySelector('#lang-selector-btn');
        const dropdown = container.querySelector('#lang-dropdown');

        btn.addEventListener('click', () => {
            dropdown.classList.toggle('hidden');
        });

        container.querySelectorAll('.language-selector__option').forEach(option => {
            option.addEventListener('click', () => {
                const langCode = option.getAttribute('data-lang');
                this.setLanguage(langCode);
                dropdown.classList.add('hidden');
                
                // Update selector display
                btn.querySelector('.language-selector__flag').textContent = this.getLanguageFlag(langCode);
                btn.querySelector('.language-selector__code').textContent = langCode.toUpperCase();
                
                // Update active state
                container.querySelectorAll('.language-selector__option').forEach(opt => {
                    opt.classList.remove('language-selector__option--active');
                });
                option.classList.add('language-selector__option--active');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        return container;
    }
}

// Singleton instance
export const i18n = new I18nSystem();

// Global exposure
window.i18n = i18n;

// Auto-update DOM on language change
window.addEventListener('languageChanged', () => {
    i18n.updateDOM();
});

export default i18n;
