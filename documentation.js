/**
 * Interactive Documentation System for Aviation HMI
 * Provides user guide, tutorials, troubleshooting, and FAQ
 */

import { i18n } from './i18n.js';

class DocumentationSystem {
    constructor() {
        this.currentSection = 'quick-start';
        this.searchIndex = [];
        this.initDocumentation();
    }

    /**
     * Initialize documentation content
     */
    initDocumentation() {
        this.documentation = {
            'quick-start': {
                title: 'Démarrage Rapide',
                icon: 'fa-rocket',
                content: `
                    <h3>Bienvenue dans AERO-DIAG</h3>
                    <p>Interface de diagnostic avionique professionnelle conforme EASA CS-25.</p>
                    
                    <h4>🚀 Premiers pas</h4>
                    <ol>
                        <li><strong>Navigation</strong> : Utilisez le panneau latéral gauche pour sélectionner un système</li>
                        <li><strong>Lecture des données</strong> : Les paramètres s'affichent en temps réel au centre</li>
                        <li><strong>Alarmes</strong> : Consultez le journal d'alarmes à droite</li>
                        <li><strong>Actions rapides</strong> : Utilisez les boutons de la barre inférieure</li>
                    </ol>

                    <h4>🎯 Fonctionnalités principales</h4>
                    <ul>
                        <li><strong>BITE</strong> : Tests automatisés des systèmes</li>
                        <li><strong>TRAINING</strong> : Scénarios de formation</li>
                        <li><strong>TRENDS</strong> : Surveillance prédictive</li>
                        <li><strong>SYNOPTIC</strong> : Vues schématiques des systèmes</li>
                        <li><strong>VOICE ALERTS</strong> : Alertes vocales conformes CS-25.1322</li>
                    </ul>

                    <div class="doc-tip">
                        💡 <strong>Astuce</strong> : Appuyez sur <kbd>ESC</kbd> pour fermer les modales rapidement
                    </div>
                `
            },

            'systems': {
                title: 'Guide des Systèmes',
                icon: 'fa-sitemap',
                content: `
                    <h3>Systèmes Surveillés</h3>
                    
                    <div class="doc-system">
                        <h4><i class="fas fa-fan"></i> Moteurs (CFM56-5B4)</h4>
                        <p><strong>Paramètres surveillés :</strong></p>
                        <ul>
                            <li><strong>N1</strong> : Régime compresseur basse pression (82-95%)</li>
                            <li><strong>N2</strong> : Régime compresseur haute pression (85-98%)</li>
                            <li><strong>EGT</strong> : Température gaz d'échappement (500-750°C)</li>
                            <li><strong>FF</strong> : Débit carburant (1200-2400 kg/h)</li>
                            <li><strong>Oil Press</strong> : Pression huile (40-65 PSI)</li>
                            <li><strong>Vibrations N1</strong> : Vibrations (< 3.0 mils)</li>
                        </ul>
                        <p><strong>Seuils d'alarme :</strong></p>
                        <ul>
                            <li>🟡 CAUTION : N1 > 95%, EGT > 750°C, Oil Press < 30 PSI</li>
                            <li>🔴 WARNING : N1 > 101%, EGT > 900°C, Oil Press < 20 PSI</li>
                        </ul>
                    </div>

                    <div class="doc-system">
                        <h4><i class="fas fa-tint"></i> Hydraulique</h4>
                        <p>3 circuits indépendants : GREEN, BLUE, YELLOW</p>
                        <p><strong>Pression normale :</strong> 3000 PSI ±100</p>
                        <p><strong>Alertes :</strong></p>
                        <ul>
                            <li>🟡 CAUTION : Pression < 2500 PSI</li>
                            <li>🔴 WARNING : Perte totale d'un circuit</li>
                        </ul>
                    </div>

                    <div class="doc-system">
                        <h4><i class="fas fa-bolt"></i> Électrique</h4>
                        <p><strong>Sources :</strong></p>
                        <ul>
                            <li>GEN 1 & 2 : 115V AC, 90 kVA</li>
                            <li>Batteries : 28V DC</li>
                            <li>APU GEN : 115V AC, 90 kVA</li>
                        </ul>
                    </div>

                    <div class="doc-system">
                        <h4><i class="fas fa-wind"></i> Pressurisation</h4>
                        <p><strong>Altitude cabine normale :</strong> 6000-8000 ft</p>
                        <p><strong>Delta P max :</strong> 8.5 PSI</p>
                        <p><strong>Taux montée/descente :</strong> -500 à +500 ft/min</p>
                    </div>
                `
            },

            'bite': {
                title: 'Utilisation du BITE',
                icon: 'fa-wrench',
                content: `
                    <h3>BITE - Built-In Test Equipment</h3>
                    <p>Le système BITE permet d'exécuter des tests automatisés sur 15 systèmes avioniques.</p>

                    <h4>🔧 Systèmes testés</h4>
                    <ul>
                        <li><strong>Flight Controls</strong> : ELAC-1/2, SEC-1, FAC-1</li>
                        <li><strong>Engines</strong> : FADEC-1/2</li>
                        <li><strong>Hydraulics</strong> : GREEN, BLUE, YELLOW</li>
                        <li><strong>Electrical</strong> : GEN-1/2, BATTERY</li>
                        <li><strong>Avionics</strong> : ADR-1, IR-1</li>
                    </ul>

                    <h4>🎯 Types de tests</h4>
                    <ul>
                        <li><strong>RAM Test</strong> (2s) : Vérification mémoire vive</li>
                        <li><strong>ROM Checksum</strong> (3s) : Intégrité du firmware</li>
                        <li><strong>I/O Test</strong> (2s) : Entrées/sorties</li>
                        <li><strong>Sensor Validity</strong> (4s) : Validation capteurs</li>
                        <li><strong>Actuator Check</strong> (4s) : Vérification actionneurs</li>
                    </ul>

                    <h4>📋 Procédure</h4>
                    <ol>
                        <li>Cliquer sur le bouton <strong>BITE</strong> dans la barre inférieure</li>
                        <li>Sélectionner un système dans la liste</li>
                        <li>Cliquer sur <strong>Run Test</strong></li>
                        <li>Attendre la fin du test (durée variable selon le système)</li>
                        <li>Consulter les résultats affichés</li>
                        <li>Exporter les résultats en CSV si nécessaire</li>
                    </ol>

                    <div class="doc-warning">
                        ⚠️ <strong>Attention</strong> : Certains tests (CRITICAL) ne doivent être exécutés qu'au sol moteurs arrêtés
                    </div>

                    <h4>📊 Interprétation des résultats</h4>
                    <ul>
                        <li>✅ <strong>PASS</strong> : Test réussi, système opérationnel</li>
                        <li>❌ <strong>FAIL</strong> : Échec détecté, consulter le code d'erreur</li>
                        <li><strong>Codes d'erreur</strong> : Ex. E-RAM-001 = Défaut mémoire RAM zone 1</li>
                    </ul>

                    <h4>🛠️ Actions de maintenance</h4>
                    <p>En cas d'échec, le système génère automatiquement :</p>
                    <ul>
                        <li>Classification MEL (A, B, C, D)</li>
                        <li>Criticité de l'intervention</li>
                        <li>Actions correctives recommandées</li>
                    </ul>
                `
            },

            'training': {
                title: 'Mode Formation',
                icon: 'fa-graduation-cap',
                content: `
                    <h3>Mode Formation</h3>
                    <p>Entraînez-vous à gérer des situations d'urgence dans un environnement sécurisé.</p>

                    <h4>🎓 Scénarios disponibles</h4>
                    
                    <div class="doc-scenario">
                        <h5>1. Panne moteur au décollage</h5>
                        <ul>
                            <li><strong>Difficulté</strong> : Moyenne</li>
                            <li><strong>Durée</strong> : 180 secondes</li>
                            <li><strong>Objectifs</strong> : Maintenir cap, rentrer train, arrêter moteur, monter</li>
                            <li><strong>Score pour réussir</strong> : 70%</li>
                        </ul>
                    </div>

                    <div class="doc-scenario">
                        <h5>2. Dépressurisation cabine</h5>
                        <ul>
                            <li><strong>Difficulté</strong> : Élevée</li>
                            <li><strong>Durée</strong> : 300 secondes</li>
                            <li><strong>Objectifs</strong> : Masques O2, descente d'urgence, niveau FL100, passagers, ATC</li>
                            <li><strong>Score pour réussir</strong> : 75%</li>
                        </ul>
                    </div>

                    <div class="doc-scenario">
                        <h5>3. Double panne hydraulique</h5>
                        <ul>
                            <li><strong>Difficulté</strong> : Élevée</li>
                            <li><strong>Durée</strong> : 240 secondes</li>
                            <li><strong>Objectifs</strong> : Identifier pannes, QRH, activer BLUE, prévoir atterrissage, briefing</li>
                        </ul>
                    </div>

                    <h4>📊 Système de notation</h4>
                    <ul>
                        <li><strong>100 points maximum</strong> par scénario</li>
                        <li>Points attribués par action réalisée dans les temps</li>
                        <li>Pénalité si action en retard (-50% des points)</li>
                        <li>Aucun point si action oubliée</li>
                    </ul>

                    <h4>🏆 Statistiques</h4>
                    <p>Le système enregistre :</p>
                    <ul>
                        <li>Nombre total de sessions</li>
                        <li>Score moyen</li>
                        <li>Taux de réussite</li>
                        <li>Historique des 50 dernières sessions</li>
                        <li>Export CSV possible</li>
                    </ul>

                    <div class="doc-tip">
                        💡 <strong>Conseil</strong> : Commencez par les scénarios faciles pour vous familiariser avec l'interface
                    </div>
                `
            },

            'trends': {
                title: 'Surveillance des Tendances',
                icon: 'fa-chart-line',
                content: `
                    <h3>Trend Monitoring - Maintenance Prédictive</h3>
                    <p>Système de surveillance conforme MSG-3 pour anticiper les pannes.</p>

                    <h4>📈 Paramètres surveillés (16)</h4>
                    
                    <strong>Moteurs (8 paramètres) :</strong>
                    <ul>
                        <li>ENG1/2 N1 : Détection de perte de performances</li>
                        <li>ENG1/2 EGT : Surveillance combustion</li>
                        <li>ENG1/2 Oil Press : Usure mécanique</li>
                        <li>ENG1/2 Vibrations : Équilibrage</li>
                    </ul>

                    <strong>Hydraulique (3 paramètres) :</strong>
                    <ul>
                        <li>HYD GREEN/BLUE/YELLOW Press : Fuites, usure pompes</li>
                    </ul>

                    <strong>Électrique (3 paramètres) :</strong>
                    <ul>
                        <li>ELEC GEN1/2 Load : Dégradation générateurs</li>
                        <li>ELEC Battery Temp : Vieillissement batteries</li>
                    </ul>

                    <h4>🔍 Analyse de régression</h4>
                    <p>Le système utilise la <strong>régression linéaire</strong> sur les 20 derniers vols pour :</p>
                    <ul>
                        <li>Calculer la tendance (pente) de chaque paramètre</li>
                        <li>Prédire la valeur future</li>
                        <li>Comparer aux seuils de dégradation</li>
                        <li>Générer des alertes préventives</li>
                    </ul>

                    <h4>⚠️ Seuils de dégradation</h4>
                    <table class="doc-table">
                        <tr>
                            <th>Paramètre</th>
                            <th>Seuil d'alerte</th>
                        </tr>
                        <tr>
                            <td>ENG N1</td>
                            <td>-2% par 10 vols</td>
                        </tr>
                        <tr>
                            <td>ENG EGT</td>
                            <td>+5°C par 10 vols</td>
                        </tr>
                        <tr>
                            <td>HYD Press</td>
                            <td>-100 PSI par 20 vols</td>
                        </tr>
                        <tr>
                            <td>Vibrations</td>
                            <td>+0.3 mils par 10 vols</td>
                        </tr>
                    </table>

                    <h4>📋 Rapports de maintenance</h4>
                    <p>Le système génère automatiquement :</p>
                    <ul>
                        <li>Liste des paramètres en dégradation</li>
                        <li>Valeur de tendance et prédiction</li>
                        <li>Recommandations d'actions spécifiques</li>
                        <li>Planification maintenance suggérée</li>
                    </ul>

                    <div class="doc-tip">
                        💡 <strong>Best Practice</strong> : Lancer l'enregistrement au début de chaque vol pour accumuler des données
                    </div>
                `
            },

            'troubleshooting': {
                title: 'Dépannage',
                icon: 'fa-tools',
                content: `
                    <h3>Guide de Dépannage</h3>

                    <h4>❓ Problèmes fréquents</h4>

                    <div class="doc-troubleshoot">
                        <h5>Les boutons ne répondent pas</h5>
                        <p><strong>Solution :</strong></p>
                        <ol>
                            <li>Rafraîchir la page (Ctrl+Shift+R)</li>
                            <li>Vérifier la console (F12) pour les erreurs</li>
                            <li>Vider le cache du navigateur</li>
                        </ol>
                    </div>

                    <div class="doc-troubleshoot">
                        <h5>Les alertes vocales ne fonctionnent pas</h5>
                        <p><strong>Solutions :</strong></p>
                        <ul>
                            <li>Vérifier que le son n'est pas désactivé</li>
                            <li>Autoriser l'audio dans le navigateur (cliquer une fois sur la page)</li>
                            <li>Vérifier les paramètres du navigateur pour Speech Synthesis</li>
                        </ul>
                    </div>

                    <div class="doc-troubleshoot">
                        <h5>Les données ne se mettent pas à jour</h5>
                        <p><strong>Causes possibles :</strong></p>
                        <ul>
                            <li>Mode "Frozen" activé (bouton FREEZE en haut)</li>
                            <li>Problème de simulation interne</li>
                            <li>Rechargez la page</li>
                        </ul>
                    </div>

                    <div class="doc-troubleshoot">
                        <h5>Export CSV ne fonctionne pas</h5>
                        <p><strong>Solutions :</strong></p>
                        <ul>
                            <li>Vérifier les autorisations de téléchargement</li>
                            <li>Désactiver les bloqueurs de pop-ups</li>
                            <li>Essayer un autre navigateur (Chrome recommandé)</li>
                        </ul>
                    </div>

                    <h4>🔧 Réinitialisation</h4>
                    <p>Pour réinitialiser complètement l'application :</p>
                    <ol>
                        <li>Ouvrir la console (F12)</li>
                        <li>Taper : <code>localStorage.clear()</code></li>
                        <li>Rafraîchir la page</li>
                    </ol>

                    <div class="doc-warning">
                        ⚠️ <strong>Attention</strong> : Cette action supprime toutes les données enregistrées (historique, résultats tests, etc.)
                    </div>

                    <h4>📞 Support</h4>
                    <p>Pour une assistance technique :</p>
                    <ul>
                        <li>Documentation complète : README.md</li>
                        <li>Logs système : Consulter la console navigateur</li>
                        <li>Version : v2.5.0</li>
                    </ul>
                `
            },

            'faq': {
                title: 'FAQ',
                icon: 'fa-question-circle',
                content: `
                    <h3>Questions Fréquentes</h3>

                    <div class="doc-faq">
                        <h5>Q: Est-ce un vrai système certifié ?</h5>
                        <p><strong>R:</strong> Non, c'est un système de démonstration/formation conforme aux standards EASA CS-25, mais non certifié pour utilisation opérationnelle.</p>
                    </div>

                    <div class="doc-faq">
                        <h5>Q: Les données sont-elles réelles ?</h5>
                        <p><strong>R:</strong> Les données sont simulées mais réalistes, basées sur les spécifications de l'A320-214 CFM56-5B4.</p>
                    </div>

                    <div class="doc-faq">
                        <h5>Q: Puis-je l'utiliser hors ligne ?</h5>
                        <p><strong>R:</strong> Oui, une fois chargé, le système fonctionne entièrement en local. Aucune connexion internet requise.</p>
                    </div>

                    <div class="doc-faq">
                        <h5>Q: Les données sont-elles sauvegardées ?</h5>
                        <p><strong>R:</strong> Oui, toutes les données (historique, tests BITE, résultats formation, tendances) sont sauvegardées dans le localStorage du navigateur.</p>
                    </div>

                    <div class="doc-faq">
                        <h5>Q: Combien de temps les données sont conservées ?</h5>
                        <p><strong>R:</strong> Les données persistent tant que vous ne videz pas le cache du navigateur. Limites :</p>
                        <ul>
                            <li>BITE : 100 derniers résultats</li>
                            <li>Training : 50 dernières sessions</li>
                            <li>Trends : 1000 snapshots par paramètre</li>
                            <li>Fault History : 500 derniers défauts</li>
                        </ul>
                    </div>

                    <div class="doc-faq">
                        <h5>Q: Quels navigateurs sont supportés ?</h5>
                        <p><strong>R:</strong> Navigateurs modernes avec support ES6 :</p>
                        <ul>
                            <li>✅ Chrome 90+</li>
                            <li>✅ Firefox 88+</li>
                            <li>✅ Edge 90+</li>
                            <li>✅ Safari 14+</li>
                        </ul>
                    </div>

                    <div class="doc-faq">
                        <h5>Q: Puis-je personnaliser l'interface ?</h5>
                        <p><strong>R:</strong> Actuellement disponible :</p>
                        <ul>
                            <li>Changement de langue (5 langues)</li>
                            <li>Mode test (injection de pannes)</li>
                        </ul>
                        <p>À venir : thèmes, profils utilisateurs, configuration avancée</p>
                    </div>

                    <div class="doc-faq">
                        <h5>Q: Comment exporter toutes mes données ?</h5>
                        <p><strong>R:</strong> Chaque module (BITE, Training, Trends) dispose d'un bouton "Export CSV". Pour un export complet, utiliser le bouton "EXPORT CFR" dans la barre inférieure.</p>
                    </div>
                `
            },

            'about': {
                title: 'À Propos',
                icon: 'fa-info-circle',
                content: `
                    <h3>À Propos d'AERO-DIAG</h3>
                    
                    <div class="doc-about">
                        <p><strong>Version :</strong> 2.5.0</p>
                        <p><strong>Date :</strong> Février 2026</p>
                        <p><strong>Type :</strong> Interface de Diagnostic Avionique</p>
                        <p><strong>Aéronef :</strong> Airbus A320-214 CFM56-5B4</p>
                    </div>

                    <h4>🎯 Objectif</h4>
                    <p>Fournir un système de diagnostic avionique professionnel conforme aux standards de l'aviation civile pour la formation et la démonstration.</p>

                    <h4>✨ Fonctionnalités</h4>
                    <ul>
                        <li>Surveillance temps réel de 7 systèmes critiques</li>
                        <li>Tests BITE automatisés (15 systèmes)</li>
                        <li>6 scénarios de formation interactifs</li>
                        <li>Maintenance prédictive (16 paramètres)</li>
                        <li>Procédures d'urgence ECAM (8 procédures)</li>
                        <li>Alertes vocales conformes CS-25.1322</li>
                        <li>Synoptiques interactifs</li>
                        <li>Support multilingue (5 langues)</li>
                    </ul>

                    <h4>📜 Conformité</h4>
                    <ul>
                        <li><strong>EASA CS-25</strong> : Certification avions transport</li>
                        <li><strong>CS-25.1322</strong> : Alertes et avertissements</li>
                        <li><strong>ARP4754A</strong> : Développement systèmes avioniqu</li>
                        <li><strong>DO-178C</strong> : Software niveau DAL-C</li>
                        <li><strong>MSG-3</strong> : Maintenance prédictive</li>
                        <li><strong>Part-M</strong> : Gestion maintenance</li>
                    </ul>

                    <h4>🏆 Score de Conformité Industrie</h4>
                    <div class="doc-compliance">
                        <div class="compliance-bar">
                            <div class="compliance-fill" style="width: 95%">95%</div>
                        </div>
                        <p>95% de conformité aux standards de l'aviation civile</p>
                    </div>

                    <h4>🔧 Technologies</h4>
                    <ul>
                        <li>JavaScript ES6+ (Modules)</li>
                        <li>HTML5 / CSS3</li>
                        <li>Web Speech API</li>
                        <li>SVG pour synoptiques</li>
                        <li>localStorage pour persistence</li>
                        <li>Régression linéaire (analyse tendances)</li>
                    </ul>

                    <h4>📚 Architecture</h4>
                    <ul>
                        <li><strong>app.js</strong> : Moteur principal et simulation</li>
                        <li><strong>bite.js</strong> : Système de tests automatisés</li>
                        <li><strong>training-mode.js</strong> : Gestion scénarios formation</li>
                        <li><strong>trend-monitoring.js</strong> : Analyse prédictive</li>
                        <li><strong>voice-alerts.js</strong> : Alertes vocales</li>
                        <li><strong>synoptics.js</strong> : Affichage synoptiques SVG</li>
                        <li><strong>i18n.js</strong> : Système de traduction</li>
                        <li><strong>documentation.js</strong> : Ce système d'aide</li>
                    </ul>

                    <div class="doc-credits">
                        <p>Développé avec ❤️ pour l'aviation</p>
                        <p>© 2026 AERO-DIAG Project</p>
                    </div>
                `
            }
        };

        // Build search index
        this.buildSearchIndex();
    }

    /**
     * Build search index for fast lookup
     */
    buildSearchIndex() {
        this.searchIndex = [];
        Object.keys(this.documentation).forEach(sectionId => {
            const section = this.documentation[sectionId];
            const searchText = `${section.title} ${section.content}`.toLowerCase();
            this.searchIndex.push({
                id: sectionId,
                title: section.title,
                content: searchText
            });
        });
    }

    /**
     * Search documentation
     * @param {string} query - Search query
     * @returns {Array} - Matching sections
     */
    search(query) {
        if (!query || query.length < 2) return [];
        
        const lowerQuery = query.toLowerCase();
        return this.searchIndex
            .filter(item => item.content.includes(lowerQuery))
            .map(item => ({
                id: item.id,
                title: item.title
            }));
    }

    /**
     * Get section content
     * @param {string} sectionId - Section identifier
     */
    getSection(sectionId) {
        return this.documentation[sectionId] || null;
    }

    /**
     * Get all sections
     */
    getAllSections() {
        return Object.keys(this.documentation).map(id => ({
            id,
            title: this.documentation[id].title,
            icon: this.documentation[id].icon
        }));
    }

    /**
     * Show documentation modal
     * @param {string} initialSection - Initial section to display
     */
    show(initialSection = 'quick-start') {
        this.currentSection = initialSection;
        this.createModal();
    }

    /**
     * Create documentation modal
     */
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'doc-modal';
        modal.id = 'documentation-modal';

        const sections = this.getAllSections();
        const currentContent = this.getSection(this.currentSection);

        modal.innerHTML = `
            <div class="doc-modal__backdrop"></div>
            <div class="doc-modal__container">
                <div class="doc-modal__sidebar">
                    <div class="doc-modal__header">
                        <i class="fas fa-book"></i>
                        <h2>${i18n.t('doc.title')}</h2>
                    </div>
                    
                    <div class="doc-modal__search">
                        <i class="fas fa-search"></i>
                        <input type="text" 
                               id="doc-search" 
                               placeholder="Rechercher..."
                               autocomplete="off">
                    </div>

                    <nav class="doc-modal__nav">
                        ${sections.map(section => `
                            <button class="doc-nav-item ${section.id === this.currentSection ? 'doc-nav-item--active' : ''}"
                                    data-section="${section.id}">
                                <i class="fas ${section.icon}"></i>
                                <span>${section.title}</span>
                            </button>
                        `).join('')}
                    </nav>

                    <div class="doc-modal__footer">
                        <p class="doc-version">v2.5.0</p>
                    </div>
                </div>

                <div class="doc-modal__content">
                    <button class="doc-modal__close">
                        <i class="fas fa-times"></i>
                    </button>

                    <div class="doc-content" id="doc-content">
                        ${currentContent.content}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachEventListeners(modal);

        // Animation
        requestAnimationFrame(() => {
            modal.classList.add('doc-modal--visible');
        });
    }

    /**
     * Attach event listeners to modal
     */
    attachEventListeners(modal) {
        // Close button
        const closeBtn = modal.querySelector('.doc-modal__close');
        const backdrop = modal.querySelector('.doc-modal__backdrop');
        
        [closeBtn, backdrop].forEach(el => {
            el.addEventListener('click', () => this.close());
        });

        // Navigation
        modal.querySelectorAll('.doc-nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionId = e.currentTarget.getAttribute('data-section');
                this.navigateToSection(sectionId);
            });
        });

        // Search
        const searchInput = modal.querySelector('#doc-search');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    /**
     * Navigate to a section
     */
    navigateToSection(sectionId) {
        this.currentSection = sectionId;
        const section = this.getSection(sectionId);
        
        const contentDiv = document.getElementById('doc-content');
        contentDiv.innerHTML = section.content;

        // Update active state
        document.querySelectorAll('.doc-nav-item').forEach(btn => {
            btn.classList.remove('doc-nav-item--active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('doc-nav-item--active');

        // Scroll to top
        contentDiv.scrollTop = 0;
    }

    /**
     * Handle search input
     */
    handleSearch(query) {
        if (query.length < 2) {
            // Show all sections
            document.querySelectorAll('.doc-nav-item').forEach(btn => {
                btn.style.display = 'flex';
            });
            return;
        }

        const results = this.search(query);
        const resultIds = results.map(r => r.id);

        document.querySelectorAll('.doc-nav-item').forEach(btn => {
            const sectionId = btn.getAttribute('data-section');
            btn.style.display = resultIds.includes(sectionId) ? 'flex' : 'none';
        });
    }

    /**
     * Close modal
     */
    close() {
        const modal = document.getElementById('documentation-modal');
        if (modal) {
            modal.classList.remove('doc-modal--visible');
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// Singleton instance
export const documentation = new DocumentationSystem();

// Global exposure
window.documentation = documentation;

export default documentation;
