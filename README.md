# Cognitive Contribution Label (CCL)

*A transparent tool to document how much AI contributed to your project — inspired by Creative Commons.*

[![CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

---

## What is CCL?

The CCL helps students, researchers, and creators transparently document the role of artificial intelligence across all stages of their creative process. Inspired by the spirit of Creative Commons, the CCL promotes honest reflection, responsible use of AI, and clarity in collaborative, tech-assisted creation.

The CCL is not an audit — it's a **reflective practice**. The process of honest self-assessment is as valuable as the label itself.

---

## CCL v2 — AI-first + Human-first

**[→ Open CCL Generator v2](generator_v2.html)**

v2 introduces two complementary perspectives:

### AI-first
Rate AI involvement across **8 project phases** (0–4):

| Code | Phase |
|------|-------|
| R | Research & References |
| I | Ideation |
| D | Design |
| C | Coding / Programming |
| P | Prototyping / Making |
| O | Documentation |
| M | Project Management |
| F | Reflection & Feedback |

### Human-first
Rate your irreplaceable contribution across **6 maker dimensions** (0–4):

| Code | Dimension | Grounded in |
|------|-----------|-------------|
| E | Lived Experience | Haraway, Kolb |
| L | Local Knowledge | Geertz, Rudofsky |
| R | Relationship | Lave & Wenger |
| B | Body & Making | Polanyi, Merleau-Ponty |
| K | Technical Risk | David Pye — workmanship of risk |
| J | Judgment | Schön, phronesis |

### Authorship Archetypes (Both mode)
Combine both scores to get your archetype:

| Archetype | AI | Human |
|-----------|----|-------|
| **Augmented** | High | High |
| **Delegated** | High | Low |
| **Craft** | Low | High |
| **Routine** | Low | Low |

---

## CCL v1 — AI-first only

**[→ Open CCL Generator v1](generator.html)**

The original generator: 8 phases, AI-first only. Still available and maintained.

---

## Supported Languages

| Code | Language |
|------|----------|
| EN | English |
| ES | Español |
| CA | Català |
| PT | Português |
| FR | Français |
| DE | Deutsch |

---

## Project Structure

```
ccl/
├── generator_v2.html   # CCL v2 generator (AI-first + Human-first)
├── script_v2.js        # v2 JavaScript logic
├── config.example.js   # Template for Google Sheets config (copy → config.js)
├── appscript_v2.gs     # Google Apps Script for Sheets backend (v2)
├── generator.html      # CCL v1 generator (AI-first)
├── script.js           # v1 JavaScript logic
├── i18n.js             # v1 translations
├── styles.css          # v1 styles
├── index.html          # Project home page
└── README.md
```

---

## Setup — Google Sheets integration

Both v1 and v2 save labels to a shared Google Sheet and display a live counter.

1. Create a Google Sheet
2. Go to **Extensions → Apps Script**
3. Paste the contents of `appscript_v2.gs`
4. Click **Deploy → New deployment** → Web App
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment URL
6. For local development: copy `config.example.js` → `config.js` and paste your URL
7. For production (GitHub Pages): the URL is already set as a fallback in `script_v2.js`

> `config.js` is in `.gitignore` — never commit it.

---

## Deploy on GitHub Pages

1. Fork this repository
2. Go to **Settings → Pages**
3. Source: **Deploy from branch** → `main` / `root`
4. Your site: `https://<your-username>.github.io/ccl/`

---

## License

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — Creative Commons Attribution-NonCommercial-ShareAlike 4.0

Original concept and design by [Santi Fuentemilla](https://github.com/santifu) at [Fab Lab Barcelona](https://fablabbcn.org/) / IAAC.
