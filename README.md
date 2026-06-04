# 📡 DATA VPN Health Summary — Email Generator

> A professional internal tool for the **Service Assurance** team at **Infozillion Teletech BD Ltd.** to instantly generate formatted email reports on DATA VPN (P2P) network health across all MNO operators.

---

## ✨ Overview

Every day, the Service Assurance team monitors DATA VPN fluctuations across four mobile network operators — Grameenphone, Robi, Teletalk, and Banglalink. This tool eliminates manual email writing by turning raw sheet data into a professionally formatted, Gmail-ready email draft in seconds.

---

## 🚀 Features

- **Zero setup** — runs entirely in the browser, no installation needed
- **Smart date detection** — automatically reads the data period from pasted data
- **Per-operator analytics** — Total Hits, Daily Average, and health Remark for each MNO
- **Blank day handling** — days with no data are excluded from average calculation
- **One-click copy** — copies rich HTML directly to clipboard, pastes into Gmail with table intact
- **Personalized signature** — enter your name once, it appears in every email
- **Responsive design** — works on desktop and mobile

---

## 📊 Remark Scale

Health status is determined by the **floor** of the daily average:

| Daily Average (floored) | Remark |
|---|---|
| ≤ 2 | ✅ Normal |
| 3 – 4 | 🟡 Higher than Normal |
| 5 – 6 | 🟠 Moderately Higher than Normal |
| > 6 | 🔴 Significantly Higher than Normal |

---

## 📋 How to Use

**Step 1** — Enter your name in the **Your Name** field

**Step 2** — Go to your Google Sheet, select the last 15+ days of DATA VPN rows, and copy

**Step 3** — Paste into the **Sheet Data** textarea. The tool will auto-detect the date range

**Step 4** — Click **Generate Email Draft**

**Step 5** — Click **⎘ Copy Email**, then open Gmail → Compose → `Ctrl+V`

---

## 📁 Data Format

Each row represents **one hit event**. Format: `date` + `TAB` + `operator`

```
2026-06-03    Robi
2026-06-03    Grameenphone
2026-06-02    Robi
2026-06-02    Teletalk
2026-06-01    Banglalink
```

**Supported operators:** `Grameenphone` · `Robi` · `Teletalk` · `Banglalink`

---

## 🌐 Deployment (GitHub Pages)

```bash
# 1. Clone or upload this repo to GitHub
# 2. Go to Settings → Pages
# 3. Source: Deploy from branch → main → / (root)
# 4. Save — your tool is live at:

https://<your-username>.github.io/<repo-name>/
```

---

## 🗂 Project Structure

```
vpn-tool/
├── index.html     UI layout and structure
├── style.css      Styling and responsive design
├── app.js         Data parsing, calculations, copy logic
└── README.md      Documentation
```

---

## ⚙️ Average Calculation Logic

| Metric | Formula |
|---|---|
| Per-operator Daily Avg | Total hits ÷ days with at least 1 hit |
| Total row Daily Avg | Grand total hits ÷ days where any operator had data |
| Remark | Based on `Math.floor(avg)` using the scale above |

---

## 📬 Email Output Example

The generated email follows this structure:

```
Subject: DATA VPN (P2P) Health Summary | Last 15 Days (20 May 2026 – 03 Jun 2026)

Dear Concerned,

Please find below the Network Fluctuation (P2P / DATA VPN) Health Summary...

┌─────────────────────┬────────────┬───────────┬──────────────────────────────┐
│ Operator            │ Total Hits │ Daily Avg │ Remark                       │
├─────────────────────┼────────────┼───────────┼──────────────────────────────┤
│ Grameenphone (GP)   │     47     │    4.3    │ Higher than Normal           │
│ Robi (RB)           │     71     │    6.5    │ Significantly Higher than... │
│ Teletalk (TT)       │     26     │    2.6    │ Normal                       │
│ Banglalink (BL)     │     23     │    2.9    │ Normal                       │
├─────────────────────┼────────────┼───────────┼──────────────────────────────┤
│ Total               │    167     │   13.4    │ Significantly Higher than... │
└─────────────────────┴────────────┴───────────┴──────────────────────────────┘

Best Regards,
Najmaz Sakib
Senior Engineer, Service Assurance
Infozillion Teletech BD Ltd.
```

---

© 2026 Najmaz Sakib · Infozillion Teletech BD Ltd.
