# AI-Powered Todo List

A modern, AI-enhanced todo list application that uses natural language processing to understand and organize your tasks. Built for the Peregian Digital Hub to demonstrate practical AI integration in web applications.

![App Screenshot](docs/screenshot.png)

## Features

- 🧠 Natural language task input ("Buy milk tomorrow at 9am")
- 🤖 AI-powered task parsing and categorization
- 📅 Smart date/time extraction
- 🎯 Automatic priority assignment
- ⏱️ Task duration estimation
- 📱 Responsive, modern UI

## Tech Stack

- Frontend: HTML, CSS, JavaScript, Bootstrap 5
- Backend: Python, Flask
- AI: OpenRouter API with openai/gpt-4o-mini
- Storage: JSON (with planned SQLite upgrade)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/chrisboden/cfbfeb25.git
   cd cfbfeb25
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the root directory:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   ```

4. Run the application:
   ```bash
   cd app
   python app.py
   ```

5. Open http://localhost:5000 in your browser

## Project Structure

```
app/
├── static/
│   ├── images/         # UI assets
│   └── js/            # Frontend JavaScript
├── templates/         # HTML templates
├── data/             # Task storage
├── app.py            # Main Flask application
└── ai_parser.py      # AI integration module
```

## Contributing

This is a demo project for the Peregian Digital Hub. Feel free to fork and experiment!

## Credits

- Mountain background photo by Kalen Emsley on Unsplash
- UI design inspired by modern task management apps

## License

MIT License - feel free to use this code for your own projects! 