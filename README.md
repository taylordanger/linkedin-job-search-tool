# LinkedIn Job Search URL Generator

A simple web tool to generate optimized LinkedIn job search URLs with advanced filtering options, including the F_TPR (Time Posted) parameter.

## Features

- **Time-based filtering** using LinkedIn's F_TPR parameter
  - Last minute (r60)
  - Last hour (r3600)
  - Last 24 hours (r86400)
  - Last week (r604800)
  - Last month (r2592000)

- **Advanced search filters**
  - Keywords and location search
  - Experience level filtering
  - Job type selection (Full-time, Part-time, Contract, etc.)
  - Remote jobs filter
  - Easy Apply filter

- **User-friendly interface**
  - Clean, modern design
  - One-click URL copying
  - Direct LinkedIn opening
  - Mobile responsive

## Usage

1. Open `index.html` in your browser
2. Fill in your search criteria
3. Select a time filter (F_TPR value)
4. Click "Generate URL"
5. Copy or open the generated LinkedIn search URL

## F_TPR Parameter

The F_TPR parameter filters LinkedIn job postings by time posted. Values are in seconds:

| Value | Time Range | Seconds |
|-------|------------|---------|
| r60 | Last minute | 60 |
| r3600 | Last hour | 3,600 |
| r86400 | Last 24 hours | 86,400 |
| r604800 | Last week | 604,800 |
| r2592000 | Last month | 2,592,000 |

## Tech Stack

- HTML5
- CSS3 (with modern gradients and animations)
- Vanilla JavaScript
- No external dependencies

## License

MIT License - Feel free to use and modify as needed.
