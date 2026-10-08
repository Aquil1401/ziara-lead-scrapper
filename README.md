<div align="center">

# ⚡ ziara-lead-scrapper

**Zero-config Google Maps lead scraper. No Docker. No Python. No paid APIs.**

[![npm version](https://img.shields.io/npm/v/ziara-lead-scrapper?color=cyan&style=flat-square)](https://www.npmjs.com/package/ziara-lead-scrapper)
[![npm downloads](https://img.shields.io/npm/dm/ziara-lead-scrapper?color=blue&style=flat-square)](https://www.npmjs.com/package/ziara-lead-scrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?style=flat-square&logo=github-sponsors)](https://github.com/sponsors/Aquil1401)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-%E2%98%95-orange?style=flat-square&logo=buy-me-a-coffee)](https://buymeacoffee.com/techqlabs)

</div>

---

## 🚀 Quickstart (zero install)

```bash
npx ziara-lead-scrapper -q "Dentists in South Delhi" -l 50
```

That's it. No setup. No API keys. No Docker.

---

## 📦 Install Globally

```bash
npm install -g ziara-lead-scrapper
```

Then run from anywhere:

```bash
ziara-lead-scrapper -q "SaaS Founders in Austin" -l 100 --enrich -o json
```

---

## 🖥️ CLI Preview

```
╔══════════════════════════════════════════════════╗
║   ⚡ ziara-lead-scrapper v1.0.0                   ║
║   Zero-config Google Maps lead scraper           ║
║   by TechQ Labs · github.com/TechQ-Labs          ║
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

  ⠸ Extracting lead details... [23/50]

  ✔  Scraping complete! Collected 50 leads.
  ✔  Saved → /home/user/ziara-dentists-in-south-delhi-2024-05-01T12-00-00.csv

  ─────────────────────────────────────────
  ✔  Done! 50 leads collected.
  ─────────────────────────────────────────
```

---

## ⚙️ Options

| Flag | Alias | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--query` | `-q` | `string` | **required** | Google Maps search query |
| `--limit` | `-l` | `number` | `20` | Max number of leads to collect |
| `--output` | `-o` | `csv` \| `json` | `csv` | Output file format |
| `--headless` | — | `boolean` | `true` | Run browser headlessly |
| `--concurrency` | — | `number` | `1` | Parallel tabs (keep ≤ 2 to avoid blocks) |
| `--enrich` | — | `boolean` | `false` | Visit websites for emails & socials |
| `--version` | `-v` | — | — | Show version number |
| `--help` | `-h` | — | — | Show help |

---

## 📊 Output Fields

### Base (always collected)

| Field | Description |
|-------|-------------|
| `title` | Business name |
| `rating` | Average star rating |
| `reviews` | Total number of reviews |
| `category` | Business category / niche |
| `phone` | Phone number |
| `website` | Website URL |
| `address` | Full address |
| `mapsUrl` | Direct Google Maps place URL |

### Enriched (with `--enrich` flag)

| Field | Description |
|-------|-------------|
| `email` | Business email (scraped from website) |
| `linkedin` | LinkedIn company/profile URL |
| `twitter` | Twitter / X profile URL |
| `instagram` | Instagram profile URL |
| `facebook` | Facebook page URL |

---

## 💡 Example Queries

```bash
# Basic — get 20 coffee shops in NYC as CSV
npx ziara-lead-scrapper -q "Coffee Shops in NYC"

# Large batch — 100 dentists as JSON
npx ziara-lead-scrapper -q "Dentists in South Delhi" -l 100 -o json

# Enrich leads with emails and socials
npx ziara-lead-scrapper -q "Marketing Agencies in London" -l 30 --enrich

# Non-headless mode (useful for debugging or CAPTCHA solving)
npx ziara-lead-scrapper -q "Gyms in Dubai" --headless false

# Full power run
npx ziara-lead-scrapper -q "SaaS Founders in Austin" -l 200 --enrich -o json --concurrency 2
```

---

## 🛡️ Anti-Bot Measures

`ziara-lead-scrapper` ships with multiple stealth techniques baked in:

- **`navigator.webdriver` masking** — hides the Playwright automation flag
- **Realistic user-agents** — rotates across real Chrome, Firefox, and Safari UA strings
- **Random delays** — 1200–2800ms between scroll events and page navigations
- **Infinite scroll simulation** — smoothly scrolls Google Maps' result feed
- **CAPTCHA detection** — gracefully warns and exits instead of crashing
- **Cookie consent handling** — auto-accepts cookie banners

### If You Get Blocked

```
⚠  Google detected automated activity.
   Suggestions:
   • Reduce --concurrency to 1
   • Add random delays by re-running after a few minutes
   • Run with --headless false to solve CAPTCHA manually
```

---

## 🏗️ Local Development

```bash
# Clone the repo
git clone https://github.com/Aquil1401/ziara-lead-scrapper.git
cd ziara-lead-scrapper

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Run in dev mode (ts-node)
npm run dev -- -q "Restaurants in Berlin" -l 10

# Build for production
npm run build

# Run the compiled build
npm start -- -q "Restaurants in Berlin" -l 10
```

---

## 📁 Project Structure

```
ziara-lead-scrapper/
├── bin/
│   └── index.ts          # CLI entry point (Commander.js + Chalk + Ora)
├── src/
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── scraper.ts         # Playwright scraping engine
│   ├── enricher.ts        # Website email & social extractor
│   └── exporter.ts        # CSV / JSON output writer
├── .github/
│   └── FUNDING.yml        # GitHub Sponsors config
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚠️ Legal & Ethical Use

This tool is intended for **legitimate lead generation and market research** purposes only.

- Only scrape publicly available Google Maps data
- Respect Google's [Terms of Service](https://policies.google.com/terms)
- Do not use for spam, harassment, or any illegal activity
- Use responsibly — apply rate limits and concurrency controls

> The authors are not responsible for misuse of this tool.

---

## 💖 Support the Project

If `ziara-lead-scrapper` saved you hours of work or hundreds of dollars in API fees, consider supporting its development:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor%20on%20GitHub-%E2%9D%A4-pink?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/Aquil1401)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-%E2%98%95-orange?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/techqlabs)

---

## 📄 License

[MIT](LICENSE) © [TechQ Labs](https://github.com/TechQ-Labs)
