/**
 * AI Provider Registry
 * Central registry for all available AI providers
 */

import { ClaudeProvider } from './claudeProvider.js';
import { OpenAIProvider } from './openaiProvider.js';
import { GeminiProvider } from './geminiProvider.js';
import { DeepSeekProvider } from './deepseekProvider.js';
import { OpenRouterProvider } from './openRouterProvider.js';

const providers = {
    claude: ClaudeProvider,
    openai: OpenAIProvider,
    gemini: GeminiProvider,
    deepseek: DeepSeekProvider,
    openrouter: OpenRouterProvider
};

/**
 * Get a provider instance by ID
 * @param {string} id - Provider ID
 * @param {Object} config - Provider configuration
 * @returns {BaseAIProvider} Provider instance
 */
export function getProvider(id, config = {}) {
    const ProviderClass = providers[id];
    if (!ProviderClass) {
        throw new Error(`Unknown provider: ${id}`);
    }
    return new ProviderClass(config);
}

/**
 * Get all available providers
 * @returns {Array} Array of provider info objects
 */
export function getAllProviders() {
    return Object.entries(providers).map(([id, ProviderClass]) => ({
        id,
        displayName: new ProviderClass({}).getDisplayName()
    }));
}

/**
 * Check if a provider ID is valid
 * @param {string} id - Provider ID
 * @returns {boolean} True if valid
 */
export function isValidProvider(id) {
    return id in providers;
}
