/**
 * Question Service
 * Generates Academic IELTS questions with image support for Task 1
 */

// Academic Task 1 Questions with Image References
const ACADEMIC_TASK_1_QUESTIONS = [
    {
        type: 'Line Graph',
        category: 'Trends Over Time',
        question: 'The line graph shows the percentage of people in a UK city who used the internet for different purposes (communication, entertainment, shopping, and work) between 2007 and 2017. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
        imageUrl: 'https://placehold.co/600x300/667eea/ffffff?text=Line+Graph%3A+Internet+Usage+2007-2017',
        imageCaption: 'Figure 1: Internet usage patterns in a UK city (2007-2017)',
        dataPoints: {
            labels: ['2007', '2010', '2013', '2017'],
            series: [
                { name: 'Communication', values: [45, 65, 78, 85] },
                { name: 'Entertainment', values: [30, 50, 65, 75] },
                { name: 'Shopping', values: [15, 35, 55, 70] },
                { name: 'Work', values: [20, 40, 50, 60] }
            ]
        }
    },
    {
        type: 'Bar Chart',
        category: 'Comparisons',
        question: 'The bar chart illustrates the number of visitors (in millions) to four different museums in London (British Museum, Tate Modern, National Gallery, and Victoria & Albert) in 2018. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
        imageUrl: 'https://placehold.co/600x300/764ba2/ffffff?text=Bar+Chart%3A+Museum+Visitors+2018',
        imageCaption: 'Figure 2: Annual visitors to London museums (2018)',
        dataPoints: {
            labels: ['British Museum', 'Tate Modern', 'National Gallery', 'V&A'],
            values: [5.9, 5.7, 5.2, 3.9]
        }
    },
    {
        type: 'Pie Chart',
        category: 'Proportions',
        question: 'The pie charts show the main sources of energy production in a country in 1995 and 2005. The sources include coal, natural gas, oil, nuclear, and renewable energy. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
        imageUrl: 'https://placehold.co/600x300/22c55e/ffffff?text=Pie+Charts%3A+Energy+Production+1995+vs+2005',
        imageCaption: 'Figure 3: Energy production sources comparison (1995 vs 2005)',
        dataPoints: {
            year1995: { coal: 40, gas: 20, oil: 25, nuclear: 10, renewable: 5 },
            year2005: { coal: 25, gas: 30, oil: 20, nuclear: 15, renewable: 10 }
        }
    },
    {
        type: 'Table',
        category: 'Numerical Data',
        question: 'The table shows the percentage of household income spent on five different categories (housing, food, transport, entertainment, and savings) in two different countries (Country A and Country B) in 2010. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
        imageUrl: 'https://placehold.co/600x300/f59e0b/ffffff?text=Table%3A+Household+Spending+2010',
        imageCaption: 'Figure 4: Household income expenditure by category (2010)',
        dataPoints: {
            categories: ['Housing', 'Food', 'Transport', 'Entertainment', 'Savings'],
            countryA: [35, 20, 15, 10, 20],
            countryB: [25, 15, 20, 15, 25]
        }
    },
    {
        type: 'Process Diagram',
        category: 'How Something Works',
        question: 'The diagram shows the process of recycling plastic bottles, from collection to the production of new products. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
        imageUrl: 'https://placehold.co/600x400/ef4444/ffffff?text=Process+Diagram%3A+Plastic+Bottle+Recycling',
        imageCaption: 'Figure 5: Plastic bottle recycling process',
        dataDescription: `
            Process Steps:
            1. Collection & Sorting: Plastic bottles collected from recycling centers and sorted by type/color
            2. Cleaning & Shredding: Bottles cleaned to remove labels/contaminants, then shredded into small flakes
            3. Melting & Pelletizing: Flakes melted at high temperature and formed into small pellets
            4. Manufacturing New Products: Pellets used to create new plastic products (bottles, containers, textiles)
        `,
        steps: [
            'Collection & Sorting',
            'Cleaning & Shredding',
            'Melting & Pelletizing',
            'Manufacturing New Products'
        ]
    },
    {
        type: 'Map',
        category: 'Changes Over Time',
        question: 'The maps show the development of a coastal town between 1995 and the present day. The developments include new housing, commercial areas, and infrastructure changes. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
        imageUrl: 'https://placehold.co/600x400/667eea/ffffff?text=Maps%3A+Coastal+Town+Development+1995+vs+Present',
        imageCaption: 'Figure 6: Coastal town development (1995 vs present)',
        dataDescription: `
            1995 Map:
            - Small fishing village with harbor in the south
            - Few houses scattered along the coastline
            - Single main road running east-west
            - Small beach area in the southeast
            - No commercial buildings

            Present Map:
            - New residential area developed in the north (50+ houses)
            - Shopping center built in the center of town
            - Road network expanded with new roads connecting all areas
            - Beach promenade added along the coastline
            - New hotel and restaurant area near the beach
            - Harbor expanded with additional docks
        `,
        changes: [
            'New residential area in the north',
            'Shopping center built in the center',
            'Road network expanded',
            'Beach promenade added'
        ]
    },
    {
        type: 'Mixed Charts',
        category: 'Combined Data',
        question: 'The charts show information about coffee production in Brazil, Colombia, and Vietnam. The pie chart shows the percentage of global production, while the bar chart shows production trends over five years. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
        imageUrl: 'https://placehold.co/600x400/764ba2/ffffff?text=Mixed+Charts%3A+Coffee+Production',
        imageCaption: 'Figure 7: Coffee production by country (global share & trends)',
        dataPoints: {
            globalShare: { brazil: 35, colombia: 15, vietnam: 20, others: 30 },
            trends: {
                brazil: [50, 52, 55, 58, 60],
                colombia: [12, 13, 14, 15, 15],
                vietnam: [15, 18, 20, 22, 25]
            }
        }
    },
    {
        type: 'Line Graph',
        category: 'Trends Over Time',
        question: 'The line graph compares the average monthly temperatures and rainfall in two cities (London and Sydney) throughout the year. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
        imageUrl: 'https://placehold.co/600x300/22c55e/ffffff?text=Line+Graph%3A+Climate+Comparison+London+vs+Sydney',
        imageCaption: 'Figure 8: Climate comparison: London vs Sydney',
        dataPoints: {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            londonTemp: [5, 6, 9, 12, 15, 18, 20, 19, 17, 13, 9, 6],
            sydneyTemp: [23, 23, 22, 19, 16, 14, 13, 14, 16, 18, 20, 22],
            londonRain: [50, 40, 35, 40, 45, 45, 40, 45, 50, 70, 60, 55],
            sydneyRain: [80, 100, 90, 70, 60, 50, 50, 50, 60, 70, 70, 70]
        }
    }
];

// Load Task 2 questions from JSON file
let ACADEMIC_TASK_2_QUESTIONS = [];

async function loadTask2Questions() {
    try {
        const response = await fetch('/src/data/task2-questions.json');
        const data = await response.json();
        ACADEMIC_TASK_2_QUESTIONS = data.questions || [];
    } catch (error) {
        console.error('Failed to load Task 2 questions:', error);
        // Fallback to hardcoded questions if JSON fails to load
        ACADEMIC_TASK_2_QUESTIONS = [
            {
                type: 'Opinion Essay',
                category: 'Social Issues',
                question: 'Some people think that strict punishments for driving offenses are the only way to reduce traffic accidents. To what extent do you agree or disagree?'
            },
            {
                type: 'Discussion Essay',
                category: 'Education',
                question: 'Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others argue that university should focus on academic knowledge regardless of its use in the workplace. Discuss both views and give your own opinion.'
            },
            {
                type: 'Problem/Solution',
                category: 'Crime',
                question: 'In many countries, the level of crime is increasing. What are the causes of this problem and what can be done to solve it?'
            },
            {
                type: 'Advantages/Disadvantages',
                category: 'Education',
                question: 'Some people think that it is better to educate boys and girls in separate schools. Others, however, believe that mixed schools are better. Discuss the advantages and disadvantages of both approaches.'
            },
            {
                type: 'Two-Part Question',
                category: 'Work-Life Balance',
                question: 'Many people work long hours, leaving very little time for leisure. Why is this happening? Is this a positive or negative development?'
            },
            {
                type: 'Direct Question',
                category: 'Leadership',
                question: 'What do you think are the most important qualities of a good leader? How can these qualities be developed?'
            }
        ];
    }
}

// Initialize by loading questions
loadTask2Questions();

/**
 * Get a random Task 1 question (Academic only)
 *
 * @returns {Object} Question object with type, text, and image
 */
export function getTask1Question() {
    const index = Math.floor(Math.random() * ACADEMIC_TASK_1_QUESTIONS.length);
    return { ...ACADEMIC_TASK_1_QUESTIONS[index], task: 1 };
}

/**
 * Get a random Task 2 question (Academic only)
 *
 * @returns {Object} Question object with type and text
 */
export function getTask2Question() {
    const index = Math.floor(Math.random() * ACADEMIC_TASK_2_QUESTIONS.length);
    return { ...ACADEMIC_TASK_2_QUESTIONS[index], task: 2 };
}

/**
 * Get a question by task type
 *
 * @param {number} task - Task number (1 or 2)
 * @returns {Object} Question object
 */
export function getQuestion(task) {
    if (task === 1) {
        return getTask1Question();
    }
    return getTask2Question();
}

/**
 * Get all available question types for a task
 *
 * @param {number} task - Task number (1 or 2)
 * @returns {Array<string>} Array of question types
 */
export function getQuestionTypes(task) {
    if (task === 1) {
        return [...new Set(ACADEMIC_TASK_1_QUESTIONS.map(q => q.type))];
    }
    return [...new Set(ACADEMIC_TASK_2_QUESTIONS.map(q => q.type))];
}

/**
 * Get questions by type
 *
 * @param {number} task - Task number (1 or 2)
 * @param {string} type - Question type
 * @returns {Array<Object>} Array of questions
 */
export function getQuestionsByType(task, type) {
    if (task === 1) {
        return ACADEMIC_TASK_1_QUESTIONS.filter(q => q.type === type);
    }
    return ACADEMIC_TASK_2_QUESTIONS.filter(q => q.type === type);
}

/**
 * Get question by type (random from that type)
 *
 * @param {number} task - Task number (1 or 2)
 * @param {string} type - Question type
 * @returns {Object|null} Question object or null if not found
 */
export function getQuestionByType(task, type) {
    const questions = getQuestionsByType(task, type);
    if (questions.length === 0) return null;
    const index = Math.floor(Math.random() * questions.length);
    return { ...questions[index], task };
}
