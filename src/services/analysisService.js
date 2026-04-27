/**
 * Analysis Service
 * Provides real-time analysis of IELTS writing answers
 */

// IELTS Band Descriptors Reference
const BAND_DESCRIPTORS = {
    taskResponse: {
        9: 'Fully addresses all parts of the task with a fully developed position',
        8: 'Sufficiently addresses all parts of the task with a well-developed position',
        7: 'Addresses all parts of the task with a clear position throughout',
        6: 'Addresses all parts of the task though some parts may be more fully covered',
        5: 'Addresses the task only partially; position may be unclear',
        4: 'Responds to the task only in a minimal way',
        3: 'Does not address the task or has minimal response',
        2: 'Barely responds to the task',
        1: 'No response'
    },
    coherence: {
        9: 'Uses cohesion in such a way that it attracts no attention',
        8: 'Skillfully manages paragraphing with logical progression',
        7: 'Logically organizes information with clear paragraphing',
        6: 'Arranges information coherently with clear paragraphing',
        5: 'Presents information with some organization but may lack overall progression',
        4: 'Presents information but not always coherently',
        3: 'Does not organize ideas logically',
        2: 'Very limited control of organizational features',
        1: 'No organization'
    },
    vocabulary: {
        9: 'Uses a wide range of vocabulary with very natural and sophisticated control',
        8: 'Uses a wide range of vocabulary fluently and flexibly',
        7: 'Uses a sufficient range of vocabulary with some precision',
        6: 'Uses an adequate range of vocabulary for the task',
        5: 'Uses a limited range of vocabulary but minimally adequate for task',
        4: 'Uses only basic vocabulary which may be used repetitively',
        3: 'Uses only a very limited range of words',
        2: 'Uses an extremely limited range of vocabulary',
        1: 'No vocabulary'
    },
    grammar: {
        9: 'Uses a wide range of structures with full flexibility and accuracy',
        8: 'Uses a wide range of structures with frequent error-free sentences',
        7: 'Uses a variety of complex structures with good control',
        6: 'Uses a mix of simple and complex sentence forms',
        5: 'Uses only a limited range of structures with attempts at complex sentences',
        4: 'Uses only a very limited range of structures',
        3: 'Produces very few sentences that are error-free',
        2: 'Uses sentence forms with very limited control',
        1: 'No grammar'
    }
};

// Linking words for coherence analysis
const LINKING_WORDS = {
    addition: ['furthermore', 'moreover', 'in addition', 'additionally', 'also', 'besides', 'what\'s more'],
    contrast: ['however', 'nevertheless', 'on the other hand', 'in contrast', 'conversely', 'although', 'despite', 'whereas'],
    cause: ['therefore', 'consequently', 'as a result', 'thus', 'hence', 'for this reason'],
    sequence: ['firstly', 'secondly', 'finally', 'to begin with', 'next', 'then', 'lastly'],
    example: ['for instance', 'for example', 'such as', 'namely', 'to illustrate'],
    conclusion: ['in conclusion', 'to conclude', 'in summary', 'to sum up', 'overall', 'ultimately']
};

// Academic vocabulary for lexical resource analysis
const ACADEMIC_VOCABULARY = [
    'significant', 'considerable', 'substantial', 'demonstrate', 'illustrate', 'indicate',
    'suggest', 'reveal', 'highlight', 'emphasize', 'furthermore', 'moreover', 'consequently',
    'therefore', 'however', 'nevertheless', 'nonetheless', 'perspective', 'viewpoint',
    'argument', 'factor', 'aspect', 'element', 'component', 'trend', 'pattern', 'fluctuation',
    'increase', 'decrease', 'decline', 'rise', 'fall', 'remain', 'stable', 'constant',
    'proportion', 'percentage', 'figure', 'number', 'amount', 'quantity', 'approximately',
    'roughly', 'nearly', 'just over', 'just under', 'significantly', 'dramatically', 'gradually',
    'steadily', 'sharply', 'slightly', 'marginally', 'overall', 'in general', 'on average',
    'respectively', 'respectively', 'whereas', 'while', 'unlike', 'similarly', 'likewise',
    'compared to', 'in comparison with', 'by contrast', 'conversely', 'alternatively',
    'moreover', 'furthermore', 'in addition', 'additionally', 'besides', 'also',
    'nevertheless', 'nonetheless', 'however', 'although', 'despite', 'in spite of',
    'therefore', 'thus', 'consequently', 'as a result', 'hence', 'accordingly',
    'firstly', 'secondly', 'thirdly', 'finally', 'lastly', 'to begin with', 'to start with',
    'in conclusion', 'to conclude', 'in summary', 'to sum up', 'overall', 'in brief',
    'for example', 'for instance', 'such as', 'including', 'namely', 'specifically',
    'argue', 'claim', 'state', 'suggest', 'maintain', 'contend', 'assert', 'propose',
    'believe', 'consider', 'regard', 'view', 'perceive', 'observe', 'notice', 'recognize',
    'affect', 'influence', 'impact', 'effect', 'consequence', 'result', 'outcome',
    'cause', 'lead to', 'result in', 'bring about', 'give rise to', 'contribute to',
    'address', 'tackle', 'deal with', 'handle', 'manage', 'approach', 'tackle',
    'implement', 'execute', 'carry out', 'perform', 'conduct', 'undertake',
    'essential', 'crucial', 'vital', 'important', 'significant', 'critical', 'key',
    'beneficial', 'advantageous', 'positive', 'favorable', 'detrimental', 'harmful',
    'negative', 'adverse', 'drawback', 'disadvantage', 'limitation', 'weakness',
    'improve', 'enhance', 'boost', 'increase', 'raise', 'elevate', 'strengthen',
    'reduce', 'decrease', 'lower', 'minimize', 'mitigate', 'alleviate', 'diminish'
];

// Common grammar patterns to check
const GRAMMAR_PATTERNS = {
    passiveVoice: /\b(is|are|was|were|been|being)\s+\w+ed\b/gi,
    complexSentences: /\b(although|because|since|while|whereas|if|unless|when|whenever|where|wherever|after|before|until|as|provided that|even though|despite)\b/gi,
    relativeClauses: /\b(which|who|whom|whose|that)\b/gi,
    conditionals: /\b(if|unless|provided that|as long as|in case)\b/gi,
    modals: /\b(can|could|may|might|must|should|would|will|shall|ought to)\b/gi
};

/**
 * Analyze text and return comprehensive IELTS band scores
 *
 * @param {string} text - The text to analyze
 * @param {string} questionType - Question type (e.g., 'task1', 'task2', 'bar-chart', 'line-graph', 'pie-chart', 'table', 'process', 'map', 'opinion', 'discussion', 'problem-solution', 'advantage-disadvantage', 'two-part')
 * @param {Object} question - The question object
 * @returns {Object} Analysis results with scores and feedback
 */
export function analyzeText(text, questionType, question) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Determine target words based on question type
    const isTask1 = questionType.startsWith('task1') ||
                   ['bar-chart', 'line-graph', 'pie-chart', 'table', 'process', 'map'].includes(questionType);
    const targetWords = isTask1 ? 150 : 250;
    const task = isTask1 ? 1 : 2;

    // Calculate individual scores
    const taskResponseScore = calculateTaskResponseScore(text, wordCount, targetWords, task, question);
    const coherenceScore = calculateCoherenceScore(text, sentences, paragraphs, task);
    const vocabularyScore = calculateVocabularyScore(text, words, wordCount);
    const grammarScore = calculateGrammarScore(text, sentences, words);

    const overallScore = calculateOverallScore(
        taskResponseScore,
        coherenceScore,
        vocabularyScore,
        grammarScore
    );

    return {
        overall: overallScore,
        taskResponse: taskResponseScore,
        coherence: coherenceScore,
        vocabulary: vocabularyScore,
        grammar: grammarScore,
        wordCount: wordCount,
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length,
        feedback: generateFeedback({
            overall: overallScore,
            taskResponse: taskResponseScore,
            coherence: coherenceScore,
            vocabulary: vocabularyScore,
            grammar: grammarScore
        }, wordCount, targetWords, task),
        details: {
            wordCount: wordCount,
            targetWords: targetWords,
            sentenceCount: sentences.length,
            paragraphCount: paragraphs.length,
            avgWordsPerSentence: wordCount / Math.max(sentences.length, 1),
            linkingWordsUsed: countLinkingWords(text),
            academicWordsUsed: countAcademicWords(text),
            uniqueWords: new Set(words.map(w => w.toLowerCase())).size
        }
    };
}

/**
 * Calculate Task Response score
 */
function calculateTaskResponseScore(text, wordCount, targetWords, task, question) {
    let score = 5.0;

    // Word count impact
    if (wordCount >= targetWords) {
        score += 1.5;
    } else if (wordCount >= targetWords * 0.8) {
        score += 0.5;
    } else if (wordCount < targetWords * 0.5) {
        score -= 1.0;
    }

    // Check for structure elements
    const lowerText = text.toLowerCase();

    // Introduction indicators
    const hasIntro = lowerText.includes('this essay') ||
                     lowerText.includes('i will') ||
                     lowerText.includes('the following') ||
                     lowerText.includes('this report');

    // Conclusion indicators
    const hasConclusion = lowerText.includes('in conclusion') ||
                         lowerText.includes('to conclude') ||
                         lowerText.includes('in summary') ||
                         lowerText.includes('to sum up') ||
                         lowerText.includes('overall');

    // Body paragraph indicators
    const hasBody = paragraphs => paragraphs.length >= 2;

    if (hasIntro && hasConclusion && hasBody) {
        score += 1.0;
    } else if ((hasIntro || hasConclusion) && hasBody) {
        score += 0.5;
    }

    // Check for position/opinion (Task 2)
    if (task === 2) {
        const hasPosition = lowerText.includes('i believe') ||
                           lowerText.includes('i agree') ||
                           lowerText.includes('i disagree') ||
                           lowerText.includes('in my opinion') ||
                           lowerText.includes('from my perspective');

        if (hasPosition) {
            score += 0.5;
        }
    }

    // Check for data description (Task 1)
    if (task === 1) {
        const hasNumbers = /\d+/.test(text);
        const hasDataWords = lowerText.includes('percent') ||
                            lowerText.includes('figure') ||
                            lowerText.includes('number') ||
                            lowerText.includes('increase') ||
                            lowerText.includes('decrease');

        if (hasNumbers && hasDataWords) {
            score += 0.5;
        }
    }

    return Math.min(9, Math.max(1, Math.round(score * 10) / 10));
}

/**
 * Calculate Coherence & Cohesion score
 */
function calculateCoherenceScore(text, sentences, paragraphs, task) {
    let score = 5.0;

    // Paragraph structure
    const expectedParagraphs = task === 1 ? 3 : 4;
    if (paragraphs.length >= expectedParagraphs) {
        score += 1.5;
    } else if (paragraphs.length >= expectedParagraphs - 1) {
        score += 1.0;
    } else if (paragraphs.length >= 2) {
        score += 0.5;
    }

    // Linking words
    const linkingCount = countLinkingWords(text);
    if (linkingCount >= 5) {
        score += 1.0;
    } else if (linkingCount >= 3) {
        score += 0.5;
    }

    // Check for variety of linking words
    const linkingVariety = countLinkingWordVariety(text);
    if (linkingVariety >= 3) {
        score += 0.5;
    }

    // Sentence length variety
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const hasVariety = sentenceLengths.some(l => Math.abs(l - avgLength) > avgLength * 0.5);

    if (hasVariety) {
        score += 0.5;
    }

    return Math.min(9, Math.max(1, Math.round(score * 10) / 10));
}

/**
 * Calculate Lexical Resource score
 */
function calculateVocabularyScore(text, words, wordCount) {
    let score = 5.0;

    // Academic vocabulary
    const academicCount = countAcademicWords(text);
    const academicRatio = academicCount / Math.max(wordCount, 1);

    if (academicRatio >= 0.15) {
        score += 1.5;
    } else if (academicRatio >= 0.10) {
        score += 1.0;
    } else if (academicRatio >= 0.05) {
        score += 0.5;
    }

    // Vocabulary variety (unique words ratio)
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const varietyRatio = uniqueWords / Math.max(wordCount, 1);

    if (varietyRatio >= 0.7) {
        score += 1.0;
    } else if (varietyRatio >= 0.6) {
        score += 0.5;
    }

    // Check for repetition
    const wordFrequency = {};
    words.forEach(w => {
        const lower = w.toLowerCase();
        wordFrequency[lower] = (wordFrequency[lower] || 0) + 1;
    });

    const maxFrequency = Math.max(...Object.values(wordFrequency));
    if (maxFrequency <= 3) {
        score += 0.5;
    } else if (maxFrequency <= 5) {
        score += 0.25;
    }

    // Check for collocations and phrases
    const hasCollocations = /\b(in order to|as well as|a wide range of|a number of|due to|in terms of|with regard to)\b/i.test(text);
    if (hasCollocations) {
        score += 0.5;
    }

    return Math.min(9, Math.max(1, Math.round(score * 10) / 10));
}

/**
 * Calculate Grammatical Range & Accuracy score
 */
function calculateGrammarScore(text, sentences, words) {
    let score = 5.0;

    if (sentences.length === 0) return 1.0;

    // Complex structures
    const hasComplex = GRAMMAR_PATTERNS.complexSentences.test(text);
    const hasPassive = GRAMMAR_PATTERNS.passiveVoice.test(text);
    const hasRelative = GRAMMAR_PATTERNS.relativeClauses.test(text);
    const hasConditionals = GRAMMAR_PATTERNS.conditionals.test(text);
    const hasModals = GRAMMAR_PATTERNS.modals.test(text);

    const complexCount = [hasComplex, hasPassive, hasRelative, hasConditionals, hasModals].filter(Boolean).length;

    if (complexCount >= 4) {
        score += 2.0;
    } else if (complexCount >= 3) {
        score += 1.5;
    } else if (complexCount >= 2) {
        score += 1.0;
    } else if (complexCount >= 1) {
        score += 0.5;
    }

    // Sentence variety
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const hasLongSentences = sentenceLengths.some(l => l > avgLength * 1.5);
    const hasShortSentences = sentenceLengths.some(l => l < avgLength * 0.7);

    if (hasLongSentences && hasShortSentences) {
        score += 0.5;
    }

    // Basic error checking (simplified)
    const hasBasicErrors = /\b(i\b|im\b|dont\b|cant\b|wont\b|wouldnt\b|shouldnt\b|couldnt\b)\b/i.test(text);
    if (!hasBasicErrors) {
        score += 0.5;
    }

    // Punctuation check
    const hasProperPunctuation = /[.!?]\s+[A-Z]/.test(text);
    if (hasProperPunctuation) {
        score += 0.5;
    }

    return Math.min(9, Math.max(1, Math.round(score * 10) / 10));
}

/**
 * Calculate overall score
 */
function calculateOverallScore(taskResponse, coherence, vocabulary, grammar) {
    return Math.round(((taskResponse + coherence + vocabulary + grammar) / 4) * 10) / 10;
}

/**
 * Count linking words in text
 */
function countLinkingWords(text) {
    const lowerText = text.toLowerCase();
    let count = 0;

    Object.values(LINKING_WORDS).forEach(words => {
        words.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = lowerText.match(regex);
            if (matches) count += matches.length;
        });
    });

    return count;
}

/**
 * Count variety of linking word categories used
 */
function countLinkingWordVariety(text) {
    const lowerText = text.toLowerCase();
    let categoriesUsed = 0;

    Object.entries(LINKING_WORDS).forEach(([category, words]) => {
        const hasCategory = words.some(word => lowerText.includes(word));
        if (hasCategory) categoriesUsed++;
    });

    return categoriesUsed;
}

/**
 * Count academic vocabulary words
 */
function countAcademicWords(text) {
    const lowerText = text.toLowerCase();
    let count = 0;

    ACADEMIC_VOCABULARY.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) count += matches.length;
    });

    return count;
}

/**
 * Generate detailed feedback
 */
function generateFeedback(scores, wordCount, targetWords, task) {
    const feedback = {
        overall: '',
        taskResponse: '',
        coherence: '',
        vocabulary: '',
        grammar: '',
        suggestions: []
    };

    // Overall feedback
    if (scores.overall >= 7) {
        feedback.overall = 'Excellent work! You\'re demonstrating strong writing skills suitable for Band 7+. Continue practicing to maintain and improve this level.';
    } else if (scores.overall >= 6) {
        feedback.overall = 'Good effort! You\'re at Band 6 level. Focus on the areas highlighted below to reach Band 7.';
    } else if (scores.overall >= 5) {
        feedback.overall = 'You\'re making progress. Review the feedback below and work on improving the identified areas.';
    } else {
        feedback.overall = 'Keep practicing! Review the templates and focus on improving the highlighted areas.';
    }

    // Task Response feedback
    if (scores.taskResponse >= 7) {
        feedback.taskResponse = 'Strong task response. You have addressed all parts of the question well and developed your ideas effectively.';
    } else if (scores.taskResponse >= 6) {
        feedback.taskResponse = 'Good task response. You have addressed the question, but could develop your ideas further with more specific examples.';
    } else if (scores.taskResponse >= 5) {
        feedback.taskResponse = 'Adequate task response. Address all parts of the question more fully and provide more developed arguments.';
    } else {
        feedback.taskResponse = 'Task response needs improvement. Make sure to address all parts of the question and develop your ideas more thoroughly.';
    }

    // Word count specific feedback
    if (wordCount < targetWords * 0.8) {
        feedback.taskResponse += ` Your word count (${wordCount}) is below the recommended minimum (${targetWords}). Aim to write more to fully develop your ideas.`;
        feedback.suggestions.push('Increase your word count by expanding on your main points with more detailed explanations and examples.');
    }

    // Coherence feedback
    if (scores.coherence >= 7) {
        feedback.coherence = 'Excellent coherence. Your writing is well-organized with clear paragraphing and effective use of linking words.';
    } else if (scores.coherence >= 6) {
        feedback.coherence = 'Good coherence. Your writing is organized, but could benefit from more varied linking words and clearer paragraph transitions.';
    } else {
        feedback.coherence = 'Coherence needs improvement. Work on paragraph structure and using a wider variety of linking words to connect your ideas.';
        feedback.suggestions.push('Use more linking words (however, furthermore, therefore, etc.) to improve the flow between sentences and paragraphs.');
    }

    // Vocabulary feedback
    if (scores.vocabulary >= 7) {
        feedback.vocabulary = 'Strong vocabulary. You demonstrate a good range of vocabulary with some precise word choices appropriate for academic writing.';
    } else if (scores.vocabulary >= 6) {
        feedback.vocabulary = 'Adequate vocabulary. Try to use more varied and precise academic vocabulary to enhance your writing.';
    } else {
        feedback.vocabulary = 'Vocabulary needs improvement. Expand your vocabulary range and practice using more academic words and collocations.';
        feedback.suggestions.push('Expand your academic vocabulary by studying and using more sophisticated words appropriate for formal writing.');
    }

    // Grammar feedback
    if (scores.grammar >= 7) {
        feedback.grammar = 'Good grammar. You use a variety of sentence structures with good accuracy.';
    } else if (scores.grammar >= 6) {
        feedback.grammar = 'Adequate grammar. Try to use more complex sentence structures and ensure greater accuracy.';
    } else {
        feedback.grammar = 'Grammar needs work. Focus on sentence variety, complex structures, and improving accuracy.';
        feedback.suggestions.push('Practice using more complex sentence structures (relative clauses, conditionals, passive voice) to improve your grammatical range.');
    }

    return feedback;
}

/**
 * Get band descriptor text
 */
export function getBandDescriptor(criteria, band) {
    return BAND_DESCRIPTORS[criteria]?.[band] || '';
}

/**
 * Get quick analysis (for real-time feedback)
 *
 * @param {string} text - The text to analyze
 * @param {string} questionType - Question type (e.g., 'task1', 'task2', 'bar-chart', 'line-graph', 'pie-chart', 'table', 'process', 'map', 'opinion', 'discussion', 'problem-solution', 'advantage-disadvantage', 'two-part')
 * @returns {Object} Quick analysis results
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
