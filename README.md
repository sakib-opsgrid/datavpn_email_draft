# DATA VPN Health Summary — Email Generator

A lightweight browser-based tool for **Infozillion Teletech BD Ltd. — Service Assurance** team to generate professional email drafts for DATA VPN (P2P) health summaries.

## Features

- Paste raw sheet data (date + operator, tab-separated)
- Automatically calculates last 15 days window based on mail date
- Computes per-operator **Total Hits**, **Daily Avg** (blank days excluded), and **Remark**
- One-click **Copy Email** — pastes directly into Gmail with table formatting intact
- No backend, no dependencies — runs entirely in the browser

## Remark Scale

| Floor of Daily Avg | Remark |
|--------------------|--------|
| 2 | Normal |
| 3 – 4 | Higher than Normal |
| 5 – 6 | Moderately Higher than Normal |
| > 6 | Significantly Higher than Normal |

## Date Logic

If you are sending the mail on **5 June**, the tool uses data from **21 May – 4 June** (previous day, 15 days back).

## Data Format

Paste from Google Sheet. Each row = 1 hit event:

```
2026-06-03	Robi
2026-06-03	Grameenphone
2026-06-02	Robi
...
```

Supported operators: `Grameenphone`, `Robi`, `Teletalk`, `Banglalink`

## How to Use

1. Open `index.html` in any browser (or visit the GitHub Pages URL)
2. Select the **Mail Date** (the date you are sending the email)
3. Paste the last 15+ days of sheet data into the text area
4. Click **Generate Email Draft**
5. Click **⎘ Copy Email**
6. Open Gmail → Compose → **Ctrl+V**

## Deployment (GitHub Pages)

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Your tool will be live at `https://<your-username>.github.io/<repo-name>/`

## Files

```
├── index.html   — Main HTML structure
├── style.css    — Styling
├── app.js       — Logic: parsing, calculation, copy
└── README.md    — This file
```

## Average Calculation

- **Per operator**: Total hits ÷ number of days that operator had at least 1 hit (blank days excluded)
- **Total row**: Grand total hits ÷ number of days where any operator had data

---

Infozillion Teletech BD Ltd. — Service Assurance Team
