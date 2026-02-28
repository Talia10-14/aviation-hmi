/**
 * Advanced Features Integration
 * Integrates BITE, Training Mode, and Trend Monitoring into the Aviation HMI
 */

import { biteSystem } from './bite.js';
import { trainingSystem } from './training-mode.js';
import { trendMonitoring } from './trend-monitoring.js';

let biteModalOpen = false;
let trainingModalOpen = false;
let trendModalOpen = false;

/**
 * Initialize all advanced features
 */
function initAdvancedFeatures() {
    console.log('🚀 Initializing Advanced Features...');
    
    initBITE();
    initTrainingMode();
    initTrendMonitoring();
    
    console.log('✅ Advanced Features initialized');
}

// ============= BITE SYSTEM =============

/**
 * Initialize BITE system
 */
function initBITE() {
    const biteBtn = document.getElementById('btn-bite');
    console.log('[ADVANCED] Initializing BITE, button:', biteBtn);
    if (biteBtn) {
        biteBtn.addEventListener('click', (e) => {
            console.log('[ADVANCED] BITE button clicked!', e);
            showBITEModal();
        });
        console.log('[ADVANCED] BITE button listener attached successfully');
        // Test direct
        biteBtn.onclick = function(e) {
            console.log('[ADVANCED] BITE onclick fallback triggered');
        };
    } else {
        console.error('[ADVANCED] BITE button NOT FOUND!');
    }
}

/**
 * Show BITE modal
 */
function showBITEModal() {
    console.log('[ADVANCED] Opening BITE modal...');
    if (biteModalOpen) return;

    const modal = document.createElement('div');
    modal.className = 'advanced-modal';
    modal.id = 'bite-modal';
    
    const systems = biteSystem.getAvailableSystems();
    const stats = biteSystem.getStatistics();
    const recentResults = biteSystem.getRecentResults(5);

    modal.innerHTML = `
        <div class="advanced-modal__backdrop"></div>
        <div class="advanced-modal__content advanced-modal__content--large">
            <div class="advanced-modal__header">
                <h2><i class="fas fa-wrench"></i> BITE - Built-In Test Equipment</h2>
                <button class="advanced-modal__close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="advanced-modal__body">
                <div class="bite-container">
                    <!-- Statistics -->
                    <div class="bite-stats">
                        <div class="stat-card">
                            <div class="stat-card__value">${stats.total}</div>
                            <div class="stat-card__label">Total Tests</div>
                        </div>
                        <div class="stat-card stat-card--success">
                            <div class="stat-card__value">${stats.passRate}%</div>
                            <div class="stat-card__label">Pass Rate</div>
                        </div>
                        <div class="stat-card stat-card--warning">
                            <div class="stat-card__value">${stats.failed}</div>
                            <div class="stat-card__label">Failed</div>
                        </div>
                    </div>

                    <!-- Systems Grid -->
                    <div class="bite-section">
                        <h3><i class="fas fa-list"></i> Available Systems (${systems.length})</h3>
                        <div class="bite-systems-grid">
                            ${systems.map(sys => `
                                <div class="bite-system-card" data-system-id="${sys.id}">
                                    <div class="bite-system-card__header">
                                        <span class="bite-system-card__name">${sys.name}</span>
                                        <span class="bite-system-card__criticality bite-system-card__criticality--${sys.criticality}">
                                            ${sys.criticality.toUpperCase()}
                                        </span>
                                    </div>
                                    <div class="bite-system-card__info">
                                        <span class="bite-system-card__category">${sys.category}</span>
                                        <span class="bite-system-card__tests">${sys.testCount} tests</span>
                                    </div>
                                    <button class="bite-system-card__btn" data-system-id="${sys.id}">
                                        <i class="fas fa-play"></i> Run Test
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Recent Results -->
                    ${recentResults.length > 0 ? `
                        <div class="bite-section">
                            <h3><i class="fas fa-history"></i> Recent Test Results</h3>
                            <div class="bite-results-list">
                                ${recentResults.map(result => `
                                    <div class="bite-result-item bite-result-item--${result.overallStatus.toLowerCase()}">
                                        <div class="bite-result-item__header">
                                            <span class="bite-result-item__system">${result.systemName}</span>
                                            <span class="bite-result-item__status">${result.overallStatus}</span>
                                        </div>
                                        <div class="bite-result-item__details">
                                            <span>${result.tests.length} tests</span>
                                            <span>${(result.duration / 1000).toFixed(1)}s</span>
                                            <span>${new Date(result.startTime).toLocaleString()}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Test Progress -->
                    <div class="bite-test-progress hidden" id="bite-progress">
                        <div class="bite-test-progress__header">
                            <h3>Running Test: <span id="bite-test-name">-</span></h3>
                            <div class="spinner"></div>
                        </div>
                        <div class="bite-test-progress__bar">
                            <div class="bite-test-progress__fill" id="bite-progress-fill"></div>
                        </div>
                        <div class="bite-test-progress__info" id="bite-test-info">Initializing...</div>
                    </div>
                </div>
            </div>

            <div class="advanced-modal__footer">
                <button class="btn btn--ghost" id="btn-bite-export">
                    <i class="fas fa-download"></i> Export Results
                </button>
                <button class="btn btn--ghost" id="btn-bite-clear">
                    <i class="fas fa-trash"></i> Clear History
                </button>
                <button class="btn btn--primary advanced-modal__close-btn">
                    <i class="fas fa-check"></i> Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    biteModalOpen = true;

    // Add event listeners
    modal.querySelectorAll('.advanced-modal__close, .advanced-modal__close-btn, .advanced-modal__backdrop').forEach(el => {
        el.addEventListener('click', closeBITEModal);
    });

    // Run test buttons
    modal.querySelectorAll('.bite-system-card__btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const systemId = e.currentTarget.dataset.systemId;
            runBITETest(systemId);
        });
    });

    // Export button
    const exportBtn = modal.querySelector('#btn-bite-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportBITEResults);
    }

    // Clear button
    const clearBtn = modal.querySelector('#btn-bite-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const message = window.i18n ? window.i18n.t('msg.confirm_bite_clear') : 'Clear all BITE test results?';
            if (confirm(message)) {
                biteSystem.clearResults();
                closeBITEModal();
                showBITEModal();
            }
        });
    }

    // ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape' && biteModalOpen) {
            closeBITEModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Close BITE modal
 */
function closeBITEModal() {
    const modal = document.getElementById('bite-modal');
    if (modal) {
        modal.remove();
    }
    biteModalOpen = false;
}

/**
 * Run BITE test
 */
async function runBITETest(systemId) {
    const progressDiv = document.getElementById('bite-progress');
    const nameEl = document.getElementById('bite-test-name');
    const infoEl = document.getElementById('bite-test-info');
    const fillEl = document.getElementById('bite-progress-fill');

    if (!progressDiv) return;

    try {
        progressDiv.classList.remove('hidden');
        
        const system = biteSystem.getSystemById(systemId);
        if (!system) {
            throw new Error('System not found');
        }
        nameEl.textContent = system.name;

        const totalTests = system.tests.length;
        let completed = 0;

        // Mock progress updates
        const progressInterval = setInterval(() => {
            completed++;
            const progress = (completed / totalTests) * 100;
            fillEl.style.width = `${progress}%`;
            infoEl.textContent = `Test ${completed} of ${totalTests}...`;
        }, 1000);

        // Run actual test
        const result = await biteSystem.runSystemTest(systemId);

        clearInterval(progressInterval);
        fillEl.style.width = '100%';

        // Show result
        if (result.overallStatus === 'PASS') {
            infoEl.innerHTML = `<span style="color: var(--status-normal)">✓ All tests passed</span>`;
        } else {
            infoEl.innerHTML = `<span style="color: var(--status-warning)">⚠ Some tests failed</span>`;
        }

        // Refresh modal after 2 seconds
        setTimeout(() => {
            closeBITEModal();
            showBITEModal();
        }, 2000);

    } catch (error) {
        console.error('BITE test error:', error);
        infoEl.innerHTML = `<span style="color: var(--status-warning)">Error: ${error.message}</span>`;
    }
}

/**
 * Export BITE results
 */
function exportBITEResults() {
    const csv = biteSystem.exportAsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bite-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============= TRAINING MODE =============

let trainingUpdateInterval = null;
let trainingActionsPanel = null;

/**
 * Initialize training mode
 */
function initTrainingMode() {
    const trainingBtn = document.getElementById('btn-training');
    console.log('[ADVANCED] Initializing Training, button:', trainingBtn);
    if (trainingBtn) {
        trainingBtn.addEventListener('click', (e) => {
            console.log('[ADVANCED] TRAINING button clicked!', e);
            showTrainingModal();
        });
        console.log('[ADVANCED] Training button listener attached successfully');
    } else {
        console.error('[ADVANCED] TRAINING button NOT FOUND!');
    }

    // Register training event callback
    window.trainingEventCallback = handleTrainingEvent;
    
    // Initialize training actions panel
    initTrainingActionsPanel();
}

/**
 * Initialize training actions panel
 */
function initTrainingActionsPanel() {
    trainingActionsPanel = document.getElementById('training-actions-panel');
    
    if (!trainingActionsPanel) {
        console.error('[TRAINING] Actions panel not found');
        return;
    }
    
    // Toggle collapse
    const toggle = trainingActionsPanel.querySelector('.training-actions-panel__toggle');
    const header = trainingActionsPanel.querySelector('.training-actions-panel__header');
    
    header.addEventListener('click', () => {
        trainingActionsPanel.classList.toggle('training-actions-panel--collapsed');
    });
}

/**
 * Show training actions panel
 */
function showTrainingActionsPanel() {
    if (!trainingActionsPanel) return;
    
    const status = trainingSystem.getStatus();
    if (!status.running) {
        hideTrainingActionsPanel();
        return;
    }
    
    trainingActionsPanel.style.display = 'block';
    updateTrainingActionsPanel();
}

/**
 * Hide training actions panel
 */
function hideTrainingActionsPanel() {
    if (trainingActionsPanel) {
        trainingActionsPanel.style.display = 'none';
    }
}

/**
 * Update training actions panel
 */
function updateTrainingActionsPanel() {
    if (!trainingActionsPanel) return;
    
    const scenario = trainingSystem.currentScenario;
    if (!scenario) return;
    
    const actionsList = trainingActionsPanel.querySelector('#training-actions-list');
    if (!actionsList) return;
    
    const t = (key) => window.i18n ? window.i18n.t(key) : key;
    
    // Get faults from scenario events and extract procedures
    const faults = scenario.events.filter(e => e.type === 'fault');
    const procedureActions = [];
    
    // Import procedures
    import('./procedures.js').then(module => {
        const { getProcedure } = module;
        
        faults.forEach(fault => {
            const procedure = getProcedure(fault.code);
            if (procedure && procedure.immediateActions) {
                procedure.immediateActions
                    .filter(step => step.type === 'action')
                    .forEach((step, index) => {
                        const actionId = `${fault.code}-step-${index}`;
                        procedureActions.push({
                            id: actionId,
                            name: step.action,
                            fault: fault.code,
                            critical: step.critical || false,
                            completed: false,
                            points: step.critical ? 30 : 20
                        });
                    });
            }
        });
        
        // If no procedures found, show expected actions
        const displayActions = procedureActions.length > 0 ? procedureActions : scenario.expectedActions || [];
        
        if (displayActions.length === 0) {
            actionsList.innerHTML = `
                <div class="training-actions-panel__empty">
                    <i class="fas fa-check-circle"></i>
                    <p>Aucune action requise pour le moment</p>
                </div>
            `;
            return;
        }
        
        actionsList.innerHTML = displayActions.map((action, index) => {
            const completed = action.completed || false;
            const actionId = action.id || action.action;
            const actionName = action.name || action.action;
            const points = action.points || 20;
            const isCritical = action.critical || false;
            
            return `
                <div class="training-action-item ${completed ? 'training-action-item--completed' : ''} ${isCritical ? 'training-action-item--critical' : ''}" 
                     data-action-id="${actionId}">
                    <div class="training-action-item__header">
                        <div class="training-action-item__checkbox">
                            ${completed ? '<i class="fas fa-check"></i>' : ''}
                        </div>
                        <div class="training-action-item__name">
                            ${isCritical ? '<i class="fas fa-exclamation-triangle"></i> ' : ''}
                            ${actionName}
                        </div>
                        <div class="training-action-item__points">+${points}pts</div>
                    </div>
                    <div class="training-action-item__info">
                        ${action.fault ? `<span><i class="fas fa-tag"></i> ${action.fault}</span>` : ''}
                        ${isCritical ? '<span style="color: var(--status-warning);"><i class="fas fa-exclamation-circle"></i> CRITIQUE</span>' : ''}
                    </div>
                    <button class="training-action-item__button" 
                            data-action="${actionId}" 
                            ${completed ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> ${completed ? 'Complété' : 'Exécuter'}
                    </button>
                </div>
            `;
        }).join('');
        
        // Add event listeners to action buttons
        actionsList.querySelectorAll('.training-action-item__button:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                const actionId = btn.dataset.action;
                executeTrainingAction(actionId);
            });
        });
    }).catch(err => {
        console.error('[TRAINING] Error loading procedures:', err);
        
        // Fallback to expected actions
        const expectedActions = scenario.expectedActions || [];
        
        if (expectedActions.length === 0) {
            actionsList.innerHTML = `
                <div class="training-actions-panel__empty">
                    <i class="fas fa-info-circle"></i>
                    <p>Suivez les procédures ECAM</p>
                </div>
            `;
            return;
        }
        
        // Display expected actions as fallback
        actionsList.innerHTML = expectedActions.map((action, index) => {
            const completed = action.completed || false;
            const timeLimit = action.timeLimit || 0;
            
            return `
                <div class="training-action-item ${completed ? 'training-action-item--completed' : ''}" data-action-id="${action.action}">
                    <div class="training-action-item__header">
                        <div class="training-action-item__checkbox">
                            ${completed ? '<i class="fas fa-check"></i>' : ''}
                        </div>
                        <div class="training-action-item__name">${action.name}</div>
                        <div class="training-action-item__points">+${action.points}pts</div>
                    </div>
                    <div class="training-action-item__info">
                        <span><i class="fas fa-clock"></i> ${timeLimit}s</span>
                        <span><i class="fas fa-star"></i> ${action.points} points</span>
                    </div>
                    <button class="training-action-item__button" 
                            data-action="${action.action}" 
                            ${completed ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> ${completed ? 'Complété' : 'Exécuter'}
                    </button>
                </div>
            `;
        }).join('');
        
        // Add event listeners
        actionsList.querySelectorAll('.training-action-item__button:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                const actionId = btn.dataset.action;
                executeTrainingAction(actionId);
            });
        });
    });
}

/**
 * Execute training action
 */
function executeTrainingAction(actionId) {
    console.log('[TRAINING] Executing action:', actionId);
    
    // Log the action in training system
    trainingSystem.logAction(actionId, {
        timestamp: Date.now(),
        manualExecution: true
    });
    
    // Find the action and mark as completed
    const scenario = trainingSystem.currentScenario;
    if (scenario && scenario.expectedActions) {
        const action = scenario.expectedActions.find(a => a.action === actionId);
        if (action) {
            action.completed = true;
        }
    }
    
    // Update panel
    updateTrainingActionsPanel();
    
    // Show feedback
    const t = (key) => window.i18n ? window.i18n.t(key) : key;
    const actionName = scenario.expectedActions.find(a => a.action === actionId)?.name || actionId;
    
    // Simple visual feedback without modal
    const panel = trainingActionsPanel;
    panel.style.animation = 'pulse 0.3s ease-in-out';
    setTimeout(() => {
        panel.style.animation = '';
    }, 300);
}

/**
 * Show training modal
 */
function showTrainingModal() {
    console.log('[ADVANCED] Opening Training modal...');
    if (trainingModalOpen) return;

    const scenarios = trainingSystem.getScenarios();
    const stats = trainingSystem.getStatistics();
    const status = trainingSystem.getStatus();
    
    // Get translations
    const t = (key) => window.i18n ? window.i18n.t(key) : key;

    const modal = document.createElement('div');
    modal.className = 'advanced-modal';
    modal.id = 'training-modal';

    modal.innerHTML = `
        <div class="advanced-modal__backdrop"></div>
        <div class="advanced-modal__content advanced-modal__content--large">
            <div class="advanced-modal__header">
                <h2><i class="fas fa-graduation-cap"></i> ${t('training.title')}</h2>
                <button class="advanced-modal__close" aria-label="${t('btn.close')}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="advanced-modal__body">
                ${status.running ? `
                    <!-- Scenario Running -->
                    <div class="training-active">
                        <div class="training-active__header">
                            <h3>🎯 ${t('training.active_scenario')}: ${status.scenarioName}</h3>
                            <button class="btn btn--warning" id="btn-end-scenario">
                                <i class="fas fa-stop"></i> ${t('btn.end')}
                            </button>
                        </div>
                        <div class="training-active__progress">
                            <div class="training-stat">
                                <span class="training-stat__value">${Math.floor(status.elapsedTime / 60)}:${(status.elapsedTime % 60).toString().padStart(2, '0')}</span>
                                <span class="training-stat__label">${t('training.elapsed')}</span>
                            </div>
                            <div class="training-stat">
                                <span class="training-stat__value">${status.score}/${status.maxScore}</span>
                                <span class="training-stat__label">${t('training.score')}</span>
                            </div>
                            <div class="training-stat">
                                <span class="training-stat__value">${status.completedActions}/${status.totalActions}</span>
                                <span class="training-stat__label">${t('training.actions')}</span>
                            </div>
                        </div>
                    </div>
                ` : `
                    <!-- Guide d'utilisation -->
                    <div class="training-guide">
                        <div class="training-guide__icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="training-guide__content">
                            <h3>${t('training.guide.title')}</h3>
                            <ul>
                                <li>${t('training.guide.step1')}</li>
                                <li>${t('training.guide.step2')}</li>
                                <li>${t('training.guide.step3')}</li>
                                <li>${t('training.guide.step4')}</li>
                                <li>${t('training.guide.step5')}</li>
                            </ul>
                            <p class="training-guide__tip"><i class="fas fa-lightbulb"></i> ${t('training.guide.tip')}</p>
                        </div>
                    </div>
                    
                    <!-- Statistics -->
                    <div class="training-stats">
                        <div class="stat-card">
                            <div class="stat-card__value">${stats.totalSessions}</div>
                            <div class="stat-card__label">${t('training.sessions')}</div>
                        </div>
                        <div class="stat-card stat-card--success">
                            <div class="stat-card__value">${stats.averageScore}%</div>
                            <div class="stat-card__label">${t('training.avg_score')}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card__value">${stats.passRate}%</div>
                            <div class="stat-card__label">${t('training.pass_rate')}</div>
                        </div>
                    </div>

                    <!-- Scenarios -->
                    <div class="training-section">
                        <h3><i class="fas fa-list"></i> ${t('training.scenarios')} (${scenarios.length})</h3>
                        <div class="training-scenarios-grid">
                            ${scenarios.map(scenario => `
                                <div class="training-scenario-card">
                                    <div class="training-scenario-card__header">
                                        <span class="training-scenario-card__name">${scenario.name}</span>
                                        <span class="training-scenario-card__difficulty training-scenario-card__difficulty--${scenario.difficulty}">
                                            ${t('training.difficulty.' + scenario.difficulty)}
                                        </span>
                                    </div>
                                    <div class="training-scenario-card__description">
                                        ${scenario.description}
                                    </div>
                                    <div class="training-scenario-card__info">
                                        <span><i class="fas fa-clock"></i> ${scenario.duration}s</span>
                                        <span><i class="fas fa-tasks"></i> ${scenario.objectiveCount} ${t('training.objectives')}</span>
                                    </div>
                                    <button class="training-scenario-card__btn" data-scenario-id="${scenario.id}">
                                        <i class="fas fa-play"></i> ${t('btn.start')}
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `}
            </div>

            <div class="advanced-modal__footer">
                <button class="btn btn--ghost" id="btn-training-history">
                    <i class="fas fa-history"></i> ${t('btn.history')}
                </button>
                <button class="btn btn--ghost" id="btn-training-export">
                    <i class="fas fa-download"></i> ${t('btn.export_csv')}
                </button>
                <button class="btn btn--primary advanced-modal__close-btn">
                    <i class="fas fa-check"></i> ${t('btn.close')}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    trainingModalOpen = true;

    // Add event listeners
    modal.querySelectorAll('.advanced-modal__close, .advanced-modal__close-btn, .advanced-modal__backdrop').forEach(el => {
        el.addEventListener('click', closeTrainingModal);
    });

    // Scenario start buttons
    modal.querySelectorAll('.training-scenario-card__btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const scenarioId = e.currentTarget.dataset.scenarioId;
            startTrainingScenario(scenarioId);
        });
    });

    // End scenario button
    const endBtn = modal.querySelector('#btn-end-scenario');
    if (endBtn) {
        endBtn.addEventListener('click', endTrainingScenario);
    }

    // History button
    const historyBtn = modal.querySelector('#btn-training-history');
    if (historyBtn) {
        historyBtn.addEventListener('click', showTrainingHistory);
    }

    // Export button
    const exportBtn = modal.querySelector('#btn-training-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTrainingResults);
    }

    // ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape' && trainingModalOpen) {
            closeTrainingModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // Update training status if scenario is running
    if (status.running) {
        const updateTrainingStatus = () => {
            const currentStatus = trainingSystem.getStatus();
            if (!currentStatus.running) {
                // Scenario ended
                if (trainingUpdateInterval) {
                    clearInterval(trainingUpdateInterval);
                    trainingUpdateInterval = null;
                }
                hideTrainingActionsPanel();
                return;
            }

            // Update timer
            const timerEl = modal.querySelector('.training-stat__value');
            if (timerEl) {
                const minutes = Math.floor(currentStatus.elapsedTime / 60);
                const seconds = currentStatus.elapsedTime % 60;
                timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }

            // Update score
            const scoreEls = modal.querySelectorAll('.training-stat__value');
            if (scoreEls[1]) {
                scoreEls[1].textContent = `${currentStatus.score}/${currentStatus.maxScore}`;
            }

            // Update actions
            if (scoreEls[2]) {
                scoreEls[2].textContent = `${currentStatus.completedActions}/${currentStatus.totalActions}`;
            }
            
            // Update training actions panel
            updateTrainingActionsPanel();
        };

        // Start update interval
        trainingUpdateInterval = setInterval(updateTrainingStatus, 1000);
    }
}

/**
 * Close training modal
 */
function closeTrainingModal() {
    const modal = document.getElementById('training-modal');
    if (modal) {
        modal.remove();
    }
    
    // Clear update interval
    if (trainingUpdateInterval) {
        clearInterval(trainingUpdateInterval);
        trainingUpdateInterval = null;
    }
    
    trainingModalOpen = false;
}

/**
 * Start training scenario
 */
function startTrainingScenario(scenarioId) {
    try {
        const info = trainingSystem.startScenario(scenarioId);
        console.log('[TRAINING] Scenario started:', info);
        
        closeTrainingModal();
        
        // Show notification
        if (window.appFeatures) {
            const title = window.i18n ? window.i18n.t('training.title') : 'Training Mode';
            const message = window.i18n ? 
                window.i18n.t('msg.scenario_info', { name: info.scenario.name }) : 
                `Training scenario started: ${info.scenario.name}\n\nFollow the objectives and respond to events.`;
            window.showInfo(title, message);
        }

        // Show training actions panel
        showTrainingActionsPanel();

        // Note: Modal is kept closed to allow user to interact with ECAM
        // User can reopen modal to see progress or end scenario

    } catch (error) {
        const title = window.i18n ? window.i18n.t('training.title') : 'Training Mode';
        const message = window.i18n ? 
            window.i18n.t('msg.scenario_error', { error: error.message }) : 
            `Error starting scenario: ${error.message}`;
        window.showError(title, message);
    }
}

/**
 * End training scenario
 */
function endTrainingScenario() {
    const t = (key) => window.i18n ? window.i18n.t(key) : key;
    const title = t('training.title');
    const message = t('msg.confirm_end_scenario');
    
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay modal-overlay--active';
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog--warning modal-dialog--visible">
            <div class="modal-header modal-header--warning">
                <div class="modal-header__icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 class="modal-header__title">${title}</h2>
            </div>
            <div class="modal-body">
                <div class="modal-message">${message}</div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn--ghost" data-action="cancel">
                    ${t('btn.cancel') || 'Annuler'}
                </button>
                <button class="modal-btn modal-btn--confirm modal-btn--warning" data-action="confirm">
                    ${t('btn.confirm') || 'Confirmer'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = '';
    };
    
    modal.querySelector('[data-action="cancel"]').addEventListener('click', closeModal);
    
    modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
        const result = trainingSystem.endScenario();
        
        closeTrainingModal();
        
        // Hide training actions panel
        hideTrainingActionsPanel();
        
        closeModal();
        
        // Show result
        showTrainingResult(result);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

/**
 * Show training result
 */
function showTrainingResult(result) {
    const t = (key) => window.i18n ? window.i18n.t(key) : key;
    const modal = document.createElement('div');
    modal.className = 'advanced-modal';
    
    modal.innerHTML = `
        <div class="advanced-modal__backdrop"></div>
        <div class="advanced-modal__content">
            <div class="advanced-modal__header">
                <h2><i class="fas fa-trophy"></i> ${t('training.result')}</h2>
            </div>
            
            <div class="advanced-modal__body">
                <div class="training-result">
                    <div class="training-result__score ${result.passed ? 'training-result__score--pass' : 'training-result__score--fail'}">
                        <div class="training-result__score-value">${result.score}/${result.maxScore}</div>
                        <div class="training-result__score-percent">${result.scorePercentage}%</div>
                        <div class="training-result__score-status">${result.passed ? t('training.passed') : t('training.failed')}</div>
                    </div>
                    
                    <div class="training-result__details">
                        <p><strong>${t('training.scenario')}:</strong> ${result.scenarioName}</p>
                        <p><strong>${t('training.duration')}:</strong> ${Math.floor(result.duration / 60)}:${(result.duration % 60).toString().padStart(2, '0')}</p>
                        <p><strong>${t('training.completed')}:</strong> ${result.completedActions}/${result.totalActions}</p>
                        
                        ${result.missedActions.length > 0 ? `
                            <div class="training-result__missed">
                                <h4>${t('training.missed_actions')}:</h4>
                                <ul>
                                    ${result.missedActions.map(action => `<li>${action}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <div class="advanced-modal__footer">
                <button class="btn btn--primary" id="btn-close-training-result">
                    <i class="fas fa-check"></i> ${t('btn.ok')}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Add event listener for OK button
    const okButton = modal.querySelector('#btn-close-training-result');
    const backdrop = modal.querySelector('.advanced-modal__backdrop');
    
    const closeModal = () => {
        modal.remove();
    };
    
    if (okButton) {
        okButton.addEventListener('click', closeModal);
    }
    
    if (backdrop) {
        backdrop.addEventListener('click', closeModal);
    }
    
    // ESC key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Handle training event
 */
function handleTrainingEvent(event) {
    console.log('[TRAINING] Event:', event);
    
    // Trigger faults in main app
    if (event.type === 'fault' && window.triggerTestFault) {
        // Pass event details (engine, generator, etc.) for proper fault targeting
        window.triggerTestFault(event.code, {
            engine: event.engine,
            generator: event.generator,
            tank: event.tank
        });
    }

    // Trigger voice alerts
    if (event.type === 'voice' && window.appFeatures) {
        window.appFeatures.voiceAlerts.trigger(event.alert);
    }
}

/**
 * Show training history
 */
function showTrainingHistory() {
    const t = (key) => window.i18n ? window.i18n.t(key) : key;
    const history = trainingSystem.getHistory(10);
    
    const modal = document.createElement('div');
    modal.className = 'advanced-modal';
    
    modal.innerHTML = `
        <div class="advanced-modal__backdrop"></div>
        <div class="advanced-modal__content">
            <div class="advanced-modal__header">
                <h2><i class="fas fa-history"></i> ${t('training.history_title')}</h2>
                <button class="advanced-modal__close" aria-label="${t('btn.close')}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="advanced-modal__body">
                ${history.length === 0 ? `
                    <div class="training-history-empty">
                        <i class="fas fa-inbox" style="font-size: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-secondary);">${t('training.no_history')}</p>
                    </div>
                ` : `
                    <div class="training-history-list">
                        ${history.map((r, i) => `
                            <div class="training-history-item ${r.passed ? 'training-history-item--passed' : 'training-history-item--failed'}">
                                <div class="training-history-item__number">${i + 1}</div>
                                <div class="training-history-item__content">
                                    <div class="training-history-item__header">
                                        <span class="training-history-item__name">${r.scenarioName}</span>
                                        <span class="training-history-item__status">
                                            ${r.passed ? '✓ ' + t('training.passed') : '✗ ' + t('training.failed')}
                                        </span>
                                    </div>
                                    <div class="training-history-item__details">
                                        <span><i class="fas fa-star"></i> ${t('training.score')}: ${r.scorePercentage}%</span>
                                        <span><i class="fas fa-calendar"></i> ${t('training.date')}: ${new Date(r.startTime).toLocaleString()}</span>
                                        <span><i class="fas fa-clock"></i> ${t('training.duration')}: ${Math.floor(r.duration / 60)}:${(r.duration % 60).toString().padStart(2, '0')}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            <div class="advanced-modal__footer">
                <button class="btn btn--primary" id="btn-close-history">
                    <i class="fas fa-check"></i> ${t('btn.close')}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeButton = modal.querySelector('#btn-close-history');
    const closeIcon = modal.querySelector('.advanced-modal__close');
    const backdrop = modal.querySelector('.advanced-modal__backdrop');
    
    const closeModal = () => {
        modal.remove();
    };
    
    closeButton?.addEventListener('click', closeModal);
    closeIcon?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);
    
    // ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Export training results
 */
function exportTrainingResults() {
    const csv = trainingSystem.exportResultsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============= TREND MONITORING =============

/**
 * Initialize trend monitoring
 */
function initTrendMonitoring() {
    const trendBtn = document.getElementById('btn-trend');
    console.log('[ADVANCED] Initializing Trend, button:', trendBtn);
    if (trendBtn) {
        trendBtn.addEventListener('click', (e) => {
            console.log('[ADVANCED] TREND button clicked!', e);
            showTrendModal();
        });
        console.log('[ADVANCED] Trend button listener attached successfully');
    } else {
        console.error('[ADVANCED] TREND button NOT FOUND!');
    }

    // Auto-start recording if app is running
    if (window.appState && !trendMonitoring.recording) {
        trendMonitoring.startFlight({ registration: 'F-GKXA', type: 'A320-214' });
    }
}

/**
 * Show trend monitoring modal
 */
function showTrendModal() {
    console.log('[ADVANCED] Opening Trend modal...');
    if (trendModalOpen) return;

    const dashboard = trendMonitoring.getDashboardData();
    const paramsSummary = trendMonitoring.getParametersSummary();
    const activeAlerts = trendMonitoring.getActiveAlerts();

    const modal = document.createElement('div');
    modal.className = 'advanced-modal';
    modal.id = 'trend-modal';

    modal.innerHTML = `
        <div class="advanced-modal__backdrop"></div>
        <div class="advanced-modal__content advanced-modal__content--large">
            <div class="advanced-modal__header">
                <h2><i class="fas fa-chart-line"></i> Trend Monitoring</h2>
                <button class="advanced-modal__close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="advanced-modal__body">
                <div class="trend-container">
                    <!-- Statistics -->
                    <div class="trend-stats">
                        <div class="stat-card">
                            <div class="stat-card__value">${dashboard.stats.totalFlights}</div>
                            <div class="stat-card__label">Flights Recorded</div>
                        </div>
                        <div class="stat-card stat-card--success">
                            <div class="stat-card__value">${dashboard.stats.normalParameters}</div>
                            <div class="stat-card__label">Normal</div>
                        </div>
                        <div class="stat-card stat-card--warning">
                            <div class="stat-card__value">${dashboard.stats.degradingParameters}</div>
                            <div class="stat-card__label">Degrading</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card__value">${dashboard.stats.activeAlerts}</div>
                            <div class="stat-card__label">Active Alerts</div>
                        </div>
                    </div>

                    <!-- Recording Status -->
                    <div class="trend-recording">
                        ${dashboard.stats.recordingActive ? `
                            <div class="trend-recording__active">
                                <span class="trend-recording__indicator"></span>
                                <span>Recording in progress...</span>
                            </div>
                        ` : `
                            <button class="btn btn--primary" id="btn-start-recording">
                                <i class="fas fa-record-vinyl"></i> Start Recording
                            </button>
                        `}
                    </div>

                    <!-- Active Alerts -->
                    ${activeAlerts.length > 0 ? `
                        <div class="trend-section">
                            <h3><i class="fas fa-exclamation-triangle"></i> Active Alerts</h3>
                            <div class="trend-alerts-list">
                                ${activeAlerts.map(alert => `
                                    <div class="trend-alert-item trend-alert-item--${alert.severity.toLowerCase()}">
                                        <div class="trend-alert-item__header">
                                            <span class="trend-alert-item__param">${alert.parameterName}</span>
                                            <span class="trend-alert-item__trend">${alert.trend} ${alert.unit}</span>
                                        </div>
                                        <div class="trend-alert-item__message">${alert.message}</div>
                                        <div class="trend-alert-item__recommendation">${alert.recommendation}</div>
                                        <button class="trend-alert-item__ack" data-alert-id="${alert.id}">
                                            Acknowledge
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Parameters Summary -->
                    <div class="trend-section">
                        <h3><i class="fas fa-list"></i> Monitored Parameters</h3>
                        <div class="trend-params-list">
                            ${paramsSummary.map(param => `
                                <div class="trend-param-item trend-param-item--${param.status.toLowerCase()}">
                                    <span class="trend-param-item__name">${param.name}</span>
                                    <span class="trend-param-item__value">${param.currentValue !== null ? `${param.currentValue.toFixed(1)} ${param.unit}` : '-'}</span>
                                    <span class="trend-param-item__status">${param.status}</span>
                                    <span class="trend-param-item__points">${param.dataPoints} pts</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="advanced-modal__footer">
                <button class="btn btn--ghost" id="btn-trend-report">
                    <i class="fas fa-file-alt"></i> Generate Report
                </button>
                <button class="btn btn--ghost" id="btn-trend-clear">
                    <i class="fas fa-trash"></i> Clear Data
                </button>
                <button class="btn btn--primary advanced-modal__close-btn">
                    <i class="fas fa-check"></i> Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    trendModalOpen = true;

    // Add event listeners
    modal.querySelectorAll('.advanced-modal__close, .advanced-modal__close-btn, .advanced-modal__backdrop').forEach(el => {
        el.addEventListener('click', closeTrendModal);
    });

    // Start recording button
    const startBtn = modal.querySelector('#btn-start-recording');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            trendMonitoring.startFlight({ registration: 'F-GKXA', type: 'A320-214' });
            closeTrendModal();
            showTrendModal();
        });
    }

    // Acknowledge alert buttons
    modal.querySelectorAll('.trend-alert-item__ack').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const alertId = e.currentTarget.dataset.alertId;
            trendMonitoring.acknowledgeAlert(alertId);
            closeTrendModal();
            showTrendModal();
        });
    });

    // Report button
    const reportBtn = modal.querySelector('#btn-trend-report');
    if (reportBtn) {
        reportBtn.addEventListener('click', generateTrendReport);
    }

    // Clear button
    const clearBtn = modal.querySelector('#btn-trend-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const message = window.i18n ? window.i18n.t('msg.confirm_trend_clear') : 'Clear all trend monitoring data?';
            if (confirm(message)) {
                trendMonitoring.clearData();
                closeTrendModal();
                showTrendModal();
            }
        });
    }

    // ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape' && trendModalOpen) {
            closeTrendModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Close trend modal
 */
function closeTrendModal() {
    const modal = document.getElementById('trend-modal');
    if (modal) {
        modal.remove();
    }
    trendModalOpen = false;
}

/**
 * Generate trend report
 */
function generateTrendReport() {
    const report = trendMonitoring.generateMaintenanceReport();
    
    console.log('Trend Monitoring Report:', report);
    
    const title = window.i18n ? window.i18n.t('trends.title') : 'Trend Monitoring';
    const message = `<strong>Predictive Maintenance Report</strong><br/><br/>` +
          `<strong>Flights Sampled:</strong> ${report.flightsSampled}<br/>` +
          `<strong>Parameters Monitored:</strong> ${report.totalParameters}<br/>` +
          `<strong>Degrading Parameters:</strong> ${report.degradingParameters}<br/>` +
          `<strong>Active Alerts:</strong> ${report.activeAlerts}<br/><br/>` +
          `${report.recommendations.length > 0 ? '<strong>Recommendations:</strong><br/>' + report.recommendations.map(r => `• ${r.action}`).join('<br/>') : 'No recommendations at this time.'}`;
    window.showInfo(title, message);
}

// ============= EXPORTS =============

export {
    initAdvancedFeatures,
    biteSystem,
    trainingSystem,
    trendMonitoring
};

// Global exposure
window.advancedFeatures = {
    bite: biteSystem,
    training: trainingSystem,
    trend: trendMonitoring,
    showBITE: showBITEModal,
    showTraining: showTrainingModal,
    showTrend: showTrendModal
};

// Auto-initialize when DOM ready
console.log('[ADVANCED] Script loaded, readyState:', document.readyState);

function tryInit() {
    console.log('[ADVANCED] Attempting initialization...');
    const biteBtn = document.getElementById('btn-bite');
    const trainingBtn = document.getElementById('btn-training');
    const trendBtn = document.getElementById('btn-trend');
    
    console.log('[ADVANCED] Buttons check:', {
        bite: !!biteBtn,
        training: !!trainingBtn,
        trend: !!trendBtn
    });
    
    if (biteBtn && trainingBtn && trendBtn) {
        initAdvancedFeatures();
    } else {
        console.warn('[ADVANCED] Buttons not found, retrying in 200ms...');
        setTimeout(tryInit, 200);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[ADVANCED] DOMContentLoaded event fired');
        setTimeout(tryInit, 150);
    });
} else {
    console.log('[ADVANCED] Document already loaded');
    setTimeout(tryInit, 150);
}
