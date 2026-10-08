<div align="center">

# ⚡ ziara-lead-scrapper

**Zero-config Google Maps lead scraper CLI. No Docker. No Python. No paid APIs.**

[![npm version](https://img.shields.io/npm/v/ziara-lead-scrapper?color=cyan&style=flat-square)](https://www.npmjs.com/package/ziara-lead-scrapper)
[![npm downloads](https://img.shields.io/npm/dm/ziara-lead-scrapper?color=blue&style=flat-square)](https://www.npmjs.com/package/ziara-lead-scrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Chromium-45ba4b?style=flat-square&logo=playwright)](https://playwright.dev/)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor%20on%20GitHub-%E2%9D%A4-pink?style=flat-square&logo=github-sponsors)](https://github.com/sponsors/Aquil1401)

<p align="center">
  <a href="#-quickstart-zero-install">Quickstart</a> •
  <a href="#-features">Features</a> •
  <a href="#️-options">Options</a> •
  <a href="#-output-fields">Output Fields</a> •
  <a href="#-anti-bot-stealth">Stealth</a> •
  <a href="#-legal-ethical-use--compliance">Legal & Compliance</a> •
  <a href="#-support--sponsorship">Sponsor</a>
</p>

</div>

---

## 🌟 Overview

`ziara-lead-scrapper` is a high-performance, developer-friendly command-line tool built by **Ziara TechQ Labs** that extracts local B2B leads from Google Maps without requiring API keys, Docker containers, or Python runtimes.

Collect business names, phone numbers, addresses, ratings, websites, and automatically enrich leads with verified email addresses and social handles (LinkedIn, Twitter/X, Instagram, Facebook).

---

## 🚀 Quickstart (Zero Install)

Run instantly with `npx` (no prior installation needed):

```bash
npx ziara-lead-scrapper -q "Dentists in South Delhi" -l 50
```

That's it. It spins up a managed headless Chromium browser, scrolls Google Maps listings, sanitizes data, and saves a ready-to-use CSV or JSON file right in your current directory.

---

## 📦 Global Installation

If you prefer having the command available everywhere on your system:

```bash
npm install -g ziara-lead-scrapper
```

Then run from any terminal:

```bash
ziara-lead-scrapper -q "SaaS Founders in Austin" -l 100 --enrich -o json
```

---

## 🖥️ CLI Preview

```
╔══════════════════════════════════════════════════╗
║   ⚡ ziara-lead-scrapper v1.0.0                  ║
║   Zero-config Google Maps lead scraper           ║
║   by Ziara TechQ Labs · github.com/Aquil1401     ║
╚══════════════════════════════════════════════════╝

  📋 Configuration
  ─────────────────────────────────────────
  Query      : Dentists in South Delhi
  Limit      : 50
  Output     : CSV
  Headless   : true
  Concurrency: 1
  Enrich     : true
  ─────────────────────────────────────────

  ✔ Scraping complete! Collected 50 leads.
  ✔ Saved → ziara-dentists-in-south-delhi-2024-05-01T12-00-00.csv

  ─────────────────────────────────────────
  ✔  Done! 50 leads collected.
  ─────────────────────────────────────────
```

---

## ✨ Features

- ⚡ **Zero Configuration** — Works out-of-the-box with Node.js 18+. No paid Google Cloud / Places API credentials.
- 🔍 **Rich Data Extraction** — Names, categories, ratings, review counts, phone numbers, addresses, websites, and direct Maps URLs.
- 📧 **Automated Lead Enrichment (`--enrich`)** — Visits scraped websites in the background to discover contact emails and company social media profiles (LinkedIn, Twitter/X, Instagram, Facebook).
- 🧹 **Intelligent Data Sanitization** — Strips Google Maps icon glyphs and Unicode artifacts (`\uE000-\uF8FF`), cleans redirect URLs, and filters out false-positive tracking pixels (`/tr`, `/sharer`).
- 🛡️ **Built-in Anti-Bot Stealth** — `navigator.webdriver` masking, real user-agent rotation, human-like scroll pacing, and CAPTCHA detection.
- 📊 **CSV & JSON Output** — Formatted output compatible with Google Sheets, Excel, HubSpot, Airtable, and custom CRM pipelines.
- 🌐 **Cross-Platform** — Runs smoothly on Windows, macOS, and Linux.

---

## ⚙️ Options & Flags

| Flag | Alias | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--query <string>` | `-q` | `string` | **required** | Google Maps search query (e.g. `"Coffee Shops in Seattle"`) |
| `--limit <number>` | `-l` | `number` | `20` | Maximum number of leads to collect |
| `--output <format>` | `-o` | `csv` \| `json` | `csv` | Output format (`csv` or `json`) |
| `--headless <boolean>` | — | `boolean` | `true` | Run browser in headless mode (`true` or `false`) |
| `--concurrency <number>` | — | `number` | `1` | Parallel page processing tabs (keep low to avoid blocks) |
| `--enrich` | — | `boolean` | `false` | Visit business websites to extract emails and social handles |
| `--version` | `-v` | — | — | Output version number |
| `--help` | `-h` | — | — | Display help information |

---

## 📊 Output Fields

### Base Data (Always Collected)

| Field | Description | Example |
|-------|-------------|---------|
| `title` | Business Name | `Storyville Coffee Pike Place` |
| `rating` | Average Star Rating | `4.6` |
| `reviews` | Total Reviews Count | `3221` |
| `category` | Primary Business Category | `Coffee shop` |
| `phone` | Formatted Phone Number | `+1 206-780-5777` |
| `website` | Business Website URL | `https://storyville.com/pages/pike-place-market` |
| `address` | Full Postal Address | `94 Pike St Top floor Suite 34, Seattle, WA 98101` |
| `mapsUrl` | Canonical Google Maps Place URL | `https://www.google.com/maps/place/...` |

### Enriched Data (Added with `--enrich`)

| Field | Description | Example |
|-------|-------------|---------|
| `email` | Contact / Business Email | `info@storyville.com` |
| `linkedin` | Company LinkedIn URL | `https://www.linkedin.com/company/storyville-coffee` |
| `twitter` | Twitter / X Profile URL | `https://x.com/storyville` |
| `instagram` | Instagram Profile URL | `https://www.instagram.com/storyville` |
| `facebook` | Facebook Business Page URL | `https://www.facebook.com/StoryvilleCoffee` |

---

## 💡 Practical Examples

```bash
# 1. Quick test: Scrape 10 bakeries in Paris to CSV
npx ziara-lead-scrapper -q "Bakeries in Paris" -l 10

# 2. Lead Generation: Collect 100 marketing agencies in London with emails & socials
npx ziara-lead-scrapper -q "Marketing Agencies in London" -l 100 --enrich -o json

# 3. High Volume: 200 real estate brokers in Miami saved as CSV
npx ziara-lead-scrapper -q "Real Estate Brokers in Miami" -l 200 --enrich -o csv

# 4. Debug Mode: Open visible browser window (solve CAPTCHAs manually if needed)
npx ziara-lead-scrapper -q "Gyms in Dubai" -l 20 --headless false
```

---

## 🛡️ Anti-Bot & Stealth Engineering

Scraping dynamic web applications requires evasion techniques to avoid IP rate limits and automated blocking:

- **Webdriver Masking** — Overrides `navigator.webdriver`, `navigator.plugins`, and `navigator.languages` to emulate a genuine human browser environment.
- **User-Agent Fingerprinting** — Rotates realistic modern desktop user agents (Chrome, Safari, Firefox).
- **Human Jitter & Delays** — Adds randomized pauses (800ms–2500ms) between scroll operations and listing transitions.
- **Infinite Feed Interaction** — Dispatches native wheel events and DOM scroll triggers to ensure smooth pagination.
- **CAPTCHA & Block Detection** — Gracefully detects bot challenges and warns the user with actionable mitigation advice instead of failing silently.
- **International Consent Auto-Bypass** — Automatically dismisses multi-lingual Google cookie consent dialogues.

---

## ⚖️ Legal, Ethical Use & Compliance

Before deploying this tool, review and adhere to the following principles:

### 1. Public Data & Fair Use
`ziara-lead-scrapper` is engineered solely to extract **publicly accessible commercial business data** that entities publish on public directories for discovery. It is not designed to bypass access controls, breach password-protected portals, or harvest private personal communications.

### 2. Trademark Disclaimer
*Google Maps™ is a trademark of Google LLC.* `ziara-lead-scrapper` is an independent open-source software project developed by **Ziara TechQ Labs** and is **not affiliated, endorsed, associated, authorized, or certified by Google LLC or Alphabet Inc.**

### 3. Data Protection & Cold Outreach Compliance
If you use extracted lead data for marketing, recruitment, or sales outreach, you are solely responsible for compliance with relevant regional regulations:
- **GDPR (European Union):** Ensure lawful basis (e.g., Legitimate Interest under Art. 6(1)(f)) for processing B2B contacts, honor opt-outs, and maintain data subject rights.
- **CAN-SPAM Act (United States):** Provide clear identification, a physical mailing address, and a functional unsubscribe mechanism in commercial communications.
- **CASL (Canada):** Ensure consent exemptions apply to corporate addresses before sending Commercial Electronic Messages (CEMs).
- **CCPA / CPRA (California):** Honor requests to delete or opt-out of the sale/sharing of personal information.

### 4. Terms of Service & Rate Limiting
Automated queries may conflict with specific platform Terms of Service. Always maintain reasonable rates, avoid aggressive concurrency, respect host resources, and do not use this software for denial-of-service, abusive scraping, or unlawful harassment.

### 5. Limitation of Liability
*THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. IN NO EVENT SHALL THE AUTHORS, ZIARA TECHQ LABS, OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, ACCOUNT SUSPENSION, IP BAN, OR OTHER LIABILITY ARISING FROM THE USE OF THIS SOFTWARE.*

---

## 🏗️ Local Development & Contributing

Contributions, bug reports, and pull requests are welcome!

```bash
# 1. Clone the repository
git clone https://github.com/Aquil1401/ziara-lead-scrapper.git
cd ziara-lead-scrapper

# 2. Install dependencies
npm install

# 3. Install Playwright browser binaries
npx playwright install chromium

# 4. Run in development mode (TypeScript via ts-node)
npm run dev -- -q "Coffee Shops in Seattle" -l 5

# 5. Typecheck & build
npm run typecheck
npm run build
```

---

## 💖 Support & Sponsorship

Building and maintaining open-source tools with anti-blocking countermeasures, selector updates, and new features takes substantial time and effort.

If `ziara-lead-scrapper` saved your team hours of manual research or hundreds of dollars in API subscription fees, please consider supporting the project:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor%20on%20GitHub-%E2%9D%A4-pink?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/Aquil1401)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-%E2%98%95-orange?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/techqlabs)

- ⭐ **Star this repository** on GitHub to increase visibility.
- 🐛 **Report issues** or feature requests on the [Issue Tracker](https://github.com/Aquil1401/ziara-lead-scrapper/issues).
- 💖 **Become a Sponsor** via [GitHub Sponsors](https://github.com/sponsors/Aquil1401).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) © 2024 **Ziara TechQ Labs** & [Aquil1401](https://github.com/Aquil1401).
