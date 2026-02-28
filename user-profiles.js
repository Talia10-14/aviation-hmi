/**
 * User Profiles Manager - Aviation HMI v2.7.0
 * Gestion des profils utilisateurs et préférences personnalisées
 */

class UserProfilesManager {
    constructor() {
        this.profiles = [];
        this.currentProfile = null;
        this.defaultProfile = {
            id: 'default',
            name: 'Défaut',
            role: 'pilot',
            preferences: {
                theme: 'dark',
                fontSize: 'medium',
                language: 'fr',
                company: null,
                voiceAlerts: false,
                soundEffects: false,
                showTooltips: true,
                autoSave: true,
                notifications: true
            },
            customSettings: {},
            statistics: {
                sessionsCount: 0,
                totalFlightTime: 0,
                alarmsHandled: 0,
                lastLogin: null
            }
        };

        this.loadProfiles();
        this.initAutoSave();
    }

    /**
     * Load profiles from localStorage
     */
    loadProfiles() {
        const saved = localStorage.getItem('aviation-hmi-profiles');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.profiles = data.profiles || [];
                const currentId = data.currentProfile;
                
                if (currentId) {
                    this.currentProfile = this.profiles.find(p => p.id === currentId);
                }
                
                if (!this.currentProfile && this.profiles.length > 0) {
                    this.currentProfile = this.profiles[0];
                }
            } catch (e) {
                console.error('[PROFILES] Failed to load profiles:', e);
            }
        }

        // Create default profile if none exist
        if (this.profiles.length === 0) {
            this.createProfile('Profil par défaut', 'pilot');
        }

        // Ensure a profile is selected
        if (!this.currentProfile && this.profiles.length > 0) {
            this.currentProfile = this.profiles[0];
        }
    }

    /**
     * Save profiles to localStorage
     */
    saveProfiles() {
        const data = {
            profiles: this.profiles,
            currentProfile: this.currentProfile?.id || null
        };
        localStorage.setItem('aviation-hmi-profiles', JSON.stringify(data));
        
        console.log('[PROFILES] Saved profiles:', this.profiles.length);
    }

    /**
     * Initialize auto-save
     */
    initAutoSave() {
        // Auto-save every 5 minutes
        setInterval(() => {
            if (this.currentProfile?.preferences.autoSave) {
                this.saveProfiles();
            }
        }, 300000);
    }

    /**
     * Create new profile
     */
    createProfile(name, role = 'pilot', company = null) {
        const profile = {
            ...JSON.parse(JSON.stringify(this.defaultProfile)),
            id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name,
            role: role,
            preferences: {
                ...this.defaultProfile.preferences,
                company: company
            },
            statistics: {
                ...this.defaultProfile.statistics,
                lastLogin: new Date().toISOString()
            }
        };

        this.profiles.push(profile);
        this.saveProfiles();

        window.dispatchEvent(new CustomEvent('profileCreated', {
            detail: { profile }
        }));

        return profile;
    }

    /**
     * Switch to profile
     */
    switchProfile(profileId) {
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) {
            console.error('[PROFILES] Profile not found:', profileId);
            return false;
        }

        this.currentProfile = profile;
        this.currentProfile.statistics.lastLogin = new Date().toISOString();
        this.saveProfiles();

        // Apply profile preferences
        this.applyProfilePreferences(profile);

        window.dispatchEvent(new CustomEvent('profileSwitched', {
            detail: { profile }
        }));

        return true;
    }

    /**
     * Apply profile preferences to the application
     */
    applyProfilePreferences(profile) {
        const prefs = profile.preferences;

        // Apply theme
        if (window.themeManager && prefs.theme) {
            window.themeManager.setTheme(prefs.theme, false);
        }

        // Apply font size
        if (window.themeManager && prefs.fontSize) {
            window.themeManager.setFontSize(prefs.fontSize);
        }

        // Apply language
        if (window.i18n && prefs.language) {
            window.i18n.setLanguage(prefs.language);
        }

        // Apply company theme if specified
        if (prefs.company && window.themeManager) {
            const companyThemes = {
                'air-france': 'airfrance',
                'lufthansa': 'lufthansa',
                'emirates': 'emirates',
                'british-airways': 'british'
            };
            const companyTheme = companyThemes[prefs.company];
            if (companyTheme) {
                window.themeManager.setTheme(companyTheme, false);
            }
        }

        console.log('[PROFILES] Applied preferences for:', profile.name);
    }

    /**
     * Update current profile preferences
     */
    updatePreference(key, value) {
        if (!this.currentProfile) return false;

        this.currentProfile.preferences[key] = value;
        this.saveProfiles();

        window.dispatchEvent(new CustomEvent('preferenceUpdated', {
            detail: { key, value }
        }));

        return true;
    }

    /**
     * Update profile statistics
     */
    updateStatistics(updates) {
        if (!this.currentProfile) return false;

        Object.assign(this.currentProfile.statistics, updates);
        this.saveProfiles();

        return true;
    }

    /**
     * Increment session count
     */
    incrementSession() {
        if (!this.currentProfile) return;
        this.currentProfile.statistics.sessionsCount++;
        this.saveProfiles();
    }

    /**
     * Add flight time
     */
    addFlightTime(minutes) {
        if (!this.currentProfile) return;
        this.currentProfile.statistics.totalFlightTime += minutes;
        this.saveProfiles();
    }

    /**
     * Increment alarms handled
     */
    incrementAlarmsHandled() {
        if (!this.currentProfile) return;
        this.currentProfile.statistics.alarmsHandled++;
        this.saveProfiles();
    }

    /**
     * Delete profile
     */
    deleteProfile(profileId) {
        const index = this.profiles.findIndex(p => p.id === profileId);
        if (index === -1) return false;

        // Don't allow deleting the last profile
        if (this.profiles.length === 1) {
            console.warn('[PROFILES] Cannot delete last profile');
            return false;
        }

        this.profiles.splice(index, 1);

        // Switch to another profile if current was deleted
        if (this.currentProfile?.id === profileId) {
            this.switchProfile(this.profiles[0].id);
        }

        this.saveProfiles();

        window.dispatchEvent(new CustomEvent('profileDeleted', {
            detail: { profileId }
        }));

        return true;
    }

    /**
     * Get current profile
     */
    getCurrentProfile() {
        return this.currentProfile;
    }

    /**
     * Get all profiles
     */
    getAllProfiles() {
        return this.profiles;
    }

    /**
     * Export profile
     */
    exportProfile(profileId) {
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) return null;

        const data = JSON.stringify(profile, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `aviation-hmi-profile-${profile.name.replace(/\s+/g, '-')}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Import profile from JSON
     */
    importProfile(jsonData) {
        try {
            const profile = JSON.parse(jsonData);
            
            // Validate profile structure
            if (!profile.name || !profile.preferences) {
                throw new Error('Invalid profile format');
            }

            // Generate new ID
            profile.id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Reset statistics
            profile.statistics = {
                ...this.defaultProfile.statistics,
                lastLogin: new Date().toISOString()
            };

            this.profiles.push(profile);
            this.saveProfiles();

            return profile;
        } catch (e) {
            console.error('[PROFILES] Failed to import profile:', e);
            return null;
        }
    }

    /**
     * Create profile selector widget
     */
    createProfileSelector() {
        const container = document.createElement('div');
        container.className = 'profile-selector';
        
        const currentName = this.currentProfile?.name || 'Profil';
        const currentRole = this.currentProfile?.role || 'pilot';
        const roleIcons = {
            pilot: 'fa-user-pilot',
            engineer: 'fa-user-cog',
            maintenance: 'fa-tools',
            admin: 'fa-user-shield'
        };

        container.innerHTML = `
            <button class="profile-selector__btn" id="profile-selector-btn">
                <i class="fas ${roleIcons[currentRole] || 'fa-user'}"></i>
                <span class="profile-selector__name">${currentName}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="profile-selector__dropdown hidden" id="profile-dropdown">
                <div class="profile-selector__list">
                    ${this.profiles.map(profile => `
                        <button class="profile-selector__option ${profile.id === this.currentProfile?.id ? 'profile-selector__option--active' : ''}" 
                                data-profile-id="${profile.id}">
                            <i class="fas ${roleIcons[profile.role] || 'fa-user'}"></i>
                            <div class="profile-selector__info">
                                <span class="profile-selector__profile-name">${profile.name}</span>
                                <span class="profile-selector__role">${profile.role}</span>
                            </div>
                            ${profile.id === this.currentProfile?.id ? '<i class="fas fa-check"></i>' : ''}
                        </button>
                    `).join('')}
                </div>
                <div class="profile-selector__actions">
                    <button class="profile-selector__action" id="new-profile-btn">
                        <i class="fas fa-plus"></i> <span data-i18n="profile.new">Nouveau profil</span>
                    </button>
                    <button class="profile-selector__action" id="manage-profiles-btn">
                        <i class="fas fa-cog"></i> <span data-i18n="profile.manage">Gérer les profils</span>
                    </button>
                </div>
            </div>
        `;

        this.bindSelectorEvents(container);

        return container;
    }

    /**
     * Bind events to profile selector
     */
    bindSelectorEvents(container) {
        const btn = container.querySelector('#profile-selector-btn');
        const dropdown = container.querySelector('#profile-dropdown');

        // Toggle dropdown
        btn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // Profile selection
        const options = container.querySelectorAll('[data-profile-id]');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const profileId = option.getAttribute('data-profile-id');
                this.switchProfile(profileId);
                dropdown.classList.add('hidden');
                
                // Update selector UI
                const newProfile = this.profiles.find(p => p.id === profileId);
                if (newProfile) {
                    const nameSpan = container.querySelector('.profile-selector__name');
                    if (nameSpan) nameSpan.textContent = newProfile.name;
                }
            });
        });

        // New profile button
        const newBtn = container.querySelector('#new-profile-btn');
        newBtn?.addEventListener('click', () => {
            dropdown.classList.add('hidden');
            this.showNewProfileDialog();
        });

        // Manage profiles button
        const manageBtn = container.querySelector('#manage-profiles-btn');
        manageBtn?.addEventListener('click', () => {
            dropdown.classList.add('hidden');
            this.showManageProfilesDialog();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    /**
     * Show new profile dialog
     */
    showNewProfileDialog() {
        const t = (key) => window.i18n ? window.i18n.t(key) : key;
        
        const name = prompt(t('profile.enter_name'), '');
        if (!name) return;

        const role = prompt(t('profile.enter_role') + ' (pilot/engineer/maintenance/admin)', 'pilot');
        const company = prompt(t('profile.enter_company') + ' (air-france/lufthansa/emirates/british-airways)', '');

        const profile = this.createProfile(name, role || 'pilot', company || null);
        this.switchProfile(profile.id);

        const title = t('profile.manage_title');
        const message = t('profile.created_success').replace('{name}', name);
        window.showSuccess(title, message);
    }

    /**
     * Show manage profiles dialog
     */
    showManageProfilesDialog() {
        let dialog = document.querySelector('.profiles-dialog');
        if (!dialog) {
            dialog = this.createManageDialog();
            document.body.appendChild(dialog);
        }
        
        dialog.classList.remove('hidden');
        
        if (window.i18n) {
            window.i18n.updateDOM();
        }
    }

    /**
     * Create manage profiles dialog
     */
    createManageDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'profiles-dialog';
        dialog.innerHTML = `
            <div class="profiles-dialog__overlay"></div>
            <div class="profiles-dialog__content">
                <div class="profiles-dialog__header">
                    <h3 data-i18n="profile.manage_title">Gestion des Profils</h3>
                    <button class="profiles-dialog__close" id="profiles-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="profiles-dialog__body" id="profiles-list">
                    ${this.renderProfilesList()}
                </div>
            </div>
        `;

        this.bindDialogEvents(dialog);

        return dialog;
    }

    /**
     * Render profiles list
     */
    renderProfilesList() {
        return this.profiles.map(profile => `
            <div class="profile-card" data-profile-id="${profile.id}">
                <div class="profile-card__header">
                    <h4>${profile.name}</h4>
                    <span class="profile-card__role">${profile.role}</span>
                </div>
                <div class="profile-card__stats">
                    <div class="profile-stat">
                        <i class="fas fa-calendar"></i>
                        <span>${profile.statistics.sessionsCount} sessions</span>
                    </div>
                    <div class="profile-stat">
                        <i class="fas fa-clock"></i>
                        <span>${Math.round(profile.statistics.totalFlightTime)} min</span>
                    </div>
                    <div class="profile-stat">
                        <i class="fas fa-bell"></i>
                        <span>${profile.statistics.alarmsHandled} alarmes</span>
                    </div>
                </div>
                <div class="profile-card__actions">
                    <button class="btn btn--ghost btn--small profile-export-btn" data-profile-id="${profile.id}">
                        <i class="fas fa-download"></i> <span data-i18n="profile.export">Exporter</span>
                    </button>
                    ${this.profiles.length > 1 ? `
                        <button class="btn btn--ghost btn--small profile-delete-btn" data-profile-id="${profile.id}">
                            <i class="fas fa-trash"></i> <span data-i18n="profile.delete">Supprimer</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * Bind dialog events
     */
    bindDialogEvents(dialog) {
        // Close button
        const closeBtn = dialog.querySelector('#profiles-close-btn');
        const overlay = dialog.querySelector('.profiles-dialog__overlay');
        
        const closeDialog = () => dialog.classList.add('hidden');
        closeBtn?.addEventListener('click', closeDialog);
        overlay?.addEventListener('click', closeDialog);

        // Export buttons
        dialog.addEventListener('click', (e) => {
            const exportBtn = e.target.closest('.profile-export-btn');
            if (exportBtn) {
                const profileId = exportBtn.getAttribute('data-profile-id');
                this.exportProfile(profileId);
            }

            const deleteBtn = e.target.closest('.profile-delete-btn');
            if (deleteBtn) {
                const profileId = deleteBtn.getAttribute('data-profile-id');
                const t = (key) => window.i18n ? window.i18n.t(key) : key;
                
                if (confirm(t('profile.confirm_delete'))) {
                    this.deleteProfile(profileId);
                    
                    // Refresh list
                    const listContainer = dialog.querySelector('#profiles-list');
                    if (listContainer) {
                        listContainer.innerHTML = this.renderProfilesList();
                    }
                }
            }
        });
    }
}

// Export singleton instance
export const userProfiles = new UserProfilesManager();
window.userProfiles = userProfiles;

export default userProfiles;
