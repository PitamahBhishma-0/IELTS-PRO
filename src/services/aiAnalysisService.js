/**
 * AI Analysis Service
 * Provides AI-powered IELTS writing analysis using multiple AI providers
 */

import { getProvider, getAllProviders } from './aiProviders/registry.js';
import { getAISettings, getApiKey, setSelectedProvider, setApiKey, removeApiKey } from './aiSettingsService.js';

/**
 * Analyze text using AI and return comprehensive IELTS band scores
 *
 * @param {string} text - The text to analyze
 * @param {string} questionType - Question type (e.g., 'task1', 'task2', 'bar-chart', 'line-graph', 'pie-chart', 'table', 'process', 'map', 'opinion', 'discussion', 'problem-solution', 'advantage-disadvantage', 'two-part')
 * @param {Object} question - The question object
 * @returns {Promise<Object>} Analysis results with scores and feedback
 */
export async function analyzeTextWithAI(text, questionType, question) {
    const settings = getAISettings();
    const providerId = settings.selectedProvider || 'claude';
    const apiKey = getApiKey(providerId);

    if (!apiKey) {
        throw new Error('API key required. Please configure your AI provider in settings.');
    }

    const provider = getProvider(providerId, { apiKey });
    return await provider.analyze(text, questionType, question);
}

/**
 * Get all available AI providers
 * @returns {Array} Array of provider info objects
 */
export function getAvailableProviders() {
    return getAllProviders();
}

/**
 * Get current selected provider ID
 * @returns {string} Provider ID
 */
export function getSelectedProvider() {
    return getAISettings().selectedProvider;
}

/**
 * Set the selected AI provider
 * @param {string} providerId - Provider ID
 * @returns {boolean} Success status
 */
export function setSelectedProviderId(providerId) {
    return setSelectedProvider(providerId);
}

/**
 * Set API key for a provider
 * @param {string} providerId - Provider ID
 * @param {string} apiKey - API key
 * @returns {boolean} Success status
 */
export function saveApiKey(providerId, apiKey) {
    return setApiKey(providerId, apiKey);
}

/**
 * Remove API key for a provider
 * @param {string} providerId - Provider ID
 * @returns {boolean} Success status
 */
export function clearApiKey(providerId) {
    return removeApiKey(providerId);
}

/**
 * Quick analysis for real-time feedback (non-AI, fast)
 */
export function quickAnalyze(text, questionType) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Determine target words based on question type
    const isTask1 = questionType.startsWith('task1') ||
                   ['bar-chart', 'line-graph', 'pie-chart', 'table', 'process', 'map'].includes(questionType);
    const targetWords = isTask1 ? 150 : 250;

    const linkingCount = countLinkingWords(text);
    const academicCount = countAcademicWords(text);
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;

    return {
        wordCount,
        targetWords,
        progress: Math.min((wordCount / targetWords) * 100, 100),
        linkingWords: linkingCount,
        academicWords: academicCount,
        uniqueWords: uniqueWords,
        varietyRatio: uniqueWords / Math.max(wordCount, 1),
        hasIntroduction: /\b(this essay|this report|i will|the following)\b/i.test(text),
        hasConclusion: /\b(in conclusion|to conclude|in summary|to sum up|overall)\b/i.test(text),
        paragraphs: text.split(/\n\n+/).filter(p => p.trim().length > 0).length
    };
}

/**
 * Count linking words in text
 */
function countLinkingWords(text) {
    const linkingWords = [
        'furthermore', 'moreover', 'in addition', 'additionally', 'also', 'besides',
        'however', 'nevertheless', 'on the other hand', 'in contrast', 'conversely',
        'therefore', 'consequently', 'as a result', 'thus', 'hence',
        'firstly', 'secondly', 'finally', 'to begin with', 'next', 'then',
        'for instance', 'for example', 'such as', 'namely',
        'in conclusion', 'to conclude', 'in summary', 'to sum up', 'overall'
    ];

    const lowerText = text.toLowerCase();
    let count = 0;

    linkingWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) count += matches.length;
    });

    return count;
}

/**
 * Count academic vocabulary words
 */
function countAcademicWords(text) {
    const academicVocabulary = [
        'significant', 'considerable', 'substantial', 'demonstrate', 'illustrate', 'indicate',
        'suggest', 'reveal', 'highlight', 'emphasize', 'furthermore', 'moreover', 'consequently',
        'therefore', 'however', 'nevertheless', 'nonetheless', 'perspective', 'viewpoint',
        'argument', 'factor', 'aspect', 'element', 'component', 'trend', 'pattern', 'fluctuation',
        'increase', 'decrease', 'decline', 'rise', 'fall', 'remain', 'stable', 'constant',
        'proportion', 'percentage', 'figure', 'number', 'amount', 'quantity', 'approximately',
        'roughly', 'nearly', 'just over', 'just under', 'significantly', 'dramatically', 'gradually',
        'steadily', 'sharply', 'slightly', 'marginally', 'overall', 'in general', 'on average',
        'respectively', 'whereas', 'while', 'unlike', 'similarly', 'likewise',
        'compared to', 'in comparison with', 'by contrast', 'conversely', 'alternatively',
        'argue', 'claim', 'state', 'suggest', 'maintain', 'contend', 'assert', 'propose',
        'believe', 'consider', 'regard', 'view', 'perceive', 'observe', 'notice', 'recognize',
        'affect', 'influence', 'impact', 'effect', 'consequence', 'result', 'outcome',
        'cause', 'lead to', 'result in', 'bring about', 'give rise to', 'contribute to',
        'address', 'tackle', 'deal with', 'handle', 'manage', 'approach',
        'implement', 'execute', 'carry out', 'perform', 'conduct', 'undertake',
        'essential', 'crucial', 'vital', 'important', 'significant', 'critical', 'key',
        'beneficial', 'advantageous', 'positive', 'favorable', 'detrimental', 'harmful',
        'negative', 'adverse', 'drawback', 'disadvantage', 'limitation', 'weakness',
        'improve', 'enhance', 'boost', 'increase', 'raise', 'elevate', 'strengthen',
        'reduce', 'decrease', 'lower', 'minimize', 'mitigate', 'alleviate', 'diminish'
    ];

    const lowerText = text.toLowerCase();
    let count = 0;

    academicVocabulary.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) count += matches.length;
    });

    return count;
}
