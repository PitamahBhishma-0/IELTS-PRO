/**
 * DeepSeek Provider
 * Uses DeepSeek API for IELTS analysis
 */

import { BaseAIProvider } from './baseProvider.js';

export class DeepSeekProvider extends BaseAIProvider {
    constructor(config) {
        super(config);
        this.baseUrl = 'https://api.deepseek.com/v1/chat/completions';
        this.model = config.model || 'deepseek-chat';
        this.maxTokens = config.maxTokens || 4096;
    }

    getId() {
        return 'deepseek';
    }

    getDisplayName() {
        return 'DeepSeek';
    }

    validateConfig() {
        return !!this.config.apiKey;
    }

    async analyze(text, questionType, question) {
        if (!this.validateConfig()) {
            throw new Error('DeepSeek API key is required');
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
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert IELTS examiner. Always respond with valid JSON only, no markdown formatting, no code blocks, no additional text whatsoever.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: this.maxTokens,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                const error = await response.json();
                // Check for authentication errors
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Invalid API key. Please check your DeepSeek API key.');
                }
                throw new Error(error.error?.message || 'DeepSeek API request failed');
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
            console.error('DeepSeek Analysis Error:', error);
            throw error;
        }
    }
}
