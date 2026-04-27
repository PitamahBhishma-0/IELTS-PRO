/**
 * LocalStorage wrapper with error handling and type safety
 */

const STORAGE_KEY = 'ielts_pro_data';
const STORAGE_VERSION = '1.0.0';

/**
 * Safely get data from localStorage
 *
 * @param {string} key - The storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} The stored value or default
 */
export function getStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return defaultValue;

        const parsed = JSON.parse(data);

        // Check version compatibility
        if (parsed.version !== STORAGE_VERSION) {
            console.warn('Storage version mismatch, migrating data...');
            migrateStorage(parsed);
        }

        return parsed[key] ?? defaultValue;
    } catch (error) {
        console.error('Error reading from storage:', error);
        return defaultValue;
    }
}

/**
 * Safely set data in localStorage
 *
 * @param {string} key - The storage key
 * @param {*} value - The value to store
 * @returns {boolean} Success status
 */
export function setStorage(key, value) {
    try {
        const existing = getStorageRaw();
        existing[key] = value;
        existing.version = STORAGE_VERSION;
        existing.lastUpdated = new Date().toISOString();

        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        return true;
    } catch (error) {
        console.error('Error writing to storage:', error);
        return false;
    }
}

/**
 * Remove a specific key from storage
 *
 * @param {string} key - The storage key to remove
 * @returns {boolean} Success status
 */
export function removeStorage(key) {
    try {
        const existing = getStorageRaw();
        delete existing[key];
        existing.version = STORAGE_VERSION;
        existing.lastUpdated = new Date().toISOString();

        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        return true;
    } catch (error) {
        console.error('Error removing from storage:', error);
        return false;
    }
}

/**
 * Clear all stored data
 *
 * @returns {boolean} Success status
 */
export function clearStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing storage:', error);
        return false;
    }
}

/**
 * Get raw storage data
 *
 * @returns {Object} The raw storage object
 */
function getStorageRaw() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading raw storage:', error);
        return {};
    }
}

/**
 * Migrate storage data between versions
 *
 * @param {Object} data - The existing storage data
 */
function migrateStorage(data) {
    // Add migration logic here when version changes
    // For now, just update the version
    data.version = STORAGE_VERSION;
    data.lastUpdated = new Date().toISOString();

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error migrating storage:', error);
    }
}

/**
 * Check if storage is available
 *
 * @returns {boolean} Storage availability
 */
export function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        return false;
    }
}
