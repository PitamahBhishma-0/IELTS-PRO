/**
 * Chart Renderer Service
 * Renders IELTS-style charts using Chart.js based on dataPoints
 */

let currentChart = null;

/**
 * Render a chart based on question data
 * @param {Object} question - Question object with type and dataPoints
 * @param {HTMLCanvasElement} canvas - Canvas element to render on
 * @returns {Object} Chart instance
 */
export function renderChart(question, canvas) {
    // Destroy existing chart if any
    if (currentChart) {
        currentChart.destroy();
    }

    const { type, dataPoints } = question;

    // Map question types to Chart.js chart types
    const chartTypeMap = {
        'Line Graph': 'line',
        'Bar Chart': 'bar',
        'Pie Chart': 'pie',
        'Table': 'bar', // Tables rendered as bar charts for visualization
        'Mixed Charts': 'bar'
    };

    const chartType = chartTypeMap[type] || 'bar';

    // Build chart configuration based on data structure
    const config = buildChartConfig(chartType, dataPoints, type);

    currentChart = new Chart(canvas, config);
    return currentChart;
}

/**
 * Build Chart.js configuration based on dataPoints
 * @param {string} chartType - Chart.js chart type
 * @param {Object} dataPoints - Data points from question
 * @param {string} questionType - Original question type
 * @returns {Object} Chart.js configuration
 */
function buildChartConfig(chartType, dataPoints, questionType) {
    const colors = [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
    ];

    const borderColors = colors.map(c => c.replace('0.8', '1'));

    // Handle different data structures
    if (dataPoints.series) {
        // Line graph or multi-series bar chart
        return {
            type: chartType,
            data: {
                labels: dataPoints.labels,
                datasets: dataPoints.series.map((s, i) => ({
                    label: s.name,
                    data: s.values,
                    backgroundColor: colors[i % colors.length],
                    borderColor: borderColors[i % borderColors.length],
                    borderWidth: 2,
                    tension: 0.3,
                    fill: chartType === 'line' ? false : true
                }))
            },
            options: getChartOptions(questionType)
        };
    } else if (dataPoints.values) {
        // Simple bar chart with single series
        return {
            type: chartType,
            data: {
                labels: dataPoints.labels,
                datasets: [{
                    label: 'Value',
                    data: dataPoints.values,
                    backgroundColor: colors[0],
                    borderColor: borderColors[0],
                    borderWidth: 2
                }]
            },
            options: getChartOptions(questionType)
        };
    } else if (dataPoints.year1995 && dataPoints.year2005) {
        // Pie chart comparison (two years)
        return {
            type: 'pie',
            data: {
                labels: Object.keys(dataPoints.year1995),
                datasets: [{
                    label: '1995',
                    data: Object.values(dataPoints.year1995),
                    backgroundColor: colors,
                    borderColor: borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: 'Energy Production Sources (1995)'
                    }
                }
            }
        };
    } else if (dataPoints.categories && dataPoints.countryA && dataPoints.countryB) {
        // Table comparison (two countries)
        return {
            type: 'bar',
            data: {
                labels: dataPoints.categories,
                datasets: [
                    {
                        label: 'Country A',
                        data: dataPoints.countryA,
                        backgroundColor: colors[0],
                        borderColor: borderColors[0],
                        borderWidth: 2
                    },
                    {
                        label: 'Country B',
                        data: dataPoints.countryB,
                        backgroundColor: colors[1],
                        borderColor: borderColors[1],
                        borderWidth: 2
                    }
                ]
            },
            options: getChartOptions(questionType)
        };
    } else if (dataPoints.globalShare && dataPoints.trends) {
        // Mixed charts
        return {
            type: 'bar',
            data: {
                labels: Object.keys(dataPoints.globalShare),
                datasets: [{
                    label: 'Global Share (%)',
                    data: Object.values(dataPoints.globalShare),
                    backgroundColor: colors[0],
                    borderColor: borderColors[0],
                    borderWidth: 2
                }]
            },
            options: getChartOptions(questionType)
        };
    } else if (dataPoints.months) {
        // Climate comparison with multiple datasets
        return {
            type: 'line',
            data: {
                labels: dataPoints.months,
                datasets: [
                    {
                        label: 'London Temp (°C)',
                        data: dataPoints.londonTemp,
                        borderColor: colors[0],
                        backgroundColor: colors[0].replace('0.8', '0.2'),
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Sydney Temp (°C)',
                        data: dataPoints.sydneyTemp,
                        borderColor: colors[1],
                        backgroundColor: colors[1].replace('0.8', '0.2'),
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: 'y'
                    },
                    {
                        label: 'London Rain (mm)',
                        data: dataPoints.londonRain,
                        borderColor: colors[2],
                        backgroundColor: colors[2].replace('0.8', '0.2'),
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Sydney Rain (mm)',
                        data: dataPoints.sydneyRain,
                        borderColor: colors[3],
                        backgroundColor: colors[3].replace('0.8', '0.2'),
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Rainfall (mm)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        };
    }

    // Fallback for process diagrams and maps
    return {
        type: 'bar',
        data: {
            labels: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
            datasets: [{
                label: 'Process',
                data: [25, 25, 25, 25],
                backgroundColor: colors[0],
                borderColor: borderColors[0],
                borderWidth: 2
            }]
        },
        options: getChartOptions(questionType)
    };
}

/**
 * Get common chart options
 * @param {string} questionType - Question type for customization
 * @returns {Object} Chart options
 */
function getChartOptions(questionType) {
    return {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top'
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Percentage / Value'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Category / Time'
                }
            }
        }
    };
}

/**
 * Get chart data as text description for AI prompt
 * @param {Object} question - Question object with dataPoints
 * @returns {string} Text description of chart data
 */
export function getChartDataDescription(question) {
    const { type, dataPoints } = question;

    let description = `Chart Type: ${type}\n`;

    if (dataPoints.series) {
        description += `Time Period: ${dataPoints.labels.join(' → ')}\n`;
        description += `Data Series:\n`;
        dataPoints.series.forEach(s => {
            description += `  - ${s.name}: ${s.values.join(', ')}\n`;
        });
    } else if (dataPoints.values) {
        description += `Categories: ${dataPoints.labels.join(', ')}\n`;
        description += `Values: ${dataPoints.values.join(', ')}\n`;
    } else if (dataPoints.year1995 && dataPoints.year2005) {
        description += `1995 Data: ${JSON.stringify(dataPoints.year1995)}\n`;
        description += `2005 Data: ${JSON.stringify(dataPoints.year2005)}\n`;
    } else if (dataPoints.categories && dataPoints.countryA && dataPoints.countryB) {
        description += `Categories: ${dataPoints.categories.join(', ')}\n`;
        description += `Country A: ${dataPoints.countryA.join(', ')}\n`;
        description += `Country B: ${dataPoints.countryB.join(', ')}\n`;
    } else if (dataPoints.months) {
        description += `Months: ${dataPoints.months.join(', ')}\n`;
        description += `London Temperature: ${dataPoints.londonTemp.join(', ')}\n`;
        description += `Sydney Temperature: ${dataPoints.sydneyTemp.join(', ')}\n`;
        description += `London Rainfall: ${dataPoints.londonRain.join(', ')}\n`;
        description += `Sydney Rainfall: ${dataPoints.sydneyRain.join(', ')}\n`;
    }

    return description;
}

/**
 * Check if a question type supports chart rendering
 * @param {string} type - Question type
 * @returns {boolean} True if chart can be rendered
 */
export function supportsChart(type) {
    const supportedTypes = ['Line Graph', 'Bar Chart', 'Pie Chart', 'Table', 'Mixed Charts'];
    return supportedTypes.includes(type);
}

/**
 * Check if a question type has a data description (maps, process diagrams)
 * @param {string} type - Question type
 * @returns {boolean} True if has data description
 */
export function hasDataDescription(type) {
    const typesWithDescription = ['Process Diagram', 'Map'];
    return typesWithDescription.includes(type);
}
