/**
 * Fault History and Maintenance Tracking
 * Track all faults, maintenance actions, and trend data
 * Compliant with EASA Part-M and CAMO requirements
 */

/**
 * Fault History Manager
 * Stores complete fault history with timestamps and flight phases
 */
export class FaultHistoryManager {
    constructor() {
        this.history = [];
        this.flightPhase = 'GROUND'; // GROUND, TAXI, TAKEOFF, CLIMB, CRUISE, DESCENT, APPROACH, LANDING
        this.currentFlight = {
            flightNumber: null,
            departure: null,
            arrival: null,
            blockOn: null,
            blockOff: null
        };
    }

    /**
     * Add fault to history
     * @param {object} fault - Fault object
     */
    addFault(fault) {
        const entry = {
            id: `FH-${Date.now()}`,
            timestamp: new Date().toISOString(),
            utcTime: new Date().toISOString().substr(11, 8),
            ...fault,
            flightPhase: this.flightPhase,
            flightInfo: { ...this.currentFlight },
            acknowledged: false,
            clearedTimestamp: null,
            recurrence: this.getRecurrenceCount(fault.code),
            engineHours: this.getEngineHours(),
            cycles: this.getCycles()
        };

        this.history.push(entry);
        this.saveToStorage();
        
        return entry;
    }

    /**
     * Get recurrence count for a fault code
     * @param {string} code - Fault code
     * @returns {number} Number of occurrences
     */
    getRecurrenceCount(code) {
        return this.history.filter(f => f.code === code).length;
    }

    /**
     * Clear/resolve a fault
     * @param {string} faultId - Fault ID
     * @param {string} resolution - Resolution description
     */
    clearFault(faultId, resolution = 'Cleared') {
        const fault = this.history.find(f => f.id === faultId);
        if (fault) {
            fault.clearedTimestamp = new Date().toISOString();
            fault.resolution = resolution;
            fault.duration = this.calculateDuration(fault.timestamp, fault.clearedTimestamp);
            this.saveToStorage();
        }
    }

    /**
     * Get active faults (not cleared)
     * @returns {Array} Array of active faults
     */
    getActiveFaults() {
        return this.history.filter(f => !f.clearedTimestamp);
    }

    /**
     * Get faults by flight
     * @param {string} flightNumber - Flight number
     * @returns {Array} Faults for that flight
     */
    getFaultsByFlight(flightNumber) {
        return this.history.filter(f => f.flightInfo.flightNumber === flightNumber);
    }

    /**
     * Get faults by system
     * @param {string} system - System name
     * @returns {Array} Faults for that system
     */
    getFaultsBySystem(system) {
        return this.history.filter(f => f.sys === system);
    }

    /**
     * Get recurrent faults (> 3 occurrences in last 7 days)
     * @returns {Array} Recurrent faults
     */
    getRecurrentFaults() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentFaults = this.history.filter(f => 
            new Date(f.timestamp) > sevenDaysAgo
        );

        const counts = {};
        recentFaults.forEach(f => {
            counts[f.code] = (counts[f.code] || 0) + 1;
        });

        return Object.entries(counts)
            .filter(([_, count]) => count >= 3)
            .map(([code, count]) => ({ code, count }));
    }

    /**
     * Generate maintenance report
     * @returns {object} Maintenance report
     */
    generateMaintenanceReport() {
        return {
            totalFaults: this.history.length,
            activeFaults: this.getActiveFaults().length,
            clearedFaults: this.history.filter(f => f.clearedTimestamp).length,
            recurrentFaults: this.getRecurrentFaults(),
            criticalWarnings: this.history.filter(f => f.level === 'warning').length,
            systemBreakdown: this.getSystemBreakdown(),
            lastUpdate: new Date().toISOString()
        };
    }

    /**
     * Get breakdown by system
     * @returns {object} Fault count per system
     */
    getSystemBreakdown() {
        const breakdown = {};
        this.history.forEach(f => {
            breakdown[f.sys] = (breakdown[f.sys] || 0) + 1;
        });
        return breakdown;
    }

    /**
     * Calculate duration between timestamps
     * @param {string} start - Start timestamp
     * @param {string} end - End timestamp
     * @returns {string} Duration formatted
     */
    calculateDuration(start, end) {
        const ms = new Date(end) - new Date(start);
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    /**
     * Get engine hours (mock - would come from aircraft data)
     * @returns {number} Engine hours
     */
    getEngineHours() {
        // Mock implementation
        return 12547.3;
    }

    /**
     * Get cycles (mock - would come from aircraft data)
     * @returns {number} Cycles
     */
    getCycles() {
        // Mock implementation
        return 8234;
    }

    /**
     * Save to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('faultHistory', JSON.stringify(this.history));
        } catch (e) {
            console.warn('Could not save fault history:', e);
        }
    }

    /**
     * Load from localStorage
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem('faultHistory');
            if (data) {
                this.history = JSON.parse(data);
            }
        } catch (e) {
            console.warn('Could not load fault history:', e);
        }
    }

    /**
     * Export history as CSV
     * @returns {string} CSV formatted string
     */
    exportAsCSV() {
        const headers = ['ID', 'Timestamp', 'Code', 'Message', 'Level', 'System', 'Flight Phase', 'Duration', 'Resolution'];
        const rows = this.history.map(f => [
            f.id,
            f.timestamp,
            f.code,
            f.msg,
            f.level,
            f.sys,
            f.flightPhase,
            f.duration || 'Active',
            f.resolution || '-'
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return csv;
    }

    /**
     * Clear all history (caution!)
     */
    clearAllHistory() {
        const message = window.i18n ? 
            window.i18n.t('msg.confirm_history_clear') : 
            '⚠️ Clear all fault history? This action cannot be undone.';
        if (confirm(message)) {
            this.history = [];
            this.saveToStorage();
            return true;
        }
        return false;
    }
}

/**
 * Maintenance Task Tracker
 * Track MEL/CDL items and maintenance due items
 */
export class MaintenanceTracker {
    constructor() {
        this.tasks = [];
        this.melItems = [];
        this.loadFromStorage();
    }

    /**
     * Add MEL (Minimum Equipment List) item
     * @param {object} item - MEL item
     */
    addMELItem(item) {
        const melItem = {
            id: `MEL-${Date.now()}`,
            melReference: item.melReference, // e.g., "21-11-01"
            description: item.description,
            category: item.category, // A, B, C, D
            rectificationInterval: this.getRectificationInterval(item.category),
            deferredOn: new Date().toISOString(),
            dueDate: this.calculateDueDate(item.category),
            operationalRestrictions: item.restrictions || [],
            maintenanceActions: item.actions || [],
            status: 'DEFERRED'
        };

        this.melItems.push(melItem);
        this.saveToStorage();
        
        return melItem;
    }

    /**
     * Get rectification interval based on MEL category
     * @param {string} category - A, B, C, or D
     * @returns {string} Interval description
     */
    getRectificationInterval(category) {
        const intervals = {
            'A': 'None - Operation prohibited',
            'B': '3 calendar days',
            'C': '10 calendar days',
            'D': '120 calendar days'
        };
        return intervals[category] || 'Unknown';
    }

    /**
     * Calculate due date based on category
     * @param {string} category - MEL category
     * @returns {string} Due date ISO string
     */
    calculateDueDate(category) {
        const days = {
            'A': 0,
            'B': 3,
            'C': 10,
            'D': 120
        };

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (days[category] || 0));
        return dueDate.toISOString();
    }

    /**
     * Get overdue MEL items
     * @returns {Array} Overdue items
     */
    getOverdueMELItems() {
        const now = new Date();
        return this.melItems.filter(item => 
            new Date(item.dueDate) < now && item.status === 'DEFERRED'
        );
    }

    /**
     * Rectify MEL item
     * @param {string} itemId - MEL item ID
     * @param {string} action - Action taken
     */
    rectifyMELItem(itemId, action) {
        const item = this.melItems.find(m => m.id === itemId);
        if (item) {
            item.status = 'RECTIFIED';
            item.rectifiedOn = new Date().toISOString();
            item.rectificationAction = action;
            this.saveToStorage();
        }
    }

    /**
     * Add scheduled maintenance task
     * @param {object} task - Maintenance task
     */
    addTask(task) {
        const maintenanceTask = {
            id: `MT-${Date.now()}`,
            ...task,
            status: 'PENDING',
            createdOn: new Date().toISOString()
        };

        this.tasks.push(maintenanceTask);
        this.saveToStorage();
        
        return maintenanceTask;
    }

    /**
     * Save to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('maintenanceTasks', JSON.stringify(this.tasks));
            localStorage.setItem('melItems', JSON.stringify(this.melItems));
        } catch (e) {
            console.warn('Could not save maintenance data:', e);
        }
    }

    /**
     * Load from localStorage
     */
    loadFromStorage() {
        try {
            const tasks = localStorage.getItem('maintenanceTasks');
            const mel = localStorage.getItem('melItems');
            
            if (tasks) this.tasks = JSON.parse(tasks);
            if (mel) this.melItems = JSON.parse(mel);
        } catch (e) {
            console.warn('Could not load maintenance data:', e);
        }
    }
}

// Singleton instances
export const faultHistory = new FaultHistoryManager();
export const maintenanceTracker = new MaintenanceTracker();

export default {
    FaultHistoryManager,
    MaintenanceTracker,
    faultHistory,
    maintenanceTracker
};
