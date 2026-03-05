# Cognitive Contribution Label (CCL)

*A simple tool for declaring how much AI contributed to your project.*

[![CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Description

The Cognitive Contribution Label (CCL) helps students, researchers, and creators transparently document the role of artificial intelligence across all stages of their creative process. Inspired by the spirit of Creative Commons, the CCL promotes honest reflection, responsible use of AI, and clarity in collaborative, tech-assisted creation.

## 🏷️ Why use CCL?
- Foster accountability in AI-supported education and research.
- Communicate clearly and ethically in a world of hybrid authorship.
- Encourage critical thinking and self-assessment of your creative process.

## 🌍 Supported Languages

This fork adds full multilingual support. The interface changes completely when switching languages:

| Code | Language   |
|------|------------|
| EN   | English    |
| ES   | Español    |
| CA   | Català     |
| PT   | Português  |
| FR   | Français   |
| DE   | Deutsch    |

The selected language is remembered across sessions via `localStorage`.

## Features

- Select how much AI was involved (0 to 4) in each of 8 project phases.
- Generate a clear, shareable summary of AI involvement.
- Create a personalized CCL badge that visualizes the contribution across the full process.
- Download the badge as a PNG image.
- Copy the CCL summary to clipboard.
- Full multilingual support (EN / ES / CA / PT / FR / DE).

## Project Structure

```
ccl/
├── index.html      # Home page describing the project
├── generator.html  # CCL Label generator interface
├── styles.css      # CSS styles for the project
├── script.js       # JavaScript logic for the CCL generator
├── i18n.js         # All translations and language switching logic
└── README.md       # This file
```

## 🚀 Deploy on GitHub Pages

### Option 1 — Deploy from your own fork (recommended)

1. **Fork** this repository on GitHub (click the Fork button top-right).
2. Go to your fork → **Settings** → **Pages**.
3. Under *Source*, select **Deploy from a branch**.
4. Choose branch: `main`, folder: `/ (root)`.
5. Click **Save**.
6. Your site will be live at:
   ```
   https://<your-username>.github.io/ccl/
   ```

### Option 2 — Create a new repository

1. Create a new public repository on GitHub (e.g. `ccl`).
2. Clone it locally:
   ```bash
   git clone https://github.com/<your-username>/ccl.git
   cd ccl
   ```
3. Copy all project files into the folder.
4. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
5. Go to **Settings** → **Pages** → set source to `main` / `root`.
6. Done — live at `https://<your-username>.github.io/ccl/`.

### Option 3 — GitHub CLI

```bash
gh repo create ccl --public --source=. --remote=origin --push
```
Then enable Pages in repository Settings.

---

## How to Use

1. Open `index.html` to learn about the project.
2. Navigate to the CCL Generator.
3. Select your language using the buttons in the top bar.
4. Fill in your project title and name.
5. Use the sliders to indicate the level of AI involvement in each phase.
6. Download the CCL badge or copy the summary for your records.

## Adding a New Language

To add a new language, open `i18n.js` and add a new entry to the `TRANSLATIONS` object following the same structure as the existing languages. Then add a button in the `lang-bar` div in both `index.html` and `generator.html`.

## License

This project is licensed under the [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.

CCL AI D1 C4 U1 – v1.0 — AI contributed as Drafting Assistant in Design and Documentation, AI acted as AI-led in Coding. All other phases were fully human-led.

Original concept and design by [Santi Fuentemilla](https://github.com/santifu) at [Fab Lab Barcelona](https://fablabbcn.org/).



