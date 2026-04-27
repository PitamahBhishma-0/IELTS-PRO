/**
 * Gemini Provider
 * Uses Google Gemini API for IELTS analysis
 */

import { BaseAIProvider } from './baseProvider.js';

export class GeminiProvider extends BaseAIProvider {
    constructor(config) {
        super(config);
        this.model = config.model || 'gemini-2.5-flash';
        this.maxTokens = config.maxTokens || 10000;
    }

    getId() {
        return 'gemini';
    }

    getDisplayName() {
        return 'Gemini (Google)';
    }

    validateConfig() {
        return !!this.config.apiKey;
    }

    async analyze(text, questionType, question) {
        if (!this.validateConfig()) {
            throw new Error('Gemini API key is required');
        }

        const targetWords = this.getTargetWords(questionType);
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        const prompt = this.buildPrompt(text, questionType, question, wordCount, targetWords);

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.config.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: prompt
                                    }
                                ]
                            }
                        ],
                        generationConfig: {
                            maxOutputTokens: this.maxTokens,
                            temperature: 0.3
                        }
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                // Check for authentication errors
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Invalid API key. Please check your Gemini API key.');
                }
                throw new Error(error.error?.message || 'Gemini API request failed');
            }

            const data = await response.json();
            const content = data.candidates[0].content.parts[0].text;
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
            console.error('Gemini Analysis Error:', error);
            throw error;
        }
    }
}
