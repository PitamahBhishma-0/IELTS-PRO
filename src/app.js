/**
 * IELTS Writing Pro - Main Application
 * IELTS Academic writing practice application
 */

import { debounce } from './utils/debounce.js';
import { getStorage, setStorage } from './utils/storage.js';
import { getQuestion } from './services/questionService.js';
import { analyzeText, quickAnalyze } from './services/analysisService.js';
import { analyzeTextWithAI, getAvailableProviders, getSelectedProvider, setSelectedProviderId, saveApiKey, clearApiKey } from './services/aiAnalysisService.js';
import { renderChart, supportsChart, hasDataDescription } from './services/chartRenderer.js';

// ============================================
// Application State
// ============================================

const state = {
    currentTask: 1,
    currentQuestion: null,
    timer: {
        interval: null,
        running: false,
        remaining: 20 * 60 // 20 minutes for Task 1
    },
    history: [],
    currentView: 'practice',
    isAnalyzing: false,
    useAIAnalysis: true, // Default to AI analysis
    showQuestionType: false, // Default to hide question type
    pendingModeSwitch: false // Track pending mode switch
};

// ============================================
// DOM Elements Cache
// ============================================

const elements = {
    // Navigation
    navButtons: document.querySelectorAll('.nav-btn'),
    views: {
        practice: document.getElementById('view-practice'),
        learning: document.getElementById('view-learning'),
        history: document.getElementById('view-history')
    },

    // Task Selector
    taskButtons: document.querySelectorAll('.task-card'),

    // Timer
    timerDisplay: document.getElementById('timer'),
    startTimerBtn: document.getElementById('startTimerBtn'),
    resetTimerBtn: document.getElementById('resetTimerBtn'),

    // Question
    questionType: document.getElementById('questionType'),
    questionText: document.getElementById('questionText'),
    questionImage: document.getElementById('questionImage'),
    questionImageEl: document.getElementById('questionImageEl'),
    questionImageCaption: document.getElementById('questionImageCaption'),
    questionChart: document.getElementById('questionChart'),
    questionChartCanvas: document.getElementById('questionChartCanvas'),
    questionChartCaption: document.getElementById('questionChartCaption'),
    dataDescription: document.getElementById('dataDescription'),
    dataDescriptionText: document.getElementById('dataDescriptionText'),
    generateBtn: document.getElementById('generateBtn'),
    toggleQuestionTypeBtn: document.getElementById('toggleQuestionTypeBtn'),
    toggleQuestionTypeText: document.getElementById('toggleQuestionTypeText'),

    // Answer
    answerArea: document.getElementById('answerArea'),
    wordCount: document.getElementById('wordCount'),
    targetWords: document.getElementById('targetWords'),
    progressFill: document.getElementById('progressFill'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    toggleAnalysisBtn: document.getElementById('toggleAnalysisBtn'),
    analysisModeText: document.getElementById('analysisModeText'),
    clearBtn: document.getElementById('clearBtn'),

    // Analysis
    analysisPanel: document.getElementById('analysisPanel'),
    overallScore: document.getElementById('overallScore'),
    taskResponseScore: document.getElementById('taskResponseScore'),
    coherenceScore: document.getElementById('coherenceScore'),
    vocabularyScore: document.getElementById('vocabularyScore'),
    grammarScore: document.getElementById('grammarScore'),
    taskResponseBar: document.getElementById('taskResponseBar'),
    coherenceBar: document.getElementById('coherenceBar'),
    vocabularyBar: document.getElementById('vocabularyBar'),
    grammarBar: document.getElementById('grammarBar'),
    analysisFeedback: document.getElementById('analysisFeedback'),

    // History
    totalEssays: document.getElementById('totalEssays'),
    avgScore: document.getElementById('avgScore'),
    task1Count: document.getElementById('task1Count'),
    task2Count: document.getElementById('task2Count'),
    historyList: document.getElementById('historyList'),

    // Learning
    sidebarMenu: document.getElementById('sidebarMenu'),
    contentArea: document.getElementById('contentArea'),

    // Modal
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    modalCancel: document.getElementById('modalCancel'),
    modalConfirm: document.getElementById('modalConfirm'),

    // Settings Modal
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    providerSelect: document.getElementById('providerSelect'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    toggleKeyVisibility: document.getElementById('toggleKeyVisibility'),
    providerDescription: document.getElementById('providerDescription'),
    providerLink: document.getElementById('providerLink'),
    settingsSave: document.getElementById('settingsSave'),
    settingsCancel: document.getElementById('settingsCancel')
};

// ============================================
// Learning Content - Hierarchical Structure
// ============================================

const learningContent = {
    'Overview': `
        <h1>IELTS Academic Writing Overview</h1>
        <p>Welcome to your comprehensive IELTS Academic writing preparation guide. This learning mode contains everything you need to improve your writing score.</p>

        <h2>Academic Writing Test Structure</h2>
        <ul>
            <li><strong>Task 1:</strong> 20 minutes, 150+ words - Report on visual information</li>
            <li><strong>Task 2:</strong> 40 minutes, 250+ words - Academic essay</li>
            <li><strong>Total Time:</strong> 60 minutes</li>
        </ul>

        <h2>Scoring Criteria</h2>
        <ul>
            <li><strong>Task Response:</strong> Address all parts, position clear, ideas extended</li>
            <li><strong>Coherence & Cohesion:</strong> Logical organization, paragraphing, linking</li>
            <li><strong>Lexical Resource:</strong> Range of vocabulary, precision, collocations</li>
            <li><strong>Grammatical Range:</strong> Variety of structures, accuracy, punctuation</li>
        </ul>

        <h2>Band Score Requirements</h2>
        <table>
            <thead>
                <tr>
                    <th>Band</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>9</td>
                    <td>Expert User - Full command of the language</td>
                </tr>
                <tr>
                    <td>8</td>
                    <td>Very Good User - Fully operational command</td>
                </tr>
                <tr>
                    <td>7</td>
                    <td>Good User - Operational command with occasional inaccuracies</td>
                </tr>
                <tr>
                    <td>6</td>
                    <td>Competent User - Generally effective command</td>
                </tr>
                <tr>
                    <td>5</td>
                    <td>Modest User - Partial command, coping with overall meaning</td>
                </tr>
            </tbody>
        </table>
    `,
    // Task 1 - Hierarchical Structure
    'Task 1': {
        title: 'Task 1 Overview',
        content: `
            <h1>IELTS Academic Writing Task 1</h1>
            <p>Task 1 requires you to describe visual information in at least 150 words. You have 20 minutes to complete this task.</p>

            <h2>Task 1 Types Overview</h2>
            <p>IELTS Academic Task 1 requires you to describe visual information. The main types are:</p>
            <ul>
                <li><strong>Line Graph:</strong> Shows changes over time</li>
                <li><strong>Bar Chart:</strong> Compares values across categories</li>
                <li><strong>Pie Chart:</strong> Shows proportions/percentages</li>
                <li><strong>Table:</strong> Presents numerical data in rows/columns</li>
                <li><strong>Process Diagram:</strong> Shows how something works or is made</li>
                <li><strong>Map:</strong> Shows geographical changes over time</li>
            </ul>

            <h2>Structure Templates</h2>
            <h3>Introduction (20-30 words)</h3>
            <pre><code>The [graph/chart/table/diagram] illustrates [what it shows] over [time period] in [location].
Overall, [main trend 1] and [main trend 2].</code></pre>

            <h3>Overview (30-40 words)</h3>
            <pre><code>It is clear that [most significant trend].
[Second most significant observation].
[Third key observation].</code></pre>

            <h3>Body Paragraphs (50-60 words each)</h3>
            <pre><code>[Category A] showed [trend/pattern].
[Specific details with numbers].
For instance, [example].
[Comparison with other categories].</code></pre>

            <h2>Time Management (20 minutes)</h2>
            <ul>
                <li>Planning: 2 minutes</li>
                <li>Introduction: 3 minutes</li>
                <li>Body paragraphs: 12 minutes</li>
                <li>Review: 3 minutes</li>
            </ul>

            <h2>Quick Checklist Before Writing</h2>
            <ol>
                <li>Identify the task type</li>
                <li>Understand exactly what's being asked</li>
                <li>Plan 2-3 main points per paragraph</li>
                <li>Think of specific examples</li>
                <li>Note key vocabulary to use</li>
            </ol>

            <h2>Quick Checklist After Writing</h2>
            <ol>
                <li>Did I include an overview paragraph?</li>
                <li>Did I use specific data points?</li>
                <li>Are paragraphs clearly organized?</li>
                <li>Did I use varied sentence structures?</li>
                <li>Is the word count 150+?</li>
                <li>Check for spelling and grammar errors</li>
            </ol>
        `,
        children: {
            'Line Graph': {
                title: 'Line Graph',
                content: `
                    <h1>Task 1: Line Graph</h1>

                    <h2>What is a Line Graph?</h2>
                    <p>A line graph shows changes over time. It displays trends, patterns, and comparisons between different categories or groups.</p>

                    <h2>Key Vocabulary</h2>
                    <h3>Describing Trends</h3>
                    <ul>
                        <li><strong>Increasing:</strong> rise, increase, grow, climb, surge, soar, rocket</li>
                        <li><strong>Decreasing:</strong> fall, decrease, drop, decline, plummet, plunge, dive</li>
                        <li><strong>Stable:</strong> remain stable, stay constant, level off, plateau</li>
                        <li><strong>Fluctuating:</strong> fluctuate, vary, oscillate, undulate</li>
                    </ul>

                    <h3>Describing Speed/Intensity</h3>
                    <ul>
                        <li><strong>Fast:</strong> sharply, dramatically, significantly, substantially, rapidly</li>
                        <li><strong>Moderate:</strong> gradually, steadily, moderately, consistently</li>
                        <li><strong>Slow:</strong> slightly, marginally, minimally, negligibly</li>
                    </ul>

                    <h2>Structure Template</h2>

                    <h3>Introduction (20-30 words)</h3>
                    <pre><code>The line graph illustrates [what the graph shows] over [time period] in [location].
Overall, [main trend 1] and [main trend 2].</code></pre>

                    <h3>Overview (30-40 words)</h3>
                    <pre><code>It is clear that [most significant trend].
[Second most significant observation].
[Third key observation].</code></pre>

                    <h3>Body Paragraph 1 (50-60 words)</h3>
                    <pre><code>[Category A] showed [trend/pattern].
[Specific details with numbers].
For instance, [example].
[Comparison with other categories].</code></pre>

                    <h3>Body Paragraph 2 (50-60 words)</h3>
                    <pre><code>In contrast, [Category B] demonstrated [different trend].
[Specific details with numbers].
[Notable exception or detail].
[Final comparison].</code></pre>

                    <h2>Example Sentences</h2>
                    <ul>
                        <li>The number of visitors increased significantly from 2 million in 2010 to 5 million in 2015.</li>
                        <li>There was a dramatic rise in internet usage between 2007 and 2017.</li>
                        <li>The figure for X remained relatively stable throughout the period.</li>
                        <li>By contrast, Y showed a steady decline over the same period.</li>
                        <li>The proportion of people using smartphones surged from 20% to 75%.</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Include an overview paragraph summarizing main trends</li>
                        <li>Use a variety of vocabulary for describing changes</li>
                        <li>Include specific data points (numbers, percentages)</li>
                        <li>Make comparisons between different categories</li>
                        <li>Use appropriate time expressions (between X and Y, over the period, by 2010)</li>
                        <li>Avoid describing every detail - focus on significant features</li>
                    </ol>
                `
            },
            'Bar Chart': {
                title: 'Bar Chart',
                content: `
                    <h1>Task 1: Bar Chart</h1>

                    <h2>What is a Bar Chart?</h2>
                    <p>A bar chart displays data using rectangular bars. It's used to compare values across different categories or show changes over time.</p>

                    <h2>Key Vocabulary</h2>
                    <h3>Making Comparisons</h3>
                    <ul>
                        <li><strong>Higher:</strong> higher than, greater than, more than, exceeded, surpassed</li>
                        <li><strong>Lower:</strong> lower than, less than, fewer than, fell short of</li>
                        <li><strong>Equal:</strong> equal to, the same as, identical to, matched</li>
                        <li><strong>Ranking:</strong> the highest, the lowest, the most, the least, ranked first/last</li>
                    </ul>

                    <h3>Describing Differences</h3>
                    <ul>
                        <li><strong>Large difference:</strong> significantly, considerably, substantially, markedly</li>
                        <li><strong>Small difference:</strong> slightly, marginally, minimally, narrowly</li>
                        <li><strong>Comparison:</strong> compared to, in comparison with, whereas, while, unlike</li>
                    </ul>

                    <h2>Structure Template</h2>

                    <h3>Introduction (20-30 words)</h3>
                    <pre><code>The bar chart illustrates [what the chart shows] in [year/location].
Overall, [main comparison or pattern].</code></pre>

                    <h3>Overview (30-40 words)</h3>
                    <pre><code>It is clear that [highest category] had the [highest/lowest] figure.
[Second most significant observation].
[Third key observation].</code></pre>

                    <h3>Body Paragraph 1 (50-60 words)</h3>
                    <pre><code>[Category A] had the [highest/lowest] number of [item], at [figure].
[Comparison with Category B].
[Additional detail or trend].</code></pre>

                    <h3>Body Paragraph 2 (50-60 words)</h3>
                    <pre><code>By contrast, [Category C] showed [different pattern].
[Specific details with numbers].
[Notable comparison or exception].</code></pre>

                    <h2>Example Sentences</h2>
                    <ul>
                        <li>The British Museum had the highest number of visitors, at 5.9 million.</li>
                        <li>Visitors to the Tate Modern exceeded those to the National Gallery by 500,000.</li>
                        <li>The figure for Country A was significantly higher than that for Country B.</li>
                        <li>By contrast, Category D showed the lowest values throughout the period.</li>
                        <li>The number of students increased marginally from 1,200 to 1,250.</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Group data logically (e.g., highest together, lowest together)</li>
                        <li>Make comparisons between categories, not just descriptions</li>
                        <li>Use a variety of comparative language</li>
                        <li>Include specific figures to support your descriptions</li>
                        <li>Notice and describe any notable exceptions or patterns</li>
                        <li>Use appropriate prepositions (at, by, to, from)</li>
                    </ol>
                `
            },
            'Pie Chart': {
                title: 'Pie Chart',
                content: `
                    <h1>Task 1: Pie Chart</h1>

                    <h2>What is a Pie Chart?</h2>
                    <p>A pie chart shows proportions or percentages of a whole. It's used to compare parts of a whole or show changes in proportions over time.</p>

                    <h2>Key Vocabulary</h2>
                    <h3>Describing Proportions</h3>
                    <ul>
                        <li><strong>Large portion:</strong> the majority of, most of, a significant proportion of</li>
                        <li><strong>Small portion:</strong> a minority of, a small fraction of, a tiny proportion of</li>
                        <li><strong>Equal portions:</strong> equal shares, evenly distributed, split equally</li>
                        <li><strong>Half:</strong> half of, 50%, one in two</li>
                    </ul>

                    <h3>Describing Changes</h3>
                    <ul>
                        <li><strong>Increasing:</strong> increased to, rose to, grew to, expanded to</li>
                        <li><strong>Decreasing:</strong> decreased to, fell to, dropped to, declined to</li>
                        <li><strong>Staying same:</strong> remained at, stayed at, constant at</li>
                    </ul>

                    <h2>Structure Template</h2>

                    <h3>Introduction (20-30 words)</h3>
                    <pre><code>The pie charts show [what the charts show] in [year 1] and [year 2].
Overall, [main change or pattern].</code></pre>

                    <h3>Overview (30-40 words)</h3>
                    <pre><code>It is clear that [largest category] accounted for the [largest/smallest] proportion.
[Second most significant observation].
[Third key observation].</code></pre>

                    <h3>Body Paragraph 1 (50-60 words)</h3>
                    <pre><code>In [year 1], [Category A] made up the largest share at [percentage].
[Other categories in year 1].
[Comparison between categories].</code></pre>

                    <h3>Body Paragraph 2 (50-60 words)</h3>
                    <pre><code>By [year 2], [changes in proportions].
[Specific details with percentages].
[Notable increase or decrease].</code></pre>

                    <h2>Example Sentences</h2>
                    <ul>
                        <li>Coal accounted for the largest proportion of energy production in 1995, at 40%.</li>
                        <li>The majority of students chose science subjects, representing 55% of the total.</li>
                        <li>By contrast, renewable energy made up only 5% of the total.</li>
                        <li>The proportion of people using public transport increased from 30% to 45%.</li>
                        <li>There was a significant decrease in the share of coal, falling to 25%.</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Focus on the largest and smallest proportions</li>
                        <li>Compare proportions between different categories</li>
                        <li>Describe changes over time if comparing multiple pie charts</li>
                        <li>Use precise language for describing proportions</li>
                        <li>Group similar categories together</li>
                        <li>Avoid listing every percentage - focus on significant ones</li>
                    </ol>
                `
            },
            'Table': {
                title: 'Table',
                content: `
                    <h1>Task 1: Table</h1>

                    <h2>What is a Table?</h2>
                    <p>A table presents numerical data in rows and columns. It's used to compare values across different categories or show changes over time.</p>

                    <h2>Key Vocabulary</h2>
                    <h3>Making Comparisons</h3>
                    <ul>
                        <li><strong>Higher:</strong> higher than, greater than, more than, exceeded, surpassed</li>
                        <li><strong>Lower:</strong> lower than, less than, fewer than, fell short of</li>
                        <li><strong>Similar:</strong> similar to, comparable to, approximately the same as</li>
                        <li><strong>Different:</strong> different from, unlike, in contrast to</li>
                    </ul>

                    <h3>Describing Patterns</h3>
                    <ul>
                        <li><strong>Consistent:</strong> consistently, throughout, across all categories</li>
                        <li><strong>Variable:</strong> varied, ranged from X to Y, differed significantly</li>
                        <li><strong>Exception:</strong> the exception was, unlike others, notably</li>
                    </ul>

                    <h2>Structure Template</h2>

                    <h3>Introduction (20-30 words)</h3>
                    <pre><code>The table shows [what the table shows] in [context].
Overall, [main pattern or comparison].</code></pre>

                    <h3>Overview (30-40 words)</h3>
                    <pre><code>It is clear that [highest/lowest values].
[Second most significant observation].
[Third key observation].</code></pre>

                    <h3>Body Paragraph 1 (50-60 words)</h3>
                    <pre><code>[Category A] had the [highest/lowest] figure of [value].
[Comparison with other categories].
[Additional details or patterns].</code></pre>

                    <h3>Body Paragraph 2 (50-60 words)</h3>
                    <pre><code>In terms of [different aspect], [observations].
[Specific details with numbers].
[Notable comparisons or exceptions].</code></pre>

                    <h2>Example Sentences</h2>
                    <ul>
                        <li>Housing accounted for the highest percentage of expenditure in Country A, at 35%.</li>
                        <li>The figure for transport was significantly higher in Country B (20%) than in Country A (15%).</li>
                        <li>By contrast, savings represented a larger proportion in Country B (25% vs 20%).</li>
                        <li>Spending on food remained relatively consistent across both countries.</li>
                        <li>The values for entertainment ranged from 10% to 15%.</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Don't describe every cell - focus on significant patterns</li>
                        <li>Group data logically (e.g., highest together, similar values together)</li>
                        <li>Make comparisons between rows and columns</li>
                        <li>Notice and describe any exceptions or unusual values</li>
                        <li>Use precise language for comparisons</li>
                        <li>Include specific figures to support your descriptions</li>
                    </ol>
                `
            },
            'Process Diagram': {
                title: 'Process Diagram',
                content: `
                    <h1>Task 1: Process Diagram</h1>

                    <h2>What is a Process Diagram?</h2>
                    <p>A process diagram shows how something works or how something is made. It displays a sequence of steps or stages in a process.</p>

                    <h2>Key Vocabulary</h2>
                    <h3>Sequence Words</h3>
                    <ul>
                        <li><strong>Beginning:</strong> first, firstly, to begin with, the process begins with</li>
                        <li><strong>Continuing:</strong> then, next, after this, subsequently, following this</li>
                        <li><strong>Ending:</strong> finally, lastly, the process ends with, the final stage is</li>
                    </ul>

                    <h3>Process Verbs</h3>
                    <ul>
                        <li><strong>Movement:</strong> is transported, is moved, is carried, is conveyed</li>
                        <li><strong>Change:</strong> is transformed, is converted, is changed into, becomes</li>
                        <li><strong>Creation:</strong> is produced, is manufactured, is created, is made</li>
                        <li><strong>Separation:</strong> is separated, is sorted, is divided, is filtered</li>
                    </ul>

                    <h2>Structure Template</h2>

                    <h3>Introduction (20-30 words)</h3>
                    <pre><code>The diagram illustrates the process of [what the process is].
Overall, there are [number] main stages in the process.</code></pre>

                    <h3>Overview (30-40 words)</h3>
                    <pre><code>The process begins with [first stage] and ends with [final stage].
[Key observation about the process].
[Second key observation].</code></pre>

                    <h3>Body Paragraphs (60-80 words each)</h3>
                    <pre><code>First, [description of first stage].
[What happens in this stage].
[Result or outcome].

Next, [description of second stage].
[What happens in this stage].
[Connection to next stage].

Finally, [description of final stage].
[What happens in this stage].
[Final result].</code></pre>

                    <h2>Example Sentences</h2>
                    <ul>
                        <li>The process begins with the collection of plastic bottles from recycling centers.</li>
                        <li>After being sorted, the bottles are cleaned and shredded into small pieces.</li>
                        <li>The plastic is then melted down and formed into pellets.</li>
                        <li>These pellets are subsequently used to manufacture new products.</li>
                        <li>Finally, the recycled products are distributed to retailers.</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Use the passive voice consistently to describe processes</li>
                        <li>Include an overview paragraph summarizing the main stages</li>
                        <li>Use sequence words to show the order of stages</li>
                        <li>Group related stages together in paragraphs</li>
                        <li>Use precise verbs for each stage of the process</li>
                        <li>Avoid describing every minor detail - focus on main stages</li>
                    </ol>
                `
            },
            'Map': {
                title: 'Map',
                content: `
                    <h1>Task 1: Map</h1>

                    <h2>What is a Map?</h2>
                    <p>A map shows geographical changes over time or compares different locations. It displays developments, constructions, and changes in an area.</p>

                    <h2>Key Vocabulary</h2>
                    <h3>Describing Changes</h3>
                    <ul>
                        <li><strong>New construction:</strong> was built, was constructed, was developed, was established</li>
                        <li><strong>Removal:</strong> was demolished, was removed, was cleared, disappeared</li>
                        <li><strong>Change:</strong> was converted into, was transformed into, became, changed into</li>
                        <li><strong>Expansion:</strong> was expanded, was extended, grew in size</li>
                    </ul>

                    <h3>Location Words</h3>
                    <ul>
                        <li><strong>Position:</strong> in the north/south/east/west, in the center, on the outskirts</li>
                        <li><strong>Proximity:</strong> next to, adjacent to, near, close to, opposite</li>
                        <li><strong>Between:</strong> between X and Y, surrounded by, bordered by</li>
                    </ul>

                    <h2>Structure Template</h2>

                    <h3>Introduction (20-30 words)</h3>
                    <pre><code>The maps show the development of [place] between [year 1] and [year 2].
Overall, [main change or pattern].</code></pre>

                    <h3>Overview (30-40 words)</h3>
                    <pre><code>It is clear that [most significant change].
[Second most significant observation].
[Third key observation].</code></pre>

                    <h3>Body Paragraph 1 (50-60 words)</h3>
                    <pre><code>In [year 1], [description of the area].
[Key features present].
[Location of main features].</code></pre>

                    <h3>Body Paragraph 2 (50-60 words)</h3>
                    <pre><code>By [year 2], [description of changes].
[New constructions or developments].
[Removed or changed features].</code></pre>

                    <h2>Example Sentences</h2>
                    <ul>
                        <li>A new residential area was built in the north of the town.</li>
                        <li>The old factory was demolished and replaced by a shopping center.</li>
                        <li>The road network was expanded to connect the new developments.</li>
                        <li>A beach promenade was constructed along the coastline.</li>
                        <li>The farmland in the south was converted into housing estates.</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Use the passive voice to describe changes</li>
                        <li>Include an overview paragraph summarizing main changes</li>
                        <li>Use precise location vocabulary</li>
                        <li>Compare the two maps clearly</li>
                        <li>Group related changes together</li>
                        <li>Use appropriate prepositions for location (in, on, at, by)</li>
                    </ol>
                `
            }
        }
    },
    // Task 2 - Hierarchical Structure
    'Task 2': {
        title: 'Task 2 Overview',
        content: `
            <h1>IELTS Academic Writing Task 2</h1>
            <p>Task 2 requires you to write an academic essay of at least 250 words. You have 40 minutes to complete this task.</p>

            <h2>Essay Types & Word Count Targets</h2>
            <table>
                <thead>
                    <tr>
                        <th>Essay Type</th>
                        <th>Intro</th>
                        <th>Body 1</th>
                        <th>Body 2</th>
                        <th>Body 3</th>
                        <th>Conclusion</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Opinion</td>
                        <td>40-50</td>
                        <td>80-100</td>
                        <td>80-100</td>
                        <td>-</td>
                        <td>40-50</td>
                        <td>250+</td>
                    </tr>
                    <tr>
                        <td>Discussion</td>
                        <td>40-50</td>
                        <td>80-100</td>
                        <td>80-100</td>
                        <td>80-100</td>
                        <td>40-50</td>
                        <td>280+</td>
                    </tr>
                    <tr>
                        <td>Problem/Solution</td>
                        <td>40-50</td>
                        <td>80-100</td>
                        <td>80-100</td>
                        <td>-</td>
                        <td>40-50</td>
                        <td>250+</td>
                    </tr>
                    <tr>
                        <td>Advantages/Disadvantages</td>
                        <td>40-50</td>
                        <td>80-100</td>
                        <td>80-100</td>
                        <td>-</td>
                        <td>40-50</td>
                        <td>250+</td>
                    </tr>
                    <tr>
                        <td>Two-Part Question</td>
                        <td>40-50</td>
                        <td>80-100</td>
                        <td>80-100</td>
                        <td>-</td>
                        <td>40-50</td>
                        <td>250+</td>
                    </tr>
                    <tr>
                        <td>Direct Question</td>
                        <td>40-50</td>
                        <td>80-100</td>
                        <td>80-100</td>
                        <td>-</td>
                        <td>40-50</td>
                        <td>250+</td>
                    </tr>
                </tbody>
            </table>

            <h2>Universal Linking Words</h2>
            <h3>Adding Information</h3>
            <ul>
                <li>Furthermore, Moreover, In addition, Additionally, Also</li>
            </ul>

            <h3>Contrasting</h3>
            <ul>
                <li>However, Nevertheless, On the other hand, Conversely, In contrast</li>
            </ul>

            <h3>Sequencing</h3>
            <ul>
                <li>Firstly, Secondly, Finally, To begin with, Next</li>
            </ul>

            <h3>Concluding</h3>
            <ul>
                <li>In conclusion, To sum up, Overall, Therefore, Consequently</li>
            </ul>

            <h3>Giving Examples</h3>
            <ul>
                <li>For instance, For example, A clear example is, Such as</li>
            </ul>

            <h2>Time Management (40 minutes)</h2>
            <ul>
                <li>Planning: 5 minutes</li>
                <li>Introduction: 5 minutes</li>
                <li>Body paragraphs: 20 minutes</li>
                <li>Conclusion: 5 minutes</li>
                <li>Review: 5 minutes</li>
            </ul>

            <h2>Quick Checklist Before Writing</h2>
            <ol>
                <li>Identify the question type</li>
                <li>Understand exactly what's being asked</li>
                <li>Plan 2-3 main points per paragraph</li>
                <li>Think of specific examples</li>
                <li>Note key vocabulary to use</li>
            </ol>

            <h2>Quick Checklist After Writing</h2>
            <ol>
                <li>Did I answer all parts of the question?</li>
                <li>Is my position clear (for opinion essays)?</li>
                <li>Did I use specific examples?</li>
                <li>Are paragraphs clearly organized?</li>
                <li>Did I use varied sentence structures?</li>
                <li>Is the word count 250+?</li>
                <li>Check for spelling and grammar errors</li>
            </ol>
        `,
        children: {
            'Opinion Essay': {
                title: 'Opinion Essay',
                content: `
                    <h1>Task 2: Opinion Essay</h1>

                    <h2>Question Pattern</h2>
                    <ul>
                        <li>"To what extent do you agree or disagree?"</li>
                        <li>"Do you agree or disagree?"</li>
                        <li>"What is your opinion?"</li>
                    </ul>

                    <h2>Template Structure</h2>

                    <h3>Introduction (40-50 words)</h3>
                    <pre><code>[Hook/Background statement] has become a contentious issue in recent years.
While some argue that [opposing view], I strongly agree/disagree that [your position].
This essay will examine [key aspect 1] and [key aspect 2] to support this viewpoint.</code></pre>

                    <h3>Body Paragraph 1 (80-100 words)</h3>
                    <pre><code>The primary reason for [your position] is [main point 1].
[Explanation/elaboration].
For instance, [specific example].
This demonstrates that [connection back to position].
Furthermore, [additional supporting detail].</code></pre>

                    <h3>Body Paragraph 2 (80-100 words)</h3>
                    <pre><code>Another compelling argument is [main point 2].
[Explanation/elaboration].
A clear example of this can be seen in [specific example].
Consequently, [result/implication].
This further reinforces the validity of [your position].</code></pre>

                    <h3>Conclusion (40-50 words)</h3>
                    <pre><code>In conclusion, I firmly believe that [restate position].
The evidence from [point 1] and [point 2] clearly supports this view.
Therefore, [final thought/recommendation].</code></pre>

                    <h2>Key Vocabulary</h2>
                    <ul>
                        <li>contentious issue, firmly believe, compelling argument, reinforces the view</li>
                        <li>deterrent effect, holistic approach, comprehensive strategy, unequivocally support</li>
                        <li>significant impact, crucial factor, fundamental aspect, essential consideration</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Take a clear position (don't sit on the fence)</li>
                        <li>Develop two distinct, well-supported arguments</li>
                        <li>Use topic sentences at the start of each paragraph</li>
                        <li>Include specific examples (real or hypothetical)</li>
                        <li>Use a variety of complex sentence structures</li>
                        <li>Ensure each paragraph has a clear central idea</li>
                    </ol>
                `
            },
            'Discussion Essay': {
                title: 'Discussion Essay',
                content: `
                    <h1>Task 2: Discussion Essay</h1>

                    <h2>Question Pattern</h2>
                    <ul>
                        <li>"Discuss both views and give your own opinion."</li>
                        <li>"Some people believe X, while others think Y. Discuss both views."</li>
                    </ul>

                    <h2>Template Structure</h2>

                    <h3>Introduction (40-50 words)</h3>
                    <pre><code>The question of [topic] has sparked considerable debate.
While some advocate for [view 1], others contend that [view 2].
This essay will examine both perspectives before presenting my own opinion.</code></pre>

                    <h3>Body Paragraph 1 - View 1 (80-100 words)</h3>
                    <pre><code>Those who support [view 1] argue that [main argument 1].
[Explanation/elaboration].
For example, [specific example].
This perspective emphasizes [key aspect].
Additionally, [supporting point].</code></pre>

                    <h3>Body Paragraph 2 - View 2 (80-100 words)</h3>
                    <pre><code>Conversely, proponents of [view 2] maintain that [main argument 2].
[Explanation/elaboration].
A notable instance is [specific example].
This view highlights [key aspect].
Moreover, [supporting point].</code></pre>

                    <h3>Body Paragraph 3 - Your Opinion (80-100 words)</h3>
                    <pre><code>In my opinion, [your position] is more convincing.
[Reason for your preference].
This is because [explanation].
For instance, [example supporting your view].
Therefore, [concluding thought on your position].</code></pre>

                    <h3>Conclusion (40-50 words)</h3>
                    <pre><code>To conclude, both perspectives offer valid insights into [topic].
However, I believe that [restate your position] is the more compelling argument.
A balanced approach that incorporates [element from view 1] and [element from view 2] would be ideal.</code></pre>

                    <h2>Key Vocabulary</h2>
                    <ul>
                        <li>sparked considerable debate, advocate for, contend that, proponents of</li>
                        <li>maintain that, valid insights, compelling argument, balanced approach</li>
                        <li>incorporate elements, weigh the arguments, consider both sides</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Give equal weight to both views in body paragraphs 1 and 2</li>
                        <li>Clearly state your opinion in body paragraph 3</li>
                        <li>Use specific examples for each perspective</li>
                        <li>Show understanding of both sides' merits</li>
                        <li>Avoid simply listing points—develop arguments fully</li>
                        <li>Ensure your opinion is well-reasoned, not just stated</li>
                    </ol>
                `
            },
            'Problem/Solution': {
                title: 'Problem/Solution',
                content: `
                    <h1>Task 2: Problem/Solution Essay</h1>

                    <h2>Question Pattern</h2>
                    <ul>
                        <li>"What are the causes of this problem and how can it be solved?"</li>
                        <li>"Why is this happening and what can be done about it?"</li>
                        <li>"What problems does this cause and how can they be addressed?"</li>
                    </ul>

                    <h2>Template Structure</h2>

                    <h3>Introduction (40-50 words)</h3>
                    <pre><code>[Problem/Issue] has emerged as a significant concern in [context].
This situation stems from several factors, including [cause 1] and [cause 2].
This essay will examine the root causes and propose viable solutions.</code></pre>

                    <h3>Body Paragraph 1 - Problems/Causes (80-100 words)</h3>
                    <pre><code>The primary cause of [problem] is [main cause 1].
[Explanation of how this cause leads to the problem].
For instance, [specific example].
This results in [consequence].
Additionally, [secondary cause] contributes to the issue by [explanation].</code></pre>

                    <h3>Body Paragraph 2 - Solutions (80-100 words)</h3>
                    <pre><code>To address this problem, [solution 1] could be implemented.
[Explanation of how this solution works].
For example, [specific example of implementation].
This would [expected outcome].
Furthermore, [solution 2] would help by [explanation].</code></pre>

                    <h3>Conclusion (40-50 words)</h3>
                    <pre><code>In summary, [problem] arises from [cause 1] and [cause 2].
However, through [solution 1] and [solution 2], this issue can be effectively mitigated.
Collective action from [stakeholders] is essential for sustainable improvement.</code></pre>

                    <h2>Key Vocabulary</h2>
                    <ul>
                        <li>emerged as a significant concern, stems from several factors, root causes</li>
                        <li>viable solutions, effectively mitigated, comprehensive approach, sustainable improvement</li>
                        <li>underlying issues, collective action, implement measures, address the problem</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Clearly separate causes and solutions (usually one paragraph each)</li>
                        <li>Provide specific, realistic solutions—not vague suggestions</li>
                        <li>Link solutions directly to the causes you identified</li>
                        <li>Use cause-and-effect language appropriately</li>
                        <li>Include examples of successful implementations where possible</li>
                        <li>Ensure solutions are practical and achievable</li>
                    </ol>
                `
            },
            'Advantages/Disadvantages': {
                title: 'Advantages/Disadvantages',
                content: `
                    <h1>Task 2: Advantages/Disadvantages Essay</h1>

                    <h2>Question Pattern</h2>
                    <ul>
                        <li>"Do the advantages outweigh the disadvantages?"</li>
                        <li>"What are the advantages and disadvantages of...?"</li>
                        <li>"Discuss the advantages and disadvantages."</li>
                    </ul>

                    <h2>Template Structure</h2>

                    <h3>Introduction (40-50 words)</h3>
                    <pre><code>[Topic] has become increasingly prevalent in [context].
While this trend offers several benefits, it also presents notable drawbacks.
This essay will examine both the advantages and disadvantages before reaching a conclusion.</code></pre>

                    <h3>Body Paragraph 1 - Advantages (80-100 words)</h3>
                    <pre><code>One significant advantage of [topic] is [main advantage 1].
[Explanation/elaboration].
For instance, [specific example].
This enables [positive outcome].
Furthermore, [advantage 2] contributes to [benefit].</code></pre>

                    <h3>Body Paragraph 2 - Disadvantages (80-100 words)</h3>
                    <pre><code>However, there are notable disadvantages to consider.
The primary drawback is [main disadvantage 1].
[Explanation/elaboration].
A clear example is [specific example].
This can lead to [negative consequence].
Additionally, [disadvantage 2] poses challenges by [explanation].</code></pre>

                    <h3>Conclusion (40-50 words)</h3>
                    <pre><code>In conclusion, while [topic] offers benefits such as [advantage 1], it also presents challenges including [disadvantage 1].
On balance, I believe that [your position: advantages outweigh disadvantages OR vice versa].
Therefore, [recommendation/final thought].</code></pre>

                    <h2>Key Vocabulary</h2>
                    <ul>
                        <li>increasingly prevalent, significant advantage, notable drawback</li>
                        <li>enables positive outcome, poses challenges, on balance, outweigh</li>
                        <li>beneficial, detrimental, merit, drawback, double-edged sword</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Give equal attention to both advantages and disadvantages</li>
                        <li>Use specific examples for each point</li>
                        <li>Clearly state your position in the conclusion</li>
                        <li>Use comparative language appropriately</li>
                        <li>Develop each point fully with explanation</li>
                        <li>Consider the question type—some ask "do advantages outweigh" requiring a clear stance</li>
                    </ol>
                `
            },
            'Two-Part Question': {
                title: 'Two-Part Question',
                content: `
                    <h1>Task 2: Two-Part Question Essay</h1>

                    <h2>Question Pattern</h2>
                    <ul>
                        <li>"Why is this happening? What are the solutions?"</li>
                        <li>"What are the causes? What effects does this have?"</li>
                        <li>"Why do people think this? Is this positive or negative?"</li>
                    </ul>

                    <h2>Template Structure</h2>

                    <h3>Introduction (40-50 words)</h3>
                    <pre><code>[Topic/Phenomenon] has attracted significant attention in recent times.
This essay will address [question 1] and examine [question 2].
Understanding both aspects is crucial for [context/reason].</code></pre>

                    <h3>Body Paragraph 1 - First Question (80-100 words)</h3>
                    <pre><code>Regarding [question 1], there are several key factors to consider.
[Main point 1 addressing first question].
[Explanation/elaboration].
For instance, [specific example].
This demonstrates that [connection].
Additionally, [supporting point].</code></pre>

                    <h3>Body Paragraph 2 - Second Question (80-100 words)</h3>
                    <pre><code>Turning to [question 2], [main point addressing second question].
[Explanation/elaboration].
A clear example is [specific example].
This results in [consequence/implication].
Furthermore, [supporting point].</code></pre>

                    <h3>Conclusion (40-50 words)</h3>
                    <pre><code>In summary, [answer to question 1] and [answer to question 2] are interconnected.
[Restate key points].
Therefore, [final thought/recommendation].</code></pre>

                    <h2>Key Vocabulary</h2>
                    <ul>
                        <li>attracted significant attention, regarding, turning to, interconnected</li>
                        <li>predominantly, detrimental, short-term vs long-term, sustainable</li>
                        <li>well-being, blurred boundaries, multifaceted, complex issue</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Clearly separate your response to each question</li>
                        <li>Use topic sentences that directly address each part</li>
                        <li>Ensure both questions receive equal attention</li>
                        <li>Link the two parts logically in your conclusion</li>
                        <li>Use specific examples for each point</li>
                        <li>Maintain clear paragraph structure</li>
                    </ol>
                `
            },
            'Direct Question': {
                title: 'Direct Question',
                content: `
                    <h1>Task 2: Direct Question Essay</h1>

                    <h2>Question Pattern</h2>
                    <ul>
                        <li>"What do you think are the most important...?"</li>
                        <li>"How can... be improved?"</li>
                        <li>"What measures should be taken...?"</li>
                        <li>"Is it better to... or...?"</li>
                    </ul>

                    <h2>Template Structure</h2>

                    <h3>Introduction (40-50 words)</h3>
                    <pre><code>The issue of [topic] requires careful consideration.
This essay will address [question 1] and [question 2].
These aspects are crucial for [context/reason].</code></pre>

                    <h3>Body Paragraph 1 - First Question (80-100 words)</h3>
                    <pre><code>Regarding [question 1], [direct answer/main point].
[Explanation/elaboration].
For instance, [specific example].
This is important because [reason].
Additionally, [supporting point].</code></pre>

                    <h3>Body Paragraph 2 - Second Question (80-100 words)</h3>
                    <pre><code>As for [question 2], [direct answer/main point].
[Explanation/elaboration].
A clear example is [specific example].
This approach would [expected outcome].
Furthermore, [supporting point].</code></pre>

                    <h3>Conclusion (40-50 words)</h3>
                    <pre><code>In conclusion, [answer to question 1] and [answer to question 2] represent key considerations.
[Restate main points].
Therefore, [final thought/recommendation].</code></pre>

                    <h2>Key Vocabulary</h2>
                    <ul>
                        <li>requires careful consideration, regarding, as for, fundamental</li>
                        <li>articulate, cultivate, accelerate development, commit to</li>
                        <li>comprehensive, deliberate practice, essential qualities, develop skills</li>
                    </ul>

                    <h2>Tips for Band 7+</h2>
                    <ol>
                        <li>Answer each question directly and clearly</li>
                        <li>Use specific examples to support your points</li>
                        <li>Develop each answer fully with explanation</li>
                        <li>Show logical flow between your points</li>
                        <li>Use precise vocabulary related to the topic</li>
                        <li>Ensure your conclusion summarizes both answers</li>
                    </ol>
                `
            }
        }
    }
};

// ============================================
// Initialization
// ============================================
// Toast Notification System
// ============================================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast--show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('toast--show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// Initialization
// ============================================

function init() {
    loadHistory();
    setupEventListeners();
    setupLearningMode();
    updateHistoryDisplay();
    updateTimerDisplay();
    updateAnalysisModeUI();
}

// ============================================
// Event Listeners Setup
// ============================================

function setupEventListeners() {
    // Navigation
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', handleNavigation);
    });

    // Task Selector
    elements.taskButtons.forEach(btn => {
        btn.addEventListener('click', handleTaskSelection);
    });

    // Timer
    elements.startTimerBtn.addEventListener('click', startTimer);
    elements.resetTimerBtn.addEventListener('click', resetTimer);

    // Question Generation
    elements.generateBtn.addEventListener('click', generateQuestion);
    elements.toggleQuestionTypeBtn.addEventListener('click', toggleQuestionTypeVisibility);

    // Answer Input (with debounced real-time analysis)
    elements.answerArea.addEventListener('input', debounce(handleAnswerInput, 500));

    // Analysis
    elements.analyzeBtn.addEventListener('click', analyzeAnswer);
    elements.toggleAnalysisBtn.addEventListener('click', toggleAnalysisMode);

    // Clear
    elements.clearBtn.addEventListener('click', handleClear);

    // Modal
    elements.modalCancel.addEventListener('click', hideModal);
    elements.modalConfirm.addEventListener('click', handleModalConfirm);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) hideModal();
    });

    // Settings Modal
    elements.settingsBtn.addEventListener('click', openSettingsModal);
    elements.settingsSave.addEventListener('click', saveSettings);
    elements.settingsCancel.addEventListener('click', closeSettingsModal);
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) closeSettingsModal();
    });
    elements.providerSelect.addEventListener('change', updateProviderInfo);
    elements.toggleKeyVisibility.addEventListener('click', toggleKeyVisibility);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ============================================
// Navigation Handlers
// ============================================

function handleNavigation(e) {
    const btn = e.currentTarget;
    const view = btn.dataset.view;

    // Skip if no view (e.g., settings button)
    if (!view) return;

    // Update active state
    elements.navButtons.forEach(b => b.classList.remove('nav-btn--active'));
    btn.classList.add('nav-btn--active');

    // Show corresponding view
    Object.values(elements.views).forEach(v => v.classList.remove('view--active'));
    elements.views[view].classList.add('view--active');

    state.currentView = view;

    // Update history display if switching to history view
    if (view === 'history') {
        updateHistoryDisplay();
    }
}

// ============================================
// Task Selection Handlers
// ============================================

function handleTaskSelection(e) {
    const btn = e.currentTarget;
    const task = parseInt(btn.dataset.task);

    // Update active state
    elements.taskButtons.forEach(b => b.classList.remove('task-card--active'));
    btn.classList.add('task-card--active');

    // Update state
    state.currentTask = task;

    // Update timer and target words
    state.timer.remaining = task === 1 ? 20 * 60 : 40 * 60;
    elements.targetWords.textContent = task === 1 ? '150' : '250';

    // Reset timer
    resetTimer();

    // Update timer display
    updateTimerDisplay();

    // Clear current question if task changed
    if (state.currentQuestion && state.currentQuestion.task !== task) {
        state.currentQuestion = null;
        elements.questionType.textContent = 'Click "Generate Question"';
        elements.questionText.textContent = 'Generate a question to begin your practice session.';
        elements.questionImage.style.display = 'none';
        elements.questionChart.style.display = 'none';
        elements.dataDescription.style.display = 'none';
    }
}

// ============================================
// Timer Functions
// ============================================

function startTimer() {
    if (state.timer.running) return;

    state.timer.running = true;
    elements.startTimerBtn.disabled = true;

    state.timer.interval = setInterval(() => {
        state.timer.remaining--;
        updateTimerDisplay();

        if (state.timer.remaining <= 0) {
            stopTimer();
            showModal('Time\'s Up!', 'Your time has expired. Please review your answer and submit for analysis.');
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(state.timer.interval);
    state.timer.running = false;
    elements.startTimerBtn.disabled = false;
}

function resetTimer() {
    stopTimer();
    state.timer.remaining = state.currentTask === 1 ? 20 * 60 : 40 * 60;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timer.remaining / 60);
    const seconds = state.timer.remaining % 60;
    elements.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update color based on remaining time
    elements.timerDisplay.classList.remove('timer--warning', 'timer--danger');
    if (state.timer.remaining <= 60) {
        elements.timerDisplay.classList.add('timer--danger');
    } else if (state.timer.remaining <= 300) {
        elements.timerDisplay.classList.add('timer--warning');
    }
}

// ============================================
// Question Generation
// ============================================

function generateQuestion() {
    state.currentQuestion = getQuestion(state.currentTask);

    // Update question display
    elements.questionType.textContent = state.currentQuestion.type;
    elements.questionText.textContent = state.currentQuestion.question;

    // Show/hide question type based on state
    elements.questionType.style.display = state.showQuestionType ? 'block' : 'none';

    // Handle Task 1 - render chart if supported
    if (state.currentTask === 1 && state.currentQuestion.dataPoints && supportsChart(state.currentQuestion.type)) {
        // Hide image and data description, show chart
        elements.questionImage.style.display = 'none';
        elements.dataDescription.style.display = 'none';
        elements.questionChart.style.display = 'block';
        elements.questionChartCaption.textContent = state.currentQuestion.imageCaption || '';

        // Render the chart
        renderChart(state.currentQuestion, elements.questionChartCanvas);
    } else if (state.currentTask === 1 && (state.currentQuestion.imageUrl || hasDataDescription(state.currentQuestion.type))) {
        // Show image for non-chart types (process diagrams, maps)
        elements.questionChart.style.display = 'none';

        // Show data description if available
        if (state.currentQuestion.dataDescription) {
            elements.dataDescription.style.display = 'block';
            elements.dataDescriptionText.textContent = state.currentQuestion.dataDescription.trim();
        } else {
            elements.dataDescription.style.display = 'none';
        }

        elements.questionImageEl.src = state.currentQuestion.imageUrl || '';
        elements.questionImageCaption.textContent = state.currentQuestion.imageCaption || '';
        elements.questionImage.style.display = 'block';
    } else {
        // Hide all for Task 2
        elements.questionImage.style.display = 'none';
        elements.questionChart.style.display = 'none';
        elements.dataDescription.style.display = 'none';
    }

    // Clear previous analysis
    elements.analysisPanel.style.display = 'none';

    // Reset answer area
    elements.answerArea.value = '';
    updateWordCount();
}

/**
 * Toggle question type visibility
 */
function toggleQuestionTypeVisibility() {
    state.showQuestionType = !state.showQuestionType;

    // Update button text
    if (state.showQuestionType) {
        elements.toggleQuestionTypeText.textContent = 'Hide Type';
        elements.toggleQuestionTypeBtn.title = 'Hide question type';
    } else {
        elements.toggleQuestionTypeText.textContent = 'Show Type';
        elements.toggleQuestionTypeBtn.title = 'Show question type';
    }

    // Update question type display
    if (state.currentQuestion) {
        elements.questionType.style.display = state.showQuestionType ? 'block' : 'none';
    }
}

// ============================================
// Answer Input & Real-time Analysis
// ============================================

function handleAnswerInput() {
    updateWordCount();

    // Real-time quick analysis
    const text = elements.answerArea.value;
    if (text.trim().length > 50 && state.currentQuestion) {
        const quickAnalysis = quickAnalyze(text, state.currentQuestion.type);
        // Could display quick stats here if desired
    }
}

function updateWordCount() {
    const text = elements.answerArea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;

    // Determine target words based on question type
    const isTask1 = state.currentQuestion?.type?.startsWith('task1') ||
                   ['bar-chart', 'line-graph', 'pie-chart', 'table', 'process', 'map'].includes(state.currentQuestion?.type);
    const target = isTask1 ? 150 : 250;

    elements.wordCount.textContent = words;

    // Update progress bar
    const percentage = Math.min((words / target) * 100, 100);
    elements.progressFill.style.width = `${percentage}%`;

    // Update word count color
    elements.wordCount.classList.remove('word-count--warning', 'word-count--success');
    if (words >= target) {
        elements.wordCount.classList.add('word-count--success');
    } else if (words >= target * 0.8) {
        elements.wordCount.classList.add('word-count--warning');
    }
}

// ============================================
// Analysis Functions
// ============================================

async function analyzeAnswer() {
    // Prevent multiple simultaneous analyses
    if (state.isAnalyzing) {
        showToast('Analysis in progress, please wait...', 'error');
        return;
    }

    const answer = elements.answerArea.value.trim();

    if (!answer) {
        showToast('Please write your answer before analyzing.', 'error');
        return;
    }

    if (!state.currentQuestion) {
        showToast('Please generate a question first.', 'error');
        return;
    }

    // Check for API key if using AI analysis
    if (state.useAIAnalysis) {
        const selectedProvider = getSelectedProvider();
        const hasKey = localStorage.getItem(`api_key_${selectedProvider}`);

        if (!hasKey) {
            // Show analysis panel with error message
            elements.analysisPanel.style.display = 'block';
            elements.analysisFeedback.innerHTML = `
                <div class="feedback-section feedback-section--error">
                    <h4>No API Key Configured</h4>
                    <p>To use AI analysis, you need to configure an API key first.</p>
                    <button class="btn btn--secondary" onclick="openSettingsModal()">
                        <span class="btn__icon">⚙️</span>
                        <span>Open Settings</span>
                    </button>
                    <button class="btn btn--secondary" onclick="toggleAnalysisMode()">
                        <span class="btn__icon">🔄</span>
                        <span>Try Generic Analysis</span>
                    </button>
                </div>
            `;
            // Scroll to analysis panel
            elements.analysisPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
    }

    // Set analyzing flag and disable button
    state.isAnalyzing = true;
    elements.analyzeBtn.disabled = true;

    // Clear previous scores
    elements.overallScore.textContent = '-';
    elements.taskResponseScore.textContent = '-';
    elements.coherenceScore.textContent = '-';
    elements.vocabularyScore.textContent = '-';
    elements.grammarScore.textContent = '-';
    elements.taskResponseBar.style.width = '0%';
    elements.coherenceBar.style.width = '0%';
    elements.vocabularyBar.style.width = '0%';
    elements.grammarBar.style.width = '0%';

    // Show loading state
    elements.analysisPanel.style.display = 'block';
    elements.analysisFeedback.innerHTML = '<div class="loading"><div class="spinner"></div><p>Analyzing your answer...</p></div>';

    // Scroll to analysis panel
    elements.analysisPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
        let analysis;

        if (state.useAIAnalysis) {
            // Use AI analysis
            analysis = await analyzeTextWithAI(answer, state.currentQuestion.type, state.currentQuestion);
        } else {
            // Use generic analysis
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
            analysis = analyzeText(answer, state.currentQuestion.type, state.currentQuestion);
        }

        displayAnalysis(analysis);
        saveToHistory(answer, analysis);
    } catch (error) {
        console.error('Analysis Error:', error);
        handleAnalysisError(error);
    } finally {
        // Reset analyzing flag and re-enable button
        state.isAnalyzing = false;
        elements.analyzeBtn.disabled = false;
    }
}

function handleAnalysisError(error) {
    let errorMessage = error.message || 'An error occurred during analysis.';
    let showSettingsButton = false;

    // Check for authentication errors
    if (state.useAIAnalysis) {
        const authErrorPatterns = [
            /unauthorized/i,
            /invalid.*key/i,
            /authentication/i,
            /401/i,
            /403/i
        ];

        const isAuthError = authErrorPatterns.some(pattern => pattern.test(errorMessage));

        if (isAuthError) {
            errorMessage = 'Invalid or expired API key. Please check your API key in settings.';
            showSettingsButton = true;
        }
    }

    elements.analysisFeedback.innerHTML = `
        <div class="feedback-section feedback-section--error">
            <h4>Analysis Error</h4>
            <p>${errorMessage}</p>
            ${showSettingsButton ? `
                <button class="btn btn--secondary" onclick="openSettingsModal()">
                    <span class="btn__icon">⚙️</span>
                    <span>Open Settings</span>
                </button>
            ` : ''}
            ${state.useAIAnalysis && !showSettingsButton ? `
                <button class="btn btn--secondary" onclick="toggleAnalysisMode()">
                    <span class="btn__icon">🔄</span>
                    <span>Try Generic Analysis</span>
                </button>
            ` : ''}
        </div>
    `;
}

function displayAnalysis(analysis) {
    // Update scores
    elements.overallScore.textContent = analysis.overall;
    elements.taskResponseScore.textContent = analysis.taskResponse;
    elements.coherenceScore.textContent = analysis.coherence;
    elements.vocabularyScore.textContent = analysis.vocabulary;
    elements.grammarScore.textContent = analysis.grammar;

    // Update score bars
    elements.taskResponseBar.style.width = `${(analysis.taskResponse / 9) * 100}%`;
    elements.coherenceBar.style.width = `${(analysis.coherence / 9) * 100}%`;
    elements.vocabularyBar.style.width = `${(analysis.vocabulary / 9) * 100}%`;
    elements.grammarBar.style.width = `${(analysis.grammar / 9) * 100}%`;

    // Update feedback
    elements.analysisFeedback.innerHTML = `
        <div class="feedback-section">
            <h4>Overall Assessment</h4>
            <p>${analysis.feedback.overall}</p>
        </div>
        <div class="feedback-section">
            <h4>Task Response (${analysis.taskResponse}/9)</h4>
            <p>${analysis.feedback.taskResponse}</p>
        </div>
        <div class="feedback-section">
            <h4>Coherence & Cohesion (${analysis.coherence}/9)</h4>
            <p>${analysis.feedback.coherence}</p>
        </div>
        <div class="feedback-section">
            <h4>Lexical Resource (${analysis.vocabulary}/9)</h4>
            <p>${analysis.feedback.vocabulary}</p>
        </div>
        <div class="feedback-section">
            <h4>Grammatical Range (${analysis.grammar}/9)</h4>
            <p>${analysis.feedback.grammar}</p>
        </div>
        <div class="feedback-section">
            <h4>Statistics</h4>
            <p>Word Count: ${analysis.wordCount} (Target: ${analysis.details.targetWords}+)</p>
            <p>Sentences: ${analysis.sentenceCount}</p>
            <p>Paragraphs: ${analysis.paragraphCount}</p>
            <p>Linking Words Used: ${analysis.details.linkingWordsUsed}</p>
            <p>Academic Words Used: ${analysis.details.academicWordsUsed}</p>
            <p>Unique Words: ${analysis.details.uniqueWords}</p>
        </div>
        ${analysis.feedback.suggestions.length > 0 ? `
            <div class="feedback-section">
                <h4>Suggestions for Improvement</h4>
                <ul>
                    ${analysis.feedback.suggestions.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;
}

/**
 * Toggle between AI and Generic analysis mode
 */
function toggleAnalysisMode() {
    // If switching TO AI mode, check for API key
    if (!state.useAIAnalysis) {
        const selectedProvider = getSelectedProvider();
        const hasKey = localStorage.getItem(`api_key_${selectedProvider}`);

        if (!hasKey) {
            showModal('No API Key Configured',
                'To use AI analysis, you need to configure an API key first. Would you like to open settings?');
            // Store the pending action
            state.pendingModeSwitch = true;
            return;
        }
    }

    // Toggle the mode
    state.useAIAnalysis = !state.useAIAnalysis;
    updateAnalysisModeUI();

    const mode = state.useAIAnalysis ? 'AI' : 'Generic';
    showToast(`Switched to ${mode} analysis mode`);
}

/**
 * Update analysis mode UI elements
 */
function updateAnalysisModeUI() {
    // Update mode badge
    const badge = document.getElementById('currentModeBadge');
    if (badge) {
        badge.textContent = state.useAIAnalysis ? 'AI Mode' : 'Generic Mode';
        badge.className = `mode-badge ${state.useAIAnalysis ? 'mode-badge--ai' : 'mode-badge--generic'}`;
    }

    // Update button text to show what it will switch TO
    if (state.useAIAnalysis) {
        elements.analysisModeText.textContent = 'Switch to Generic';
        elements.toggleAnalysisBtn.title = 'Switch to Generic analysis';
    } else {
        elements.analysisModeText.textContent = 'Switch to AI';
        elements.toggleAnalysisBtn.title = 'Switch to AI analysis';
    }
}

// Make functions available globally for HTML onclick
window.toggleAnalysisMode = toggleAnalysisMode;
window.openSettingsModal = openSettingsModal;

// ============================================
// History Functions
// ============================================

function loadHistory() {
    state.history = getStorage('history', []);
}

function saveToHistory(answer, analysis) {
    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        task: state.currentTask,
        questionType: state.currentQuestion.type,
        question: state.currentQuestion.question,
        answer: answer,
        analysis: analysis
    };

    state.history.unshift(entry);

    // Keep only last 50 entries
    if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
    }

    setStorage('history', state.history);
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const totalEssays = state.history.length;
    const task1Essays = state.history.filter(h => h.task === 1).length;
    const task2Essays = state.history.filter(h => h.task === 2).length;

    elements.totalEssays.textContent = totalEssays;
    elements.task1Count.textContent = task1Essays;
    elements.task2Count.textContent = task2Essays;

    if (totalEssays > 0) {
        const avgScore = state.history.reduce((sum, h) => sum + h.analysis.overall, 0) / totalEssays;
        elements.avgScore.textContent = avgScore.toFixed(1);
    } else {
        elements.avgScore.textContent = '-';
    }

    if (state.history.length === 0) {
        elements.historyList.innerHTML = '<p class="history__empty">No essays yet. Start practicing!</p>';
    } else {
        elements.historyList.innerHTML = state.history.slice(0, 10).map(entry => `
            <div class="history-item" data-id="${entry.id}">
                <div class="history-item__header">
                    <span class="history-item__task">Task ${entry.task} - ${entry.questionType}</span>
                    <span class="history-item__date">${new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <div class="history-item__score">Band ${entry.analysis.overall}</div>
            </div>
        `).join('');

        // Add click handlers
        elements.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const entry = state.history.find(h => h.id === parseInt(item.dataset.id));
                if (entry) {
                    loadHistoryEntry(entry);
                }
            });
        });
    }
}

function loadHistoryEntry(entry) {
    // Update state
    state.currentTask = entry.task;
    state.currentQuestion = {
        type: entry.questionType,
        question: entry.question,
        task: entry.task
    };

    // Update UI
    elements.taskButtons.forEach(btn => {
        btn.classList.toggle('task-card--active', parseInt(btn.dataset.task) === state.currentTask);
    });

    elements.questionType.textContent = entry.questionType;
    elements.questionText.textContent = entry.question;
    elements.answerArea.value = entry.answer;

    // Show/hide question type based on state
    elements.questionType.style.display = state.showQuestionType ? 'block' : 'none';

    // Update word count
    updateWordCount();

    // Display analysis
    displayAnalysis(entry.analysis);
    elements.analysisPanel.style.display = 'block';

    // Switch to practice view
    elements.navButtons.forEach(btn => {
        btn.classList.toggle('nav-btn--active', btn.dataset.view === 'practice');
    });
    Object.values(elements.views).forEach(v => v.classList.remove('view--active'));
    elements.views.practice.classList.add('view--active');
}

// ============================================
// Learning Mode Functions
// ============================================

function setupLearningMode() {
    // Clear existing menu items
    elements.sidebarMenu.innerHTML = '';

    // Populate sidebar menu with hierarchical structure
    Object.keys(learningContent).forEach((key, index) => {
        const item = learningContent[key];

        // Check if this is a parent item (has children)
        if (typeof item === 'object' && item.children) {
            // Create parent item
            const parentLi = document.createElement('li');
            parentLi.className = 'menu-item--parent';
            parentLi.innerHTML = `
                <span>${item.title || key}</span>
                <span class="menu-item__arrow">▼</span>
            `;

            // Create children container
            const childrenUl = document.createElement('ul');
            childrenUl.className = 'menu-item--children';

            // Add children
            Object.keys(item.children).forEach((childKey) => {
                const childLi = document.createElement('li');
                childLi.textContent = item.children[childKey].title || childKey;
                childLi.dataset.content = `${key}.${childKey}`;
                childLi.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loadLearningContent(`${key}.${childKey}`);
                });
                childrenUl.appendChild(childLi);
            });

            // Add click handler to toggle children
            parentLi.addEventListener('click', () => {
                parentLi.classList.toggle('expanded');
            });

            elements.sidebarMenu.appendChild(parentLi);
            elements.sidebarMenu.appendChild(childrenUl);
        } else {
            // Simple item (like Overview)
            const li = document.createElement('li');
            li.textContent = key;
            li.dataset.content = key;
            if (index === 0) li.classList.add('li--active');
            li.addEventListener('click', () => loadLearningContent(key));
            elements.sidebarMenu.appendChild(li);
        }
    });

    // Load first content
    loadLearningContent('Overview');
}

function loadLearningContent(key) {
    // Handle hierarchical keys (e.g., "Task 1.Line Graph")
    if (key.includes('.')) {
        const [parentKey, childKey] = key.split('.');
        const parentItem = learningContent[parentKey];
        const childItem = parentItem.children[childKey];

        // Update active menu item
        elements.sidebarMenu.querySelectorAll('li').forEach(li => {
            li.classList.toggle('li--active', li.dataset.content === key);
        });

        // Load content
        elements.contentArea.innerHTML = childItem.content;
    } else {
        // Handle simple keys (like Overview)
        const item = learningContent[key];

        // Update active menu item
        elements.sidebarMenu.querySelectorAll('li').forEach(li => {
            li.classList.toggle('li--active', li.dataset.content === key);
        });

        // Load content
        if (typeof item === 'object' && item.content) {
            elements.contentArea.innerHTML = item.content;
        } else {
            elements.contentArea.innerHTML = item;
        }
    }
}

// ============================================
// Clear Function
// ============================================

function handleClear() {
    if (elements.answerArea.value.trim()) {
        showModal('Clear Answer?', 'Are you sure you want to clear your answer? This cannot be undone.');
    }
}

// ============================================
// Modal Functions
// ============================================

function showModal(title, body) {
    elements.modalTitle.textContent = title;
    elements.modalBody.textContent = body;
    elements.modal.classList.add('modal--active');
    elements.modal.setAttribute('aria-hidden', 'false');
}

function hideModal() {
    elements.modal.classList.remove('modal--active');
    elements.modal.setAttribute('aria-hidden', 'true');
}

function handleModalConfirm() {
    hideModal();
    if (elements.modalTitle.textContent === 'Clear Answer?') {
        elements.answerArea.value = '';
        updateWordCount();
        elements.analysisPanel.style.display = 'none';
    } else if (elements.modalTitle.textContent === 'Time\'s Up!') {
        analyzeAnswer();
    } else if (elements.modalTitle.textContent === 'No API Key Configured' && state.pendingModeSwitch) {
        // User confirmed to open settings for API key configuration
        state.pendingModeSwitch = false;
        openSettingsModal();
    }
}

// ============================================
// Settings Modal Functions
// ============================================

const PROVIDER_INFO = {
    claude: {
        description: 'Claude by Anthropic provides high-quality analysis with strong reasoning capabilities. Get your API key from the Anthropic console.',
        link: 'https://console.anthropic.com/'
    },
    openai: {
        description: 'OpenAI GPT-4 offers excellent analysis with broad knowledge. Get your API key from the OpenAI platform.',
        link: 'https://platform.openai.com/api-keys'
    },
    gemini: {
        description: 'Google Gemini provides powerful AI analysis with good performance. Get your API key from Google AI Studio.',
        link: 'https://makersuite.google.com/app/apikey'
    },
    deepseek: {
        description: 'DeepSeek offers cost-effective AI analysis with good quality. Get your API key from the DeepSeek platform.',
        link: 'https://platform.deepseek.com/'
    },
    openrouter: {
        description: 'OpenRouter provides access to multiple AI models through a single API. Uses openrouter/free router for free access to various models. Get your API key from OpenRouter.',
        link: 'https://openrouter.ai/keys'
    }
};

function openSettingsModal() {
    const selectedProvider = getSelectedProvider();
    const apiKey = localStorage.getItem(`api_key_${selectedProvider}`) || '';

    elements.providerSelect.value = selectedProvider;
    elements.apiKeyInput.value = apiKey;
    updateProviderInfo();

    elements.settingsModal.classList.add('modal--active');
    elements.settingsModal.setAttribute('aria-hidden', 'false');
}

function closeSettingsModal() {
    elements.settingsModal.classList.remove('modal--active');
    elements.settingsModal.setAttribute('aria-hidden', 'true');
    // Switch to practice view
    switchToPracticeView();
}

function saveSettings() {
    const providerId = elements.providerSelect.value;
    const apiKey = elements.apiKeyInput.value.trim();

    if (apiKey) {
        localStorage.setItem(`api_key_${providerId}`, apiKey);
        setSelectedProviderId(providerId);
        showToast('API key saved successfully!');
        closeSettingsModal();
    } else {
        showToast('Please enter an API key.', 'error');
    }
}

function switchToPracticeView() {
    // Update active state of nav buttons
    elements.navButtons.forEach(btn => {
        btn.classList.toggle('nav-btn--active', btn.dataset.view === 'practice');
    });
    // Show practice view
    Object.values(elements.views).forEach(v => v.classList.remove('view--active'));
    elements.views.practice.classList.add('view--active');
    state.currentView = 'practice';
}

function updateProviderInfo() {
    const providerId = elements.providerSelect.value;
    const info = PROVIDER_INFO[providerId];

    if (info) {
        elements.providerDescription.textContent = info.description;
        elements.providerLink.href = info.link;
    }
}

function toggleKeyVisibility() {
    const input = elements.apiKeyInput;
    if (input.type === 'password') {
        input.type = 'text';
        elements.toggleKeyVisibility.textContent = '🙈';
    } else {
        input.type = 'password';
        elements.toggleKeyVisibility.textContent = '👁️';
    }
}

// ============================================
// Keyboard Shortcuts
// ============================================

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        analyzeAnswer();
    }

    // Escape to close modals
    if (e.key === 'Escape') {
        if (elements.settingsModal.classList.contains('modal--active')) {
            closeSettingsModal();
        } else if (elements.modal.classList.contains('modal--active')) {
            hideModal();
        }
    }
}

// ============================================
// Start Application
// ============================================

document.addEventListener('DOMContentLoaded', init);
