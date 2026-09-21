# AFX Regex Tester

> A fast, modern regular-expression playground built with **vanilla JavaScript** for testing patterns, inspecting matches, experimenting with replacement strings, and learning regex without leaving the browser.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=000)
![HTML5](https://img.shields.io/badge/HTML5-Frontend-e34f26?style=for-the-badge&logo=html5&logoColor=fff)
![CSS3](https://img.shields.io/badge/CSS3-Responsive-1572b6?style=for-the-badge&logo=css3&logoColor=fff)
![License](https://img.shields.io/badge/License-MIT-ff3448?style=for-the-badge)

## Why AFX Regex Tester?

Regex is powerful, but debugging patterns inside a project can interrupt your workflow. AFX Regex Tester provides a focused browser-based workspace where every change is evaluated instantly.

## Features

- Live JavaScript regex matching
- Match highlighting inside the test string
- Match count, capture-group count, character count, and execution timing
- Support for JavaScript regex flags: `g`, `i`, `m`, `s`, `u`, `y`, `d`, and `v` where supported by the browser
- Match inspector with match index and capture groups
- Replacement preview with native JavaScript replacement syntax such as `$&`, `$1`, `$2`
- Ready-to-use presets for email, URL, IPv4, colors, phone numbers, dates, HTML tags, and hashtags
- Local pattern history using `localStorage`
- Shareable URL state for patterns, flags, test strings, and replacement values
- Built-in regex cheat sheet
- Fully responsive dark developer UI
- Zero backend and zero framework dependencies

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Web APIs: `RegExp`, `URLSearchParams`, `localStorage`, Clipboard API, Performance API

## Project Structure

```text
AFX-Regex-Tester/
├── index.html
├── styles.css
├── app.js
├── favicon.svg
├── netlify.toml
├── .gitignore
├── LICENSE
└── README.md
```

## Run Locally

No build tools are required.

### Option 1 — Open directly

Open `index.html` in a modern browser.

### Option 2 — VS Code Live Server

1. Open the folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

### Option 3 — Python local server

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Deploy

### GitHub Pages

1. Push this project to a GitHub repository.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Select the `main` branch and `/root` folder.
5. Save.

### Netlify

Drag the project folder into Netlify Drop or connect the GitHub repository. No build command is required.

## Example Pattern

```regex
\b[A-Z][a-z]+\b
```

With the global flag enabled, this matches capitalized words such as `Arfan`, `JavaScript`, `Rahul`, and `Priya` when they fit the pattern.

## Keyboard Shortcut

`Ctrl + Enter` / `Cmd + Enter` saves the current pattern to local history.

## Browser Compatibility

Core regex testing works in modern Chromium, Firefox, and Safari browsers. Newer flags such as `v` may depend on browser support.

## Roadmap

- Named capture-group visualization
- Regex explanation mode
- Export/import test cases
- Regex benchmark mode
- Unit-test generator
- Theme selector

## Author

**Shaik Arfan**  
AI Developer · Frontend Developer · UI/UX Designer

Built under the **AFX** developer-tool ecosystem.

## License

This project is available under the [MIT License](LICENSE).
