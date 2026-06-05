# 📡 MNO-wise P2P (DataVPN) Interruption Record — Email Generator

> A professional internal tool for the **Service Assurance** team at **Infozillion Teletech BD Ltd.** to instantly generate formatted email reports on MNO-wise P2P (DataVPN) interruption records.

---

## ✨ Overview

Every day, the Service Assurance team monitors DATA VPN (P2P) interruptions across four mobile network operators — Grameenphone, Robi, Teletalk, and Banglalink. This tool eliminates manual email writing by turning raw sheet data into a professionally formatted, Gmail-ready email draft in seconds.

---

## 🚀 Features

- **Zero setup** — runs entirely in the browser, no installation needed
- **Smart date detection** — automatically reads the data period from pasted data
- **Per-operator daily counts** — Banglalink, Grameenphone, Robi, Teletalk, and TOD (Total of Day)
- **Last 15 days** — automatically picks the most recent 15 unique dates from pasted data
- **One-click copy** — copies rich HTML directly to clipboard, pastes into Gmail with table intact
- **Personalized signature** — enter your name once, it appears in every email
- **Responsive design** — works on desktop and mobile

---

## 📋 How to Use

**Step 1** — Enter your name in the **Your Name** field

**Step 2** — Go to your Google Sheet, select the DATA VPN rows, and copy

**Step 3** — Paste into the **Sheet Data** textarea — the tool auto-detects row count and date range

**Step 4** — Click **Generate Email Draft**

**Step 5** — Click **⎘ Copy Email**, then open Gmail → Compose → `Ctrl+V`

---

## 📁 Data Format

Each row represents **one interruption event**. Format: `date` + `TAB` + `operator`

```
2026-06-03    Robi
2026-06-03    Grameenphone
2026-06-02    Robi
2026-06-02    Teletalk
2026-06-01    Banglalink
```

**Supported operators:** `Grameenphone` · `Robi` · `Teletalk` · `Banglalink`

---

## 📬 Email Output

The generated email follows this structure:

```
Subject: MNO-wise P2P (DataVPN) interruption record

Dear Concerned,

Please find the MNO-wise P2P (DataVPN) interruption record for the last 15 days.

┌───────┬──────────────┬────────────┬──────────────┬──────┬──────────┬─────┐
│ D - n │ DATE         │ Banglalink │ Grameenphone │ Robi │ Teletalk │ TOD │
├───────┼──────────────┼────────────┼──────────────┼──────┼──────────┼─────┤
│     1 │ 04 -Jun-2026 │          3 │            1 │    5 │        2 │  11 │
│     2 │ 03 -Jun-2026 │          1 │            3 │    7 │        1 │  12 │
│   ... │ ...          │        ... │          ... │  ... │      ... │ ... │
├───────┼──────────────┼────────────┼──────────────┼──────┼──────────┼─────┤
│ Total │              │         32 │           47 │   83 │       30 │ 192 │
└───────┴──────────────┴────────────┴──────────────┴──────┴──────────┴─────┘

Best Regards,
Najmaz Sakib
Senior Engineer, Service Assurance
Infozillion Teletech BD Ltd.
Hosaf High Tower, 12th Floor,
9 Mohakhali C/A, Dhaka-1212, Bangladesh
```

---

## 🌐 Deployment (GitHub Pages)

```bash
# 1. Upload this repo to GitHub
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
├── app.js         Data parsing, table generation, copy logic
└── README.md      Documentation
```

---

© 2026 Najmaz Sakib · Infozillion Teletech BD Ltd.
