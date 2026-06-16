# Google News CLI

A Node.js command-line tool to fetch and display the latest news from Google News directly in your terminal.

## Features

- 📰 Fetch top stories from Google News
- 🔍 Search news by keyword
- 📂 Filter news by topic (World, Technology, Business, Sports, etc.)
- 🎨 Beautiful colored terminal output
- 🔗 Display full URLs for news articles
- ⚙️ Customizable result limits

## Installation

1. Clone or download this project
2. Install dependencies:

```bash
npm install
```

## Usage

### Basic command

```bash
node cli.js
```

Fetches the top 10 latest news stories.

### Options

| Option | Alias | Description | Example |
|--------|-------|-------------|---------|
| `-s, --search <query>` | Search for news by keyword | Search Google News for a query | `node cli.js -s "AI"` |
| `-t, --topic <topic>` | Filter by topic | Show news for a specific category | `node cli.js -t technology` |
| `-l, --limit <number>` | Limit results (max 100) | Restrict number of articles returned | `node cli.js -l 20` |
| `-u, --url` | Show full URLs | Display article links in output | `node cli.js -u` |
| `-h, --help` | Display help message | Show CLI usage information | `node cli.js -h` |

### Available Topics

- `world`
- `nation`
- `business`
- `technology`
- `entertainment`
- `sports`
- `science`
- `health`

### Examples

```bash
# Fetch technology news (limit 5)
node cli.js -t technology -l 5

# Search for "artificial intelligence"
node cli.js -s "artificial intelligence"

# Get business news with full URLs
node cli.js -t business -u

# Top 15 stories
node cli.js -l 15
```

## Project Structure

```
01_Project/
├── cli.js              # Main CLI application
├── package.json        # Project dependencies
├── demo_bad_code.py    # Example of code issues
└── README.md           # This file
```

## Dependencies

- **rss-parser**: Parses RSS feeds
- **minimist**: Command-line argument parser
- **picocolors**: Terminal color output

## License

MIT
