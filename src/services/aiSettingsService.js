/**
 * AI Settings Service
 * Manages AI provider settings and API keys
 */

import { getStorage, setStorage } from '../utils/storage.js';

const SETTINGS_KEY = 'ai_settings';

const DEFAULT_SETTINGS = {
    selectedProvider: 'claude',
    apiKeys: {}
};

/**
 * Get all AI settings
 * @returns {Object} Settings object
 */
export function getAISettings() {
    return getStorage(SETTINGS_KEY, DEFAULT_SETTINGS);
}

/**
 * Save all AI settings
 * @param {Object} settings - Settings object
 * @returns {boolean} Success status
 */
export function saveAISettings(settings) {
    return setStorage(SETTINGS_KEY, settings);
}

/**
 * Get selected provider ID
 * @returns {string} Provider ID
 */
export function getSelectedProvider() {
    const settings = getAISettings();
    return settings.selectedProvider || DEFAULT_SETTINGS.selectedProvider;
}

/**
 * Set selected provider
 * @param {string} providerId - Provider ID
 * @returns {boolean} Success status
 */
export function setSelectedProvider(providerId) {
    const settings = getAISettings();
    settings.selectedProvider = providerId;
    return saveAISettings(settings);
}

/**
 * Get API key for a provider
 * @param {string} providerId - Provider ID
 * @returns {string|null} API key or null
 */
export function getApiKey(providerId) {
    return localStorage.getItem(`api_key_${providerId}`) || null;
}

/**
 * Set API key for a provider
 * @param {string} providerId - Provider ID
 * @param {string} apiKey - API key
 * @returns {boolean} Success status
 */
export function setApiKey(providerId, apiKey) {
    try {
        localStorage.setItem(`api_key_${providerId}`, apiKey);
        return true;
    } catch (error) {
        console.error('Error saving API key:', error);
        return false;
    }
}

/**
 * Remove API key for a provider
 * @param {string} providerId - Provider ID
 * @returns {boolean} Success status
 */
export function removeApiKey(providerId) {
    try {
        localStorage.removeItem(`api_key_${providerId}`);
        return true;
    } catch (error) {
        console.error('Error removing API key:', error);
        return false;
    }
}

/**
 * Check if a provider has an API key configured
 * @param {string} providerId - Provider ID
 * @returns {boolean} True if key exists
 */
export function hasApiKey(providerId) {
    return !!localStorage.getItem(`api_key_${providerId}`);
}

/**
 * Clear all API keys
 * @returns {boolean} Success status
 */
export function clearAllApiKeys() {
    try {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('api_key_')) {
                localStorage.removeItem(key);
            }
        });
        return true;
    } catch (error) {
        console.error('Error clearing API keys:', error);
        return false;
    }
}

/**
 * Reset all settings to defaults
 * @returns {boolean} Success status
 */
export function resetSettings() {
    return setStorage(SETTINGS_KEY, DEFAULT_SETTINGS);
}
