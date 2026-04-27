/**
 * Base AI Provider Interface
 * Abstract base class for all AI providers
 */

export class BaseAIProvider {
    constructor(config) {
        this.config = config;
    }

    /**
     * Analyze text and return IELTS band scores
     * @param {string} text - The text to analyze
     * @param {string} questionType - Question type
     * @param {Object} question - The question object
     * @returns {Promise<Object>} Analysis results
     */
    async analyze(text, questionType, question) {
        throw new Error('analyze() must be implemented by subclass');
    }

    /**
     * Validate provider configuration
     * @returns {boolean} True if config is valid
     */
    validateConfig() {
        throw new Error('validateConfig() must be implemented by subclass');
    }

    /**
     * Get human-readable display name
     * @returns {string} Display name
     */
    getDisplayName() {
        throw new Error('getDisplayName() must be implemented by subclass');
    }

    /**
     * Get unique provider identifier
     * @returns {string} Provider ID
     */
    getId() {
        throw new Error('getId() must be implemented by subclass');
    }

    /**
     * Build the analysis prompt
     * @param {string} text - The text to analyze
     * @param {string} questionType - Question type
     * @param {Object} question - Question object
     * @param {number} wordCount - Actual word count
     * @param {number} targetWords - Target word count
     * @returns {string} The prompt
     */
    buildPrompt(text, questionType, question, wordCount, targetWords) {
        let prompt = `You are an expert IELTS examiner. Analyze the following IELTS Academic Writing response and provide detailed feedback.

Task Type: ${questionType}
Question: ${question.question}
Target Word Count: ${targetWords}+ words
Actual Word Count: ${wordCount} words`;

        // Add chart data for Task 1 questions with dataPoints
        if (question.dataPoints) {
            prompt += `\n\nChart Data:\n${this.formatChartData(question.dataPoints, question.type)}`;
        }

        // Add data description for maps, process diagrams, etc.
        if (question.dataDescription) {
            prompt += `\n\nVisual Information:\n${question.dataDescription.trim()}`;
        }

        prompt += `

Student Response:
${text}

Please analyze this response according to IELTS band descriptors and provide:

1. Overall Band Score (1-9)
2. Task Response Score (1-9) with specific feedback
3. Coherence & Cohesion Score (1-9) with specific feedback
4. Lexical Resource Score (1-9) with specific feedback
5. Grammatical Range & Accuracy Score (1-9) with specific feedback

For each criterion, provide:
- A score from 1-9
- Specific feedback explaining the score
- Concrete suggestions for improvement

Also provide:
- Overall assessment (2-3 sentences)
- 3-5 specific suggestions for improvement
- Key strengths to maintain

Format your response as JSON with this structure:
{
    "overall": 7.0,
    "taskResponse": 7.0,
    "coherence": 6.5,
    "vocabulary": 7.0,
    "grammar": 6.5,
    "feedback": {
        "overall": "Overall assessment text...",
        "taskResponse": "Task response feedback...",
        "coherence": "Coherence feedback...",
        "vocabulary": "Vocabulary feedback...",
        "grammar": "Grammar feedback...",
        "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
    }
}

Return ONLY the raw JSON object, no markdown formatting, no code blocks, no additional text whatsoever. Your response must start with { and end with }.`;

        return prompt;
    }

    /**
     * Format chart data for AI prompt
     * @param {Object} dataPoints - Data points from question
     * @param {string} type - Question type
     * @returns {string} Formatted chart data
     */
    formatChartData(dataPoints, type) {
        let data = '';

        if (dataPoints.series) {
            data += `Time Period: ${dataPoints.labels.join(' → ')}\n`;
            data += `Data Series:\n`;
            dataPoints.series.forEach(s => {
                data += `  - ${s.name}: ${s.values.join(', ')}\n`;
            });
        } else if (dataPoints.values) {
            data += `Categories: ${dataPoints.labels.join(', ')}\n`;
            data += `Values: ${dataPoints.values.join(', ')}\n`;
        } else if (dataPoints.year1995 && dataPoints.year2005) {
            data += `1995 Data: ${JSON.stringify(dataPoints.year1995)}\n`;
            data += `2005 Data: ${JSON.stringify(dataPoints.year2005)}\n`;
        } else if (dataPoints.categories && dataPoints.countryA && dataPoints.countryB) {
            data += `Categories: ${dataPoints.categories.join(', ')}\n`;
            data += `Country A (%): ${dataPoints.countryA.join(', ')}\n`;
            data += `Country B (%): ${dataPoints.countryB.join(', ')}\n`;
        } else if (dataPoints.months) {
            data += `Months: ${dataPoints.months.join(', ')}\n`;
            data += `London Temperature (°C): ${dataPoints.londonTemp.join(', ')}\n`;
            data += `Sydney Temperature (°C): ${dataPoints.sydneyTemp.join(', ')}\n`;
            data += `London Rainfall (mm): ${dataPoints.londonRain.join(', ')}\n`;
            data += `Sydney Rainfall (mm): ${dataPoints.sydneyRain.join(', ')}\n`;
        } else if (dataPoints.globalShare && dataPoints.trends) {
            data += `Global Share (%): ${JSON.stringify(dataPoints.globalShare)}\n`;
            data += `Production Trends:\n`;
            Object.entries(dataPoints.trends).forEach(([country, values]) => {
                data += `  - ${country}: ${values.join(', ')}\n`;
            });
        }

        return data;
    }

    /**
     * Parse the AI response
     * @param {string} content - Raw response content
     * @returns {Object} Parsed analysis
     */
    parseResponse(content) {
        try {
            // First, try to parse directly
            return JSON.parse(content);
        } catch (error) {
            // If that fails, try to extract JSON from markdown code blocks
            try {
                // Match JSON in markdown code blocks: ```json ... ``` or ``` ... ```
                const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (jsonMatch && jsonMatch[1]) {
                    return JSON.parse(jsonMatch[1]);
                }

                // Try to find JSON object in the content
                const objectMatch = content.match(/\{[\s\S]*\}/);
                if (objectMatch) {
                    return JSON.parse(objectMatch[0]);
                }

                throw new Error('Failed to parse AI response as JSON');
            } catch (parseError) {
                console.error('Parse error details:', parseError);
                throw new Error('Failed to parse AI response as JSON');
            }
        }
    }

    /**
     * Calculate text statistics
     * @param {string} text - The text
     * @param {number} targetWords - Target word count
     * @returns {Object} Statistics
     */
    calculateStats(text, targetWords) {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

        return {
            wordCount,
            sentenceCount: sentences.length,
            paragraphCount: paragraphs.length,
            targetWords,
            avgWordsPerSentence: wordCount / Math.max(sentences.length, 1),
            linkingWordsUsed: this.countLinkingWords(text),
            academicWordsUsed: this.countAcademicWords(text),
            uniqueWords: new Set(words.map(w => w.toLowerCase())).size
        };
    }

    /**
     * Count linking words in text
     * @param {string} text - The text
     * @returns {number} Count
     */
    countLinkingWords(text) {
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
     * @param {string} text - The text
     * @returns {number} Count
     */
    countAcademicWords(text) {
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

    /**
     * Determine target words based on question type
     * @param {string} questionType - Question type
     * @returns {number} Target word count
     */
    getTargetWords(questionType) {
        const isTask1 = questionType.startsWith('task1') ||
                       ['bar-chart', 'line-graph', 'pie-chart', 'table', 'process', 'map'].includes(questionType);
        return isTask1 ? 150 : 250;
    }
}
