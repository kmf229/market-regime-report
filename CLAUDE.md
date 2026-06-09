# Market Regime Capital - Website Project

## Project Overview

This is a Next.js 14+ website for **Market Regime Capital**, a systematic futures trading CTA run by Kevin Fitzpatrick. The site is deployed on Vercel at **marketregimes.com**.

### Site Architecture
This is a CTA (Commodity Trading Advisor) website focused on futures trading:
- **Custom site** (this codebase): `marketregimes.com` — `/`, `/about`, `/track-record`, `/current-regime`
- **Trading instruments**: NQ futures (Nasdaq 100) and GC futures (Gold)

### Navigation Structure
```
[Logo] Market Regime Capital     Home | Current Regime | Track Record | Updates | Strategy | Research | About | Contact | Sign In
```
- **Home** → `/` (custom)
- **Current Regime** → `/current-regime` (protected, requires login)
- **Track Record** → `/track-record` (custom)
- **Updates** → `/updates` (daily market updates)
- **Strategy** → `/the-strategy` (strategy articles)
- **Research** → `/research` (research content)
- **About** → `/about` (custom)
- **Contact** → `/contact` (contact page)

### Business Model
- Currently a CTA website showcasing systematic futures trading approach
- Future: Will manage client capital through a registered fund
- Focus on institutional-quality process and full transparency

### Future Goal
Kevin plans to launch a fund and manage outside capital. The site maintains an institutional, professional aesthetic suitable for a CTA.

---

## Deployment

### Hosting
- **Vercel**: Hosts the Next.js site at `marketregimes.com`
- **GitHub**: Repository at `github.com/kmf229/market-regime-report` (public)
- **Auto-deploy**: Pushes to `main` branch trigger automatic Vercel deployments

### DNS (Squarespace)
| Type | Host | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |
| CNAME | newsletter | target.substack-custom-domains.com |

### Git Workflow
```bash
cd /Users/kmf229/Documents/Trading/Substack/website
git add -A
git commit -m "Your commit message"
git push
```
Or use VS Code: Source Control panel → Stage → Commit → Push

---

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + @tailwindcss/typography (for prose)
- **Fonts**:
  - Inter (sans-serif) - navigation and body text
  - Spectral (serif) - site title
- **Data**: Track record stored in Supabase (updated daily by Pi on weekdays)
- **Articles**: Markdown files in `/content/articles/` with gray-matter frontmatter
- **Markdown Processing**: gray-matter, remark, remark-html
- **Authentication**: Supabase Auth (magic link) + Supabase Postgres
- **Database**: Supabase (profiles table for access control, regime_status table for real-time data)
- **Real-Time Data**: Regime data stored in Supabase, updated by Raspberry Pi every 10 minutes

---

## File Structure

```
website/
├── content/
│   ├── articles/                       # Markdown articles
│   │   └── *.md                        # Article files with frontmatter
│   └── regime-updates/                 # Legacy: Daily updates (now in Supabase)
│       └── YYYY-MM-DD.md               # Migrated to daily_updates table
├── public/
│   ├── images/
│   │   ├── logo.png                    # Site logo
│   │   ├── hero.jpg                    # Home page hero background
│   │   └── [article images]            # Article featured images
│   └── track_record/
│       ├── summary.json                # Performance metrics
│       ├── monthly_returns.json        # Monthly returns grid
│       └── equity_curve.png            # Equity curve chart
├── src/
│   ├── app/
│   │   ├── globals.css                 # Tailwind + custom styles
│   │   ├── layout.tsx                  # Root layout with Header/Footer + auth
│   │   ├── page.tsx                    # Home page (with hero image)
│   │   ├── about/
│   │   │   └── page.tsx                # About page
│   │   ├── articles/
│   │   │   ├── page.tsx                # Article index (thumbnail layout)
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Individual article page (SSG)
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts            # Magic link callback handler
│   │   ├── current-regime/
│   │   │   └── page.tsx                # Protected current regime page
│   │   ├── login/
│   │   │   └── page.tsx                # Login page (magic link)
│   │   └── track-record/
│   │       ├── layout.tsx              # Track Record layout (metadata + revalidate)
│   │       └── page.tsx                # Track Record page (client-side)
│   ├── components/
│   │   ├── Header.tsx                  # Logo + title left, nav right + auth
│   │   ├── NavLink.tsx                 # Active page indicator + highlight
│   │   ├── SignOutButton.tsx           # Client-side sign out button
│   │   ├── ScrollToTop.tsx             # Scroll to top on page load
│   │   ├── TagFilter.tsx               # Article tag filter buttons
│   │   ├── HeroStats.tsx               # Large 4-metric display
│   │   ├── MetricsPanel.tsx            # Detailed metrics grid
│   │   ├── MonthlyReturnsTable.tsx     # Monthly returns HTML table
│   │   ├── EquityCurve.tsx             # Equity curve image display
│   │   ├── RegimeStats.tsx             # Regime statistics panel (4 cards)
│   │   ├── RegimeTimeline.tsx          # Visual regime history bar
│   │   ├── RegimeContext.tsx           # "What this means" explanation card
│   │   ├── RegimeSidebar.tsx           # Left sidebar navigation
│   │   ├── FundingLevelSelector.tsx    # Track record funding level toggle
│   │   └── TradesTable.tsx             # Trade history table
│   ├── lib/
│   │   ├── articles.ts                 # Article reading/parsing utilities
│   │   ├── regime-updates.ts           # Legacy: Regime update reading (markdown)
│   │   ├── daily-updates.ts            # Fetch daily updates from Supabase
│   │   ├── regime-data.ts              # Fetch regime data from Supabase
│   │   ├── track-record-data.ts        # Fetch track record from Supabase
│   │   ├── funding-calculations.ts     # Funding level calculations & adjustments
│   │   └── supabase/
│   │       ├── client.ts               # Browser Supabase client
│   │       ├── server.ts               # Server Supabase client
│   │       └── middleware.ts           # Auth middleware helper
│   ├── middleware.ts                   # Next.js middleware for route protection
│   └── types/
│       ├── article.ts                  # Article TypeScript interfaces
│       ├── regime-update.ts            # Legacy: Regime update interfaces (markdown)
│       ├── daily-update.ts             # Daily update interface (Supabase)
│       ├── regime-data.ts              # Regime data TypeScript interfaces
│       └── track-record.ts             # Track record TypeScript interfaces
├── scripts/
│   ├── update_regime_supabase.py       # Python: update Supabase from notebook/Pi
│   ├── update_track_record.py          # Python: update track record from IBKR
│   ├── pi_scheduler.py                 # Python: Raspberry Pi auto-updater
│   ├── generate_blurb.py               # Python: AI-generated daily blurbs (Claude API)
│   ├── migrate_updates.py              # Python: one-time migration of markdown to Supabase
│   └── migrate_track_record.py         # Python: one-time migration of track record to Supabase
├── supabase/
│   └── migrations/
│       ├── 001_profiles.sql            # Profiles table + RLS policies
│       ├── 002_regime_status.sql       # Regime status table for real-time data
│       ├── 003_daily_updates.sql       # Daily updates table for AI blurbs
│       └── 004_track_record.sql        # Track record table for performance data
├── .env.local.example                  # Environment variables template
├── SETUP_AUTH.md                       # Supabase auth setup guide
├── package.json
├── tsconfig.json
├── tailwind.config.ts                  # Includes typography plugin
├── postcss.config.js
├── next.config.js
└── CLAUDE.md                           # This file
```

---

## Articles System

### Creating a New Article

1. Create a `.md` file in `/content/articles/`
2. Add frontmatter:

```markdown
---
title: "Your Article Title"
date: "YYYY-MM-DD"
description: "Short description for previews and SEO"
slug: "url-slug"
tags: ["tag1", "tag2"]
image: "/images/your-image.jpg"
published: true
---

Your article content in Markdown...
```

3. Add any images to `/public/images/`
4. Commit and push to deploy

### Frontmatter Fields
| Field | Required | Description |
|-------|----------|-------------|
| title | Yes | Article title |
| date | Yes | Publication date (YYYY-MM-DD) |
| description | Yes | Short description for index and SEO |
| slug | Yes | URL slug (must match filename) |
| tags | Yes | Array of tag strings |
| image | No | Featured image path (e.g., `/images/photo.jpg`) |
| published | Yes | `true` to publish, `false` for draft |

### Article Display
- **Index page** (`/articles`): Thumbnail on left, title/description on right
- **Article page** (`/articles/[slug]`): Featured image under title, then content
- **Drafts**: `published: false` articles return 404 and don't appear in index

### Adding Images in Articles
- Put images in `/public/images/`
- Reference as `/images/filename.jpg` (no `public` prefix)
- Featured image: Use `image` field in frontmatter (displays under title)
- Inline images: Use standard markdown `![Alt text](/images/photo.jpg)`

---

## Data Formats

Track record data is stored in Supabase (`track_record` table) with summary metrics as individual columns and monthly returns / daily history as JSONB. Legacy JSON files in `/public/track_record/` are no longer used.

---

## Current Pages

### Home Page (`/`)
- Hero section with background image (`/images/hero.jpg`)
- "Rules-Based Investing. Zero Emotion."
- Philosophy section
- How It Works: Bullish vs Bearish (green/red cards)
- Three pillars
- Dark CTA band (View Track Record)
- Current Regime section with "See Current Regime" button
- Disclaimer

### Track Record Page (`/track-record`)
- **Client-side component** with interactive funding level selector
- **Funding Level Selector**: Toggle between 33%, 50%, 75%, 100% funding
  - 33% = 3x leverage (default, Kevin's actual trading)
  - 50% = 2x leverage
  - 75% = 1.3x leverage
  - 100% = 1x leverage (fully funded)
- All metrics update dynamically when funding level changes:
  - HeroStats: 4 large metrics (Cumulative Return, YTD, CAGR, Max Drawdown)
  - Benchmark Comparison: Strategy metrics recalculate, S&P 500 stays fixed
  - Monthly Returns table: All cells recalculate (green/red)
  - Performance Summary panel: All metrics except % Up Months recalculate
  - Equity Curve: Dynamically rendered canvas chart (updates instantly)
  - Trade History: Equity and return % columns recalculate, P&L stays fixed
- **Math**:
  - Scale factor = 33 / selected_funding_pct
  - All percentage returns × scale factor
  - Starting equity = $250,000 × (funding_pct / 100)
  - Dollar P&L on trades unchanged (only % returns change)
- Disclaimer

### Articles Page (`/articles`)
- Compact header
- Article list with thumbnail layout
- Links to individual articles

### Article Page (`/articles/[slug]`)
- Back link
- Title, date, tags
- Featured image (if set)
- Article content with prose styling
- Footer navigation

### About Page (`/about`)
- The Problem / The Solution
- How It Works: Bullish vs Bearish (green/red cards)
- About Kevin
- What You Get (clickable cards linking to Current Regime, Articles, Track Record)
- CTA section (View Track Record + See Current Regime)
- Disclaimer

### Current Regime Page (`/current-regime`) - Protected
- Requires login (magic link auth)
- Checks `current_regime_access` in profiles table
- **Overview Section**:
  - Speedometer image (from Supabase Storage, updated every 10 min)
  - RegimeContext card explaining current positioning
  - RegimeStats panel (4 cards): Days in regime, YTD changes, avg duration, regime strength
  - RegimeTimeline: Visual bar chart of regime history with month markers
- **Benchmark Comparison**: Current trade performance vs SPY/QQQ/GLD
- Disclaimer

### Login Page (`/login`)
- Email input for magic link
- Success/error states
- Redirects to /current-regime after auth

---

## Regime Updates System

Daily updates are now stored in Supabase (`daily_updates` table) and generated automatically by the Pi. The legacy markdown system in `/content/regime-updates/` has been migrated to the database.

**Speedometer**: Generated by Python script, stored in Supabase Storage bucket `regime-assets`. Threshold: 0.25 (above = bullish, below = bearish).

---

## Real-Time Regime Updates (Supabase + Raspberry Pi)

### Architecture
- **No Vercel redeploy needed** for regime updates
- Regime data stored in Supabase `regime_status` table
- Speedometer image stored in Supabase Storage
- Website fetches from Supabase on each page load (instant updates)
- Raspberry Pi updates data every 10 minutes during market hours

### Regime Strength Scaling
Raw z-spread values are scaled to an intuitive -10 to +10 scale:
- **Threshold (0.25)** = 0 on the scale
- **Bearish side**: Raw -3.5 maps to -10
- **Bullish side**: Raw +3.5 maps to +10
- **Labels**: Weak (0-3.33), Moderate (3.33-6.66), Strong (6.66+)

### Supabase Tables
```sql
-- regime_status (singleton table for current regime data)
regime_status (
  id UUID PRIMARY KEY,
  current_regime TEXT ('bullish' or 'bearish'),
  regime_strength DECIMAL,
  strength_change DECIMAL,
  last_updated TIMESTAMPTZ,
  days_in_current_regime INTEGER,
  regime_changes_this_year INTEGER,
  avg_regime_duration_days INTEGER,
  regime_history JSONB,
  speedometer_url TEXT
)
```

### Supabase Storage
- **Bucket**: `regime-assets` (public)
- **File**: `speedometer.png`

### Updating from Jupyter Notebook (Manual/Backup)
```python
import os
os.environ["SUPABASE_URL"] = "https://your-project.supabase.co"
os.environ["SUPABASE_SERVICE_KEY"] = "your-service-key"

import sys
sys.path.insert(0, 'website/scripts')
from update_regime_supabase import update_all

# After calculating regime_s and z_spread_smoothed:
update_all(regime_s, z_spread_smoothed, "path/to/speedometer.png")
```

### Raspberry Pi Setup (COMPLETED)
The Pi automatically updates regime data every 10 minutes during market hours.

**Pi Details:**
- **IP**: `192.168.1.163`
- **User**: `kmf229`
- **Working directory**: `/home/kmf229/market-regime/`
- **Python**: Virtual environment (`venv`)

**Files on Pi:**
```
/home/kmf229/market-regime/
├── pi_scheduler.py           # Main scheduler script
├── update_regime_supabase.py # Supabase update functions
├── update_track_record.py    # IBKR track record updates
├── generate_blurb.py         # AI daily blurb generation
├── stocks_simple.py          # Polygon.io API wrapper
├── trading_days.py           # Market holiday detection
├── venv/                     # Python virtual environment
└── .env                      # All credentials
```

**Environment variables in `.env`:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
ANTHROPIC_API_KEY=your-anthropic-key
RESEND_API_KEY=re_your-resend-key
IBKR_FTP_USER=your-ibkr-ftp-username
IBKR_FTP_PASS=your-ibkr-ftp-password
```

**Systemd service** (`/etc/systemd/system/regime-updater.service`):
```ini
[Unit]
Description=Market Regime Updater
After=network.target

[Service]
Type=simple
User=kmf229
WorkingDirectory=/home/kmf229/market-regime
EnvironmentFile=/home/kmf229/market-regime/.env
ExecStart=/home/kmf229/market-regime/venv/bin/python /home/kmf229/market-regime/pi_scheduler.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Manage service:**
```bash
sudo systemctl restart regime-updater  # Restart after changes
sudo systemctl status regime-updater   # Check status
journalctl -u regime-updater -f        # View logs
```

**Scheduled tasks:**
| Task | Schedule | Description |
|------|----------|-------------|
| Regime updates | Every 10 min (market hours) | Update regime data + speedometer |
| Close regime update | 4:16pm ET | Official regime flip at market close |
| Track record | Weekdays 8:00am ET | Update from IBKR FTP |
| Weekly digest | Sunday 8:00am ET | Send weekly summary email |

**GPG Setup for IBKR Decryption:**
GPG private key is installed on Pi with no passphrase for automated decryption.
```bash
# gpg-agent configured for loopback pinentry
~/.gnupg/gpg-agent.conf:
  allow-loopback-pinentry

~/.gnupg/gpg.conf:
  pinentry-mode loopback
```

---

## Authentication System

### Overview
- **Provider**: Supabase Auth with magic link (email)
- **Session**: ~30 days via refresh tokens
- **Protected Route**: `/current-regime`

### Database Schema
```sql
profiles (
  id UUID PRIMARY KEY → auth.users.id,
  email TEXT,
  current_regime_access BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP
)
```

### Access Control
- Middleware redirects unauthenticated users to `/login`
- Page checks `current_regime_access` in profiles table
- If `false`, shows "Access Not Enabled" message

### Managing Access
```sql
-- Disable access for a user
UPDATE profiles SET current_regime_access = FALSE WHERE email = 'user@example.com';

-- Enable access for a user
UPDATE profiles SET current_regime_access = TRUE WHERE email = 'user@example.com';
```

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Design Guidelines

### Colors
- **Positive**: `text-emerald-600` (#16a34a)
- **Negative**: `text-red-600` (#dc2626)
- **Neutral**: `text-gray-500` (#6b7280)
- **Backgrounds**: `bg-gray-50`, `bg-gray-900`

### Typography
- **Site title**: Spectral (serif), `font-spectral`
- **Navigation/Body**: Inter (sans-serif)
- **Article prose**: Tailwind Typography plugin

### Header Layout
- Single row: Logo + "The Market Regime Report" on left, nav links on right
- Subtle bottom border
- Mobile: Hamburger menu

### Footer
- Copyright: "© 2026 The Market Regime Report. All rights reserved."

---

## Important Implementation Notes

1. **Date Parsing**: Split YYYY-MM-DD strings to avoid timezone issues
2. **Articles are SSG**: Uses `generateStaticParams()` for static generation
3. **NavLink is a Client Component**: Uses `usePathname()` for active state
4. **Images**: Use Next.js `Image` component with `fill` prop for responsive images

---

## Running Locally

```bash
cd /Users/kmf229/Documents/Trading/Substack/website
npm install
npm run dev
```

Open http://localhost:3000

---

## Key Milestones

**Feb-Mar 2026**: Initial build - Next.js site with Track Record, Articles system, Supabase auth (magic link), Current Regime page with speedometer, Raspberry Pi automation for real-time regime updates every 10 minutes.

**Mar 2026**: Automated track record updates from IBKR FTP (GPG decryption), S&P 500 benchmark comparison, AI-generated daily blurbs (Claude API), intraday vs close regime logic (signal_regime vs current_regime), "potential regime change" alerts.

**May 2026**: Substack Notes automation system (3 note types: observational/philosophy/reactive), randomized scheduling, SQLite tracking, disabled daily blurbs to reduce Claude API costs.

**Jun 2026**: Interactive funding level selector on Track Record page (33%/50%/75%/100% funding with dynamic recalculation of all metrics), removed email alert system for simplification.

---

## TODO

---

## Future Enhancement Ideas

- Drawdown chart on Track Record page
- Rolling returns display
- Export data to CSV (regime history, track record)
- "Last updated" timestamp on Current Regime page
- Mobile app / PWA

---

## Contact / Links

- **Website**: https://marketregimes.com
- **Newsletter**: https://newsletter.marketregimes.com
- **GitHub**: https://github.com/kmf229/market-regime-report
- **Author**: Kevin Fitzpatrick
