/**
 * OpenRouter AI Provider
 * Uses OpenRouter API for IELTS analysis with access to multiple models
 */

import { BaseAIProvider } from './baseProvider.js';

export class OpenRouterProvider extends BaseAIProvider {
    constructor(config) {
        super(config);
        this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.model = config.model || 'openrouter/free';
        this.maxTokens = config.maxTokens || 4096;
    }

    getId() {
        return 'openrouter';
    }

    getDisplayName() {
        return 'OpenRouter';
    }

    validateConfig() {
        return !!this.config.apiKey;
    }

    async analyze(text, questionType, question) {
        if (!this.validateConfig()) {
            throw new Error('OpenRouter API key is required');
        }

        const targetWords = this.getTargetWords(questionType);
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        const prompt = this.buildPrompt(text, questionType, question, wordCount, targetWords);

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'IELTS Writing Pro'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: this.maxTokens,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const error = await response.json();
                // Check for authentication errors
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Invalid API key. Please check your OpenRouter API key.');
                }
                throw new Error(error.error?.message || 'OpenRouter API request failed');
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            const analysis = this.parseResponse(content);
            const stats = this.calculateStats(text, targetWords);

            return {
                overall: analysis.overall,
                taskResponse: analysis.taskResponse,
                coherence: analysis.coherence,
                vocabulary: analysis.vocabulary,
                grammar: analysis.grammar,
                wordCount: stats.wordCount,
                sentenceCount: stats.sentenceCount,
                paragraphCount: stats.paragraphCount,
                feedback: analysis.feedback,
                details: stats
            };
        } catch (error) {
            console.error('OpenRouter Analysis Error:', error);
            throw error;
        }
    }
}
