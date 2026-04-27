# IELTS Writing Pro

A production-grade IELTS Academic Writing practice application with real-time analysis, comprehensive learning materials, and progress tracking.

## Features

### Practice Mode
- **Task 1 (Academic)**: Line graphs, bar charts, pie charts, tables, process diagrams, and maps with visual references
- **Task 2 (Essay)**: Opinion, discussion, problem/solution, advantages/disadvantages, two-part, and direct question essays
- **Real-time Analysis**: Instant feedback on your writing as you type
- **Timer**: Built-in countdown timer (20 min for Task 1, 40 min for Task 2)
- **Word Count**: Live word count with progress indicator

### Analysis Features
- **Band Score Estimation**: Scores for Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range
- **Detailed Feedback**: Specific suggestions for improvement
- **Statistics**: Word count, sentence count, paragraph count, linking words used, academic vocabulary used
- **Visual Score Bars**: Easy-to-read score visualization

### Learning Mode
- Comprehensive templates for all question types
- Key vocabulary and linking words
- Example sentences and structures
- Band 7+ tips and strategies

### History & Progress
- Track all your practice essays
- View average scores
- Review past attempts
- Statistics by task type

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (for development server only)

### Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd ielts-pro
   ```

### Running the Application

#### Option 1: Using Node.js (Recommended)
```bash
npm install
npm run dev
```
The application will be available at `http://localhost:8080`

#### Option 2: Direct File Access
Simply open `index.html` in your web browser.

## Project Structure

```
ielts-pro/
├── index.html              # Main HTML file
├── package.json            # Project configuration
├── README.md              # This file
├── src/
│   ├── app.js             # Main application logic
│   ├── components/        # Reusable components (future)
│   ├── services/          # Business logic
│   │   ├── analysisService.js    # Text analysis and scoring
│   │   └── questionService.js    # Question generation
│   └── utils/             # Utility functions
│       ├── debounce.js           # Debounce/throttle functions
│       └── storage.js            # LocalStorage wrapper
└── styles/
    └── main.css          # Application styles
```

## Usage

### Practice Mode
1. Select Task 1 or Task 2
2. Click "Generate Question" to get a new question
3. Start the timer when ready
4. Write your answer in the text area
5. Click "Analyze Answer" for detailed feedback

### Learning Mode
1. Click the "Learning" tab
2. Select a topic from the sidebar
3. Study the templates and examples
4. Apply what you've learned in Practice mode

### History
1. Click the "History" tab
2. View your past essays and scores
3. Click on any entry to review it

## Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Analyze your answer
- `Escape`: Close modal dialogs

## Browser Compatibility

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+

## Data Storage

All data is stored locally in your browser's LocalStorage. No data is sent to external servers.

## Scoring System

The application provides estimated band scores based on:
- Word count and structure
- Use of linking words
- Academic vocabulary usage
- Sentence variety and complexity
- Paragraph organization

**Note**: These are estimates. Actual IELTS scores are determined by certified examiners.

## License

MIT License - feel free to use this for personal study or educational purposes.

## Contributing

This is a personal project for IELTS preparation. Suggestions and improvements are welcome!

## Acknowledgments

- IELTS is a registered trademark of University of Cambridge ESOL, the British Council, and IDP Education Australia.
- This application is not affiliated with or endorsed by any IELTS organization.
