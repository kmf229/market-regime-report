# The Market Regime Report - Website Project

## Project Overview

This is a Next.js 14+ website for **The Market Regime Report**, a systematic trading newsletter run by Kevin Fitzpatrick. The site serves as the public-facing institutional presence, while Substack (www.marketregimes.com) handles articles, daily dashboards, and paid subscriber content.

### Site Architecture
This is a **hybrid single-domain site** at marketregimes.com:
- **Custom pages** (this codebase): `/`, `/about`, `/track-record`
- **Substack pages**: `/s/daily-dashboard`, `/s/articles`, `/subscribe`, paywall content

All navigation should feel seamless as one website. Custom pages link to Substack pages without `target="_blank"`.

### Navigation Structure
```
Logo | Home | Daily Dashboard | Track Record | Articles | About
                    The Market Regime Report
```
- **Home** → `/` (custom)
- **Daily Dashboard** → `/s/daily-dashboard` (Substack)
- **Track Record** → `/track-record` (custom)
- **Articles** → `/s/articles` (Substack)
- **About** → `/about` (custom)

Active page shows thick black underline indicator.

### Business Model
- **Free**: Home, About, Track Record, Articles
- **Paid ($7/mo or $70/yr)**: Daily dashboards, regime signals, current positioning

### Future Goal
Kevin plans to eventually open an RIA (Registered Investment Advisor) to manage outside money, so the site should maintain an institutional, professional aesthetic.

---

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**:
  - Inter (sans-serif) - navigation and body text
  - Spectral (serif) - site title, matches Substack's "Fancy Serif"
- **Data**: Static JSON files in `/public/track_record/`
- **No database, no API routes** - purely static/SSR from JSON files

---

## File Structure

```
website/
├── public/
│   ├── images/
│   │   └── logo.png                    # Site logo
│   └── track_record/
│       ├── summary.json                # Performance metrics
│       ├── monthly_returns.json        # Monthly returns grid
│       └── equity_curve.png            # Equity curve chart
├── src/
│   ├── app/
│   │   ├── globals.css                 # Tailwind + custom styles
│   │   ├── layout.tsx                  # Root layout with Header/Footer
│   │   ├── page.tsx                    # Home page
│   │   ├── about/
│   │   │   └── page.tsx                # About page
│   │   └── track-record/
│   │       └── page.tsx                # Track Record page (Server Component)
│   ├── components/
│   │   ├── Header.tsx                  # Site header (stacked: nav row + title row)
│   │   ├── NavLink.tsx                 # Client component for active page indicator
│   │   ├── HeroStats.tsx               # Large 4-metric display
│   │   ├── MetricsPanel.tsx            # Detailed metrics grid
│   │   ├── MonthlyReturnsTable.tsx     # Monthly returns HTML table
│   │   └── EquityCurve.tsx             # Equity curve image display
│   └── types/
│       └── track-record.ts             # TypeScript interfaces
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── CLAUDE.md                           # This file
```

---

## Data Formats

### summary.json
```json
{
  "start_date": "YYYY-MM-DD",
  "data_through": "YYYY-MM-DD",
  "strategy_length_days": number,
  "strategy_length_years": number,
  "cumulative_return": number (decimal, e.g., 0.1765 = 17.65%),
  "cagr": number (decimal),
  "max_drawdown": number (decimal, negative),
  "sharpe_ratio": number | null,
  "avg_monthly_return": number,
  "best_month_return": number,
  "best_month_label": "YYYY-MM",
  "worst_month_return": number,
  "worst_month_label": "YYYY-MM",
  "up_months_pct": number (decimal, e.g., 0.75 = 75%)
}
```

### monthly_returns.json
```json
{
  "columns": ["Jan", "Feb", ..., "Dec", "YTD"],
  "rows": [
    {
      "Year": 2025,
      "Jan": null,
      "Feb": 0.02,
      ...
      "YTD": 0.05
    }
  ]
}
```

---

## Current Pages

### Home Page (`/`)
- Hero: "Rules-Based Investing. Zero Emotion."
- Philosophy section explaining behavioral edge
- How It Works: Risk-On vs Risk-Off regime explanation
- Three pillars: Systematic Process, Total Transparency, Simplicity Over Complexity
- Dark CTA band linking to track record
- Newsletter section linking to Substack
- Disclaimer footer

### Track Record Page (`/track-record`)
- Hero section with title, update note, and performance period
- HeroStats: 4 large metrics (Cumulative Return, CAGR, Sharpe, Max Drawdown)
- Monthly Returns table (green/red color coding)
- Performance Summary panel (detailed metrics)
- Equity Curve image
- Disclaimer

### About Page (`/about`)
- The Problem: Why most investors underperform (behavioral issues)
- The Solution: Rules replace emotion
- How It Works: Risk-On vs Risk-Off regime explanation with key characteristics
- About Kevin: Personal journey from emotional to systematic trading
- What Subscribers Get: Daily dashboard, regime signals, educational content, track record
- CTA section linking to track record and Substack
- Disclaimer

---

## Design Guidelines

### Colors
- **Positive returns**: `text-emerald-600` or `text-positive` (#16a34a)
- **Negative returns**: `text-red-600` or `text-negative` (#dc2626)
- **Neutral**: `text-gray-500` or `text-neutral` (#6b7280)
- **Background accents**: `bg-gray-50`, `bg-gray-900` (dark sections)

### Typography
- **Site title**: Spectral (serif), `font-spectral`, matches Substack "Fancy Serif"
- **Navigation**: System sans-serif via Inter
- **Headings**: Inter, font-bold
- **Body**: Inter, text-gray-600
- **Numbers/Data**: font-mono for tabular data

### Header Layout
- **Row 1**: Logo + navigation links (left-aligned, full-width)
- **Row 2**: "The Market Regime Report" (centered, Spectral font, large)
- **Active state**: Thick black underline (`border-b-2 border-gray-900`) on current page
- **No border** below header (removed divider to match Substack)

### Layout
- **Header**: Full-width (`px-6` padding only, no max-width)
- **Content**: `max-w-5xl` (1024px) centered
- **Padding**: `px-6` horizontal
- **Section spacing**: `py-16 md:py-20`

---

## Important Implementation Notes

1. **Date Parsing**: Always parse YYYY-MM-DD dates by splitting the string to avoid timezone issues:
   ```typescript
   const [year, month, day] = dateStr.split("-").map(Number);
   const date = new Date(year, month - 1, day);
   ```

2. **Track Record Page is a Server Component**: Uses Node.js `fs` to read JSON files at build/runtime from `process.cwd() + "/public/track_record/"`

3. **NavLink is a Client Component**: Uses `usePathname()` hook to detect current page for active state styling

4. **Error Handling**: Gracefully displays error message if JSON files are missing

5. **Responsive Design**:
   - 2-column metrics on desktop, 1-column on mobile
   - Monthly returns table has horizontal scroll on mobile
   - Hero stats: 2-col mobile, 4-col desktop
   - Site title hidden on mobile in header (shows only logo)

---

## Running the Project

```bash
cd /Users/kmf229/Documents/Trading/Substack/website
npm install
npm run dev
```

Then open http://localhost:3000

---

## Future Enhancements (Discussed)

### For This Site (Public)
- [x] **About/Philosophy Page**: Detailed explanation of the regime model, Kevin's background, methodology
- [ ] **Benchmark Comparison**: Add S&P 500/QQQ returns alongside strategy returns
- [ ] **Mobile Navigation**: Hamburger menu for mobile devices
- [ ] **Drawdown Chart**: Visual of underwater periods
- [ ] **Rolling Returns**: 3-month, 6-month rolling performance display
- [ ] **Regime History Timeline**: Shows past regime shifts (dates only, not current position)

### For Substack Only (Paid)
- Current regime indicator (Risk-On/Risk-Off)
- Real-time signals and positioning
- Daily dashboards

---

## Session History

### Session 1 (Feb 24, 2026)
1. Created full Next.js 14 project structure
2. Built Track Record page with:
   - Server-side JSON reading
   - Monthly returns HTML table (green/red color coding)
   - Performance metrics panel (2-col desktop, 1-col mobile)
   - Equity curve display
   - Error handling for missing files
3. Built Home page with institutional design
4. Fixed CSS @import ordering issue (moved Google Fonts to next/font)
5. Fixed date timezone parsing issue
6. Added logo from `/Images/` folder
7. Reordered Track Record sections (Monthly Returns → Metrics → Equity Curve)
8. Added Monday update note
9. Renamed site to "The Market Regime Report"
10. Crawled marketregimes.com Substack to understand business
11. Rewrote Home page with Kevin's actual philosophy and approach
12. Added HeroStats component for prominent metric display
13. Updated all newsletter links to point to www.marketregimes.com
14. Created About page with philosophy, how it works, Kevin's background
15. Updated navigation to include About link
16. Clarified hybrid site architecture (custom + Substack on same domain)
17. Updated nav order: Home, Daily Dashboard, Track Record, Articles, About
18. Matched header to Substack layout:
    - Stacked design (nav row + centered title row)
    - Full-width header (removed max-width constraint)
    - Removed border/divider below header
19. Added active page indicator (thick black underline)
20. Added Spectral font for site title (matches Substack "Fancy Serif")
21. Created NavLink client component for active state detection

---

## Deployment Notes

When deploying, routing needs to be configured so:
- `/`, `/about`, `/track-record` → Custom Next.js app
- All other paths → Substack

Options:
- **Vercel/Netlify**: Redirect rules or reverse proxy
- **Cloudflare**: Page rules or Workers

---

## Contact / Links

- **Substack**: https://www.marketregimes.com
- **Author**: Kevin Fitzpatrick
