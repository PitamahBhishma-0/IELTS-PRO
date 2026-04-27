/**
 * Claude AI Provider
 * Uses Anthropic Claude API for IELTS analysis
 */

import { BaseAIProvider } from './baseProvider.js';

export class ClaudeProvider extends BaseAIProvider {
    constructor(config) {
        super(config);
        this.baseUrl = 'https://api.anthropic.com/v1/messages';
        this.model = config.model || 'claude-3-5-sonnet-20241022';
        this.maxTokens = config.maxTokens || 4096;
    }

    getId() {
        return 'claude';
    }

    getDisplayName() {
        return 'Claude (Anthropic)';
    }

    validateConfig() {
        return !!this.config.apiKey;
    }

    async analyze(text, questionType, question) {
        if (!this.validateConfig()) {
            throw new Error('Claude API key is required');
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
                    'x-api-key': this.config.apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: this.maxTokens,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                // Check for authentication errors
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Invalid API key. Please check your Claude API key.');
                }
                throw new Error(error.error?.message || 'Claude API request failed');
            }

            const data = await response.json();
            const content = data.content[0].text;
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
            console.error('Claude Analysis Error:', error);
            throw error;
        }
    }
}
