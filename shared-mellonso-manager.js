/**
 * Shared MELLONSO Manager
 * Handles reading and writing MELLONSO data to a shared JSON file
 * This allows multiple users to see the same MELLONSO configuration
 */

class SharedMellonsoManager {
    constructor() {
        this.apiEndpoint = 'mellonso-api.php';
        this.fallbackToLocalStorage = true;
        this.syncInterval = 3000; // Sync every 3 seconds
        this.lastSyncTime = 0;
        this.isOnline = true;
        
        // Start automatic syncing
        this.startAutoSync();
        
        // Check if we can access the shared API
        this.checkConnectivity();
    }

    // Check if we can access the shared file
    async checkConnectivity() {
        try {
            await this.loadSharedData();
            this.isOnline = true;
            console.log('✅ Connected to shared MELLONSO system');
        } catch (error) {
            console.warn('⚠️ Cannot access shared MELLONSO file, falling back to localStorage');
            this.isOnline = false;
        }
    }

    // Load data from shared API
    async loadSharedData() {
        try {
            const response = await fetch(this.apiEndpoint + '?t=' + Date.now());
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            console.log('📥 Loaded shared MELLONSO data from API:', data);
            this.isOnline = true;
            return data;
        } catch (error) {
            console.error('Error loading shared MELLONSO data from API:', error);
            this.isOnline = false;
            if (this.fallbackToLocalStorage) {
                return this.loadLocalData();
            }
            throw error;
        }
    }

    // Save data to shared API
    async saveSharedData(data) {
        try {
            // Add timestamp
            data.lastModified = new Date().toISOString();
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📤 Saved MELLONSO data to shared API:', result);
            this.isOnline = true;
            
            return true;
        } catch (error) {
            console.error('Error saving shared MELLONSO data to API:', error);
            this.isOnline = false;
            if (this.fallbackToLocalStorage) {
                this.saveLocalData(data);
            }
            throw error;
        }
    }

    // Update specific section via API
    async updateSection(section, value) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ section, value })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`📤 Updated MELLONSO section ${section}:`, result);
            this.isOnline = true;
            
            return true;
        } catch (error) {
            console.error(`Error updating MELLONSO section ${section}:`, error);
            this.isOnline = false;
            throw error;
        }
    }

    // Load from localStorage (fallback)
    loadLocalData() {
        const data = {
            mellonsoConfig: JSON.parse(localStorage.getItem('mellonsoConfig') || '{}'),
            contactRequests: JSON.parse(localStorage.getItem('contactRequests') || '[]'),
            lastModified: new Date().toISOString()
        };
        console.log('📥 Loaded local MELLONSO data (fallback)');
        return data;
    }

    // Save to localStorage (fallback)
    saveLocalData(data) {
        localStorage.setItem('mellonsoConfig', JSON.stringify(data.mellonsoConfig || {}));
        localStorage.setItem('contactRequests', JSON.stringify(data.contactRequests || []));
        console.log('💾 Saved MELLONSO data to localStorage (fallback)');
    }

    // Get MELLONSO configuration
    async getMellonsoConfig() {
        const data = await this.loadSharedData();
        return data.mellonsoConfig || {};
    }

    // Save MELLONSO configuration
    async saveMellonsoConfig(config) {
        try {
            await this.updateSection('mellonsoConfig', config);
        } catch (error) {
            // Fallback to full data update
            const data = await this.loadSharedData();
            data.mellonsoConfig = config;
            await this.saveSharedData(data);
        }
    }

    // Get contact requests
    async getContactRequests() {
        const data = await this.loadSharedData();
        return data.contactRequests || [];
    }

    // Save contact requests
    async saveContactRequests(requests) {
        try {
            await this.updateSection('contactRequests', requests);
        } catch (error) {
            // Fallback to full data update
            const data = await this.loadSharedData();
            data.contactRequests = requests;
            await this.saveSharedData(data);
        }
    }

    // Add contact request
    async addContactRequest(request) {
        const requests = await this.getContactRequests();
        requests.unshift(request);
        await this.saveContactRequests(requests);
    }

    // Start automatic syncing
    startAutoSync() {
        setInterval(async () => {
            try {
                await this.checkConnectivity();
            } catch (error) {
                // Ignore sync errors
            }
        }, this.syncInterval);
    }

    // Get connection status
    getConnectionStatus() {
        return {
            isOnline: this.isOnline,
            usingSharedData: this.isOnline,
            usingLocalStorage: !this.isOnline || this.fallbackToLocalStorage,
            apiEndpoint: this.apiEndpoint,
            lastSyncTime: this.lastSyncTime
        };
    }
}

// Create global instance
window.sharedMellonsoManager = new SharedMellonsoManager();
