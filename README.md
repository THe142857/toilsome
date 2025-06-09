# AI Workday Optimizer

A modern web application that helps users identify toilsome tasks that AI could handle, freeing them up for higher-value activities. Built with vanilla JavaScript, Tailwind CSS, and featuring AI-powered analysis.

##  Features

- **Schedule Input**: Easy-to-use interface for plotting your workday activities
- **AI Analysis**: Intelligent analysis of your workday to identify inefficiencies
- **Automation Recommendations**: Specific tool suggestions and implementation guides
- **Time Tracking**: Visual representation of productive vs. non-productive time
- **Responsive Design**: Works seamlessly on desktop and mobile devices

##  Prerequisites

- A modern web browser
- Optional: OpenAI API key for enhanced AI analysis (falls back to rule-based analysis)

##  Installation

1. Clone this repository:
```bash
git clone https://github.com/THe142857/ai-workday-optimizer.git
cd ai-workday-optimizer
```

2. Add your favicon:
   - Place a `favicon.png` file in the root directory

3. (Optional) Configure API key:
   - Open `script.js`
   - Replace the `apiKey` variable with your OpenAI API key

4. Open `index.html` in your web browser
   
##  File Structure

```
ai-workday-optimizer/
├── index.html          # Main HTML structure
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
├── favicon.png         # Site favicon
└── README.md           # This file
```

##  Usage

1. **Add Activities**: Input your work activities with start times, end times, and categories
2. **Review Schedule**: See your activities organized chronologically
3. **AI Analysis**: Click "Unleash AI Analysis" to get productivity insights
4. **Automation Guide**: Use "Automate For Me" for detailed implementation steps

##  Activity Categories

- **Deep Work**: Focused, high-value tasks
- **Meetings**: Team meetings and calls
- **Admin Tasks**: Administrative work
- **Monotonous Tasks**: Repetitive activities
- **Distractions**: Non-productive time
- **Breaks**: Rest periods
- **Commute**: Travel time

##  AI Features

The app provides two levels of analysis:

1. **API-based Analysis**: Uses OpenAI's GPT models for sophisticated insights
2. **Fallback Analysis**: Rule-based system that works without an API key

Both systems provide:
- Efficiency problem identification
- AI automation opportunities
- Specific tool recommendations
- Implementation guides
- ROI calculations

 # Customization

### Styling
- Edit `styles.css` to modify colors, animations, and layout
- Uses Tailwind CSS for utility classes

### Functionality
- Modify `script.js` to add new features or change analysis logic
- Add new activity categories in the `categories` object

##  Links

- **Twitter**: [@toilsomeapp](https://x.com/toilsomeapp)
- **GitHub**: [THe142857](https://github.com/THe142857)

##  License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
