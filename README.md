<div align="center">

# ⚡ ziara-lead-scrapper

**Zero-config Google Maps lead scraper CLI. No Docker. No Python. No paid APIs.**[![GitHub Stars](https://img.shields.io/github/stars/Aquil1401/ziara-lead-scrapper?style=flat-square&color=yellow)](https://github.com/Aquil1401/ziara-lead-scrapper/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Chromium-45ba4b?style=flat-square&logo=playwright)](https://playwright.dev/)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor%20on%20GitHub-%E2%9D%A4-pink?style=flat-square&logo=github-sponsors)](https://github.com/sponsors/Aquil1401)

<p align="center">
  <a href="#-quickstart-clone--run">Quickstart</a> •
  <a href="#-why-it-exists">Why It Exists</a> •
  <a href="#-features">Features</a> •
  <a href="#️-options--flags">Options</a> •
  <a href="#-output-fields">Output Fields</a> •
  <a href="#-anti-bot-stealth">Stealth</a> •
  <a href="#-responsible-use--rate-limiting">Responsible Use</a> •
  <a href="#-legal-ethical-use--compliance">Legal</a> •
  <a href="#-support--sponsorship">Sponsor</a>
</p>

</div>

---

## 🌟 Overview

`ziara-lead-scrapper` is a high-performance, developer-friendly command-line tool built by **Ziara TechQ Labs** that extracts local B2B leads from Google Maps without requiring API keys, Docker containers, or Python runtimes.

Collect business names, phone numbers, addresses, ratings, websites, and automatically enrich leads with public contact email addresses and social handles (LinkedIn, Twitter/X, Instagram, Facebook).

---

## 💡 Why It Exists

Standard HTTP scrapers and AI chat models fail when querying Google Maps because Google serves heavy JavaScript-rendered feeds, international cookie consent barriers, and dynamic scroll containers.

Other open-source tools require complex setup: installing **Docker Desktop**, running background container daemons, or configuring Python virtual environments.

`ziara-lead-scrapper` eliminates friction: execute locally via native Playwright headless browser orchestration with automated system browser fallback.

### 🥊 How It Compares

| Feature | `ziara-lead-scrapper` | Other Scraper Kits | Paid Cloud Scraping SaaS |
| :--- | :---: | :---: | :---: |
| **Setup Friction** | **Low (Clone & Run)** | High (Docker compose) | High (Sign up / Setup) |
| **Docker Required?** | ❌ **No Docker** | ✅ Required | ❌ No |
| **Python Required?** | ❌ **No Python** | Optional/Scripts | ❌ No |
| **API Keys / Cost** | 🆓 **$0.00 / Free** | 🆓 Free | 💳 $49 – $299 / month |
| **Email Enrichment** | ✅ **Built-in (`--enrich`)** | Extra scripting | Extra per-credit cost |
| **Social Links** | ✅ **LinkedIn, X, IG, FB** | Limited | Often extra fee |
| **Data Privacy** | 🔒 **100% Local Machine** | 🔒 Local Machine | ⚠️ Shared with 3rd party |
| **Output Formats** | **CSV & JSON** | CSV only | CSV / JSON |

---

## 🚀 Quickstart (Clone & Run)

Run in 3 simple commands with Node.js 18+:

```bash
# 1. Clone the repository
git clone https://github.com/Aquil1401/ziara-lead-scrapper.git
cd ziara-lead-scrapper

# 2. Install dependencies & build
npm install
npm run build

# 3. Run the scraper
npm start -- -q "Dentists in South Delhi" -l 50
```

> **Note:** If Chromium is not already installed on your machine, Playwright will automatically use your installed Google Chrome or Microsoft Edge, or you can install Chromium binaries via `npx playwright install chromium`.

---

## 🖥️ Global CLI Linking (Optional)

If you prefer having the `ziara-lead-scrapper` command available globally in any directory:

```bash
npm link
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
  ✔ Saved → ziara-dentists-in-south-delhi-2026-10-08T12-00-00.csv

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
npm start -- -q "Bakeries in Paris" -l 10

# 2. Lead Generation: Collect 100 marketing agencies in London with emails & socials
npm start -- -q "Marketing Agencies in London" -l 100 --enrich -o json

# 3. High Volume: 100 real estate brokers in Miami saved as CSV
npm start -- -q "Real Estate Brokers in Miami" -l 100 --enrich -o csv

# 4. Debug Mode: Open visible browser window (solve CAPTCHAs manually if needed)
npm start -- -q "Gyms in Dubai" -l 20 --headless false
```

> **💡 Tip on Google Maps limits:** Google Maps naturally caps infinite scroll at ~120 listings per individual search query before reaching the end of results. To scrape hundreds or thousands of leads in a city, partition your queries into specific neighborhoods, sub-districts, or pincodes (e.g. `"Gyms in Downtown Miami"`, `"Gyms in Brickell"`, `"Gyms in Miami Beach"`).

---

## 🛡️ Anti-Bot & Stealth Engineering

Scraping dynamic web applications requires evasion techniques to avoid IP rate limits and automated blocking:

- **Webdriver Masking** — Overrides `navigator.webdriver`, `navigator.plugins`, and `navigator.languages` to emulate a genuine human browser environment.
- **User-Agent Fingerprinting** — Rotates realistic modern desktop Chrome/Chromium user agents matched to the browser engine.
- **Human Jitter & Delays** — Adds randomized pauses (800ms–2500ms) between scroll operations and listing transitions.
- **Infinite Feed Interaction** — Dispatches native wheel events and DOM scroll triggers to ensure smooth pagination.
- **CAPTCHA & Block Detection** — Gracefully detects bot challenges and warns the user with actionable mitigation advice instead of failing silently.
- **International Consent Auto-Bypass** — Automatically dismisses multi-lingual Google cookie consent dialogues.

---

## 🤝 Responsible Use & Rate Limiting

This tool operates a headless browser against publicly accessible pages. Follow these best practices:

- **Start Small:** Begin with `--limit 20` or `--limit 50` before scraping large batches.
- **Keep Concurrency Low:** Default concurrency is `1`. Running too many parallel tabs will trigger rate limiting on your IP.
- **Understand Rate Limits:** If Google displays a challenge, rate limits are **strictly temporary and IP-based** (usually resetting within minutes to hours). Your Google account is never impacted because no login credentials are used.
- **Manual Resolution:** If challenged, re-run with `--headless false` to inspect or solve challenges manually.

---

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary><b>Does this tool require Google API keys or billing?</b></summary>
<br>
No. <code>ziara-lead-scrapper</code> does not use Google Places API and requires no Google Cloud account, API tokens, or billing cards.
</details>

<details>
<summary><b>Why are some email addresses or social links blank?</b></summary>
<br>
When <code>--enrich</code> is active, the tool crawls the official website declared in the listing. If the business does not publish a contact email or social handle on their site (or uses a contact form only), the field remains clean and empty. We never generate fictitious guesses.
</details>

<details>
<summary><b>Does it work on Windows, macOS, and Linux?</b></summary>
<br>
Yes. Built on Node.js 18+ and Playwright, it runs on all major operating systems.
</details>

---

## ⚖️ Legal, Ethical Use & Compliance

> **IMPORTANT NOTICE:** This project is provided strictly for **educational, technical demonstration, and academic research purposes**. Users assume 100% full legal responsibility and liability for their use of this software. For complete terms, see the official [Legal Disclaimer & Acceptable Use Policy](DISCLAIMER.md).

### 1. Educational & Research Scope
`ziara-lead-scrapper` serves as an educational demonstration of headless browser orchestration with Playwright. The developers and contributors do not host, store, sell, or collect any data scraped by end users. All extraction operations occur entirely locally on the user's machine.

### 2. Trademark Disclaimer
*Google*, *Google Maps™*, *Chromium*, and other related marks are trademarks of **Google LLC** and **Alphabet Inc.** `ziara-lead-scrapper` is an independent open-source software utility developed by **Ziara TechQ Labs** and is **not affiliated with, endorsed by, sponsored by, or certified by Google LLC or Alphabet Inc.** Any reference to third-party services is strictly for descriptive identification (nominative fair use).

### 3. Data Protection & Cold Outreach Compliance
If you extract contact details for commercial or outreach purposes, you are solely responsible for compliance with relevant local and international statutes:
- **DPDP Act 2023 & IT Act 2000 (India):** Ensure personal data is processed lawfully with valid consent or recognized legitimate use, honoring data principal rights.
- **GDPR (European Union):** Ensure a documented lawful basis (e.g., Legitimate Interest under Art. 6(1)(f)) for processing B2B contacts, honor opt-outs, and uphold data subject rights.
- **CAN-SPAM Act (United States):** Provide honest email headers, non-deceptive subject lines, physical mailing address, and functional unsubscribe mechanisms.
- **TCPA (United States):** Absolute prohibition against unsolicited automated dialing or SMS to telephone numbers without prior express consent.
- **CASL (Canada):** Ensure commercial electronic messaging exemptions apply before communicating.
- **CCPA / CPRA (California):** Honor consumer deletion and opt-out requests.

### 4. Terms of Service & User Responsibility
Automated scraping may violate the Terms of Service of third-party platforms. By using this tool, you agree that you are solely responsible for ensuring your actions comply with all applicable terms, policies, and laws.

### 5. Limitation of Liability & Indemnification
*THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. IN NO EVENT SHALL THE AUTHORS, CONTRIBUTORS, OR ZIARA TECHQ LABS BE LIABLE FOR ANY CLAIM, DAMAGES, ACCOUNT SUSPENSION, IP BAN, REGULATORY FINES, OR OTHER LIABILITY ARISING FROM THE USE OF THIS SOFTWARE. USERS AGREE TO INDEMNIFY AND HOLD HARMLESS THE MAINTAINERS AGAINST ANY AND ALL CLAIMS ARISING FROM THEIR USE OF THIS TOOL.* Please read [DISCLAIMER.md](DISCLAIMER.md) for full legal terms.

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

- ⭐ **Star this repository** on GitHub to increase visibility.
- 🐛 **Report issues** or feature requests on the [Issue Tracker](https://github.com/Aquil1401/ziara-lead-scrapper/issues).
- 💖 **Become a Sponsor** via [GitHub Sponsors](https://github.com/sponsors/Aquil1401).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) © 2026 **Ziara TechQ Labs** & [Aquil1401](https://github.com/Aquil1401).
