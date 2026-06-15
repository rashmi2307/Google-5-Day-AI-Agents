# BigQuery Release Pulse ⚡

A sleek, responsive dashboard and social sharing composer built using **Python Flask**, vanilla **HTML5**, **JavaScript (ES6)**, and custom **CSS3**.

The application fetches, parses, and formats the latest BigQuery release notes, allowing you to filter updates, search for features, and instantly compose and customize Tweets/posts for **X (Twitter)** using optimized text intents.

---

## Key Features

1. **Live XML Feed Fetching & Parsing**: Pulls data directly from the official Google Cloud BigQuery release notes feed (`https://docs.cloud.google.com/feeds/bigquery-release-notes.xml`).
2. **Granular Update Splitting**: Automatically splits compound daily feed entries into separate, individual cards by their change type (`Feature`, `Change`, `Breaking`, `Announcement`, `Issue`, `Update`) for easy tracking and sharing.
3. **Advanced Filtering & Search**:
   - Filter updates dynamically by category (Features, Changes, Breaking, Announcements).
   - Real-time instant search matching keywords in content text, update dates, or types.
4. **Interactive Tweet Composer**:
   - Select any update card to automatically load it into the Composer.
   - Customized templates prepended with release-type emojis (e.g. 🚀, 🔄, ⚠️).
   - Live character counter displaying warnings (>240 chars) and error limits (>280 chars).
   - **✨ Auto-Shorten** capability: One-click truncation to automatically fit X's 280-character limit while preserving critical metadata (date, type, and source link).
   - Copy to Clipboard with temporary checkmark confirmation.
   - direct share intent to post on **X / Twitter**.
5. **Modern, Responsive UI/UX**:
   - Cyberpunk-inspired premium dark theme with custom gradients, glowing indicators, and micro-interactions.
   - Glassmorphic card styling and responsive CSS Grid design.
   - Dynamic **Skeleton Screen Loading** for page refreshes.

---

## Project Structure

```text
02_CLI_Project/
│
├── app.py                  # Flask web server & feed parsing backend
├── README.md               # Documentation
├── venv/                   # Python virtual environment
│
├── templates/
│   └── index.html          # Web dashboard layout
│
└── static/
    ├── style.css           # Custom stylesheets (dark theme, animations, widgets)
    └── app.js              # State management, fetch controller, search/filters, composer logic
```

---

## Installation & Running Locally

### 1. Prerequisites
- **Python 3.10 or higher** installed.

### 2. Setup Virtual Environment & Install Dependencies
From the project root directory, run the following commands:

**Windows (PowerShell):**
```powershell
# Create a virtual environment (if not already created)
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\Activate.ps1

# Install Flask, Requests, and BeautifulSoup4
pip install flask requests beautifulsoup4
```

**macOS/Linux:**
```bash
# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install flask requests beautifulsoup4
```

### 3. Run the Flask Server
Run the Flask server by running:
```powershell
python app.py
```

By default, the application will start in debug mode on **`http://127.0.0.1:5000`**. Open this URL in any modern web browser to view the application.

---

## Technologies Used
- **Backend**: Python, Flask, `xml.etree.ElementTree`, `requests`, `BeautifulSoup4`
- **Frontend**: HTML5, Vanilla CSS3 (Custom Variables, Flexbox, Grid, Keyframe Animations), Vanilla JavaScript (ES6, Fetch API)
