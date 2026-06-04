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

### summary.json
```json
{
  "start_date": "YYYY-MM-DD",
  "data_through": "YYYY-MM-DD",
  "strategy_length_days": number,
  "strategy_length_years": number,
  "cumulative_return": 0.1765,
  "cagr": 0.12,
  "max_drawdown": -0.15,
  "sharpe_ratio": 1.5,
  "avg_monthly_return": 0.02,
  "best_month_return": 0.08,
  "best_month_label": "YYYY-MM",
  "worst_month_return": -0.05,
  "worst_month_label": "YYYY-MM",
  "up_months_pct": 0.75
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
      "YTD": 0.05
    }
  ]
}
```

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
- **Layout**: Left sidebar navigation + main content area
- **Overview Section**:
  - Speedometer image (from Supabase Storage, updated every 10 min)
  - RegimeContext card explaining current positioning
  - RegimeStats panel (4 cards): Days in regime, YTD changes, avg duration, regime strength
  - RegimeTimeline: Visual bar chart of regime history with month markers
- **Daily Updates Section**: Manual markdown updates with bullish/bearish badges
- **History Section**: Table of regime periods with dates, duration, returns
- Disclaimer

### Login Page (`/login`)
- Email input for magic link
- Success/error states
- Redirects to /current-regime after auth

---

## Regime Updates System

### Creating a Daily Update

1. Create a `.md` file in `/content/regime-updates/` named `YYYY-MM-DD.md`
2. Add frontmatter:

```markdown
---
date: "2026-02-26"
regime: "bullish"
published: true
---

Your daily update content here...
```

### Frontmatter Fields
| Field | Required | Values |
|-------|----------|--------|
| date | Yes | YYYY-MM-DD format |
| regime | Yes | `bullish` or `bearish` |
| published | Yes | `true` to publish, `false` for draft |

### Speedometer Image
- Generated by Python script (see Real-Time Updates section)
- Stored in Supabase Storage bucket `regime-assets`
- Falls back to `/public/images/regime_speedometer.png` if not available
- Threshold: 0.25 (above = bullish, below = bearish)

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
| Regime alerts | 3:30pm ET | Check for regime changes |
| Daily blurb | 4:15pm ET | Generate AI market commentary |
| Store closing regime | 4:16pm ET | Save for next day comparison |
| Substack note | 4:17pm ET | Generate and email note |
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

## Session History

### Session 1 (Feb 24, 2026)
- Created Next.js project structure
- Built Track Record, Home, About pages
- Added logo, fonts, responsive design
- Matched Substack header style

### Session 2 (Feb 25, 2026)
1. Added hero background image to home page
2. Deployed to Vercel
3. Set up GitHub repository (`kmf229/market-regime-report`)
4. Configured DNS:
   - `marketregimes.com` → Vercel
   - `newsletter.marketregimes.com` → Substack
5. Separated site from newsletter navigation
6. Redesigned header: logo + title left, nav right (single row)
7. Added Markdown article system:
   - gray-matter for frontmatter
   - remark + remark-html for parsing
   - @tailwindcss/typography for prose styling
8. Created `/articles` index and `/articles/[slug]` pages
9. Added featured image support:
   - `image` field in frontmatter
   - Thumbnail on index page (left side)
   - Full image under title on article page
10. Updated copyright to "The Market Regime Report"
11. Converted Substack article "How This Strategy Works" to Markdown

### Session 3 (Feb 26, 2026)
1. Added favicon from logo
2. Created Current Regime page (`/current-regime`):
   - Regime speedometer image (Python-generated)
   - Daily updates with bullish/bearish badges
   - Header + speedometer side-by-side layout
3. Created regime speedometer Python script (`regime_gauge.py`):
   - Institutional-style gradient gauge
   - Threshold at 0.25 (centered)
   - "Bullish" or "Bearish" label below
4. Added highlighted nav link (sky blue pill) for Current Regime
5. Created regime updates system in `/content/regime-updates/`
6. Implemented Supabase authentication:
   - Magic link (passwordless email) login
   - 30-day session persistence (cookies with maxAge)
   - Protected `/current-regime` route
   - Profiles table with `current_regime_access` field
   - Sign In/Sign Out in header
   - Row Level Security (RLS) policies
   - Custom SMTP via Gmail for email delivery
7. Added middleware for route protection
8. Created SETUP_AUTH.md with full Supabase setup guide
9. Changed terminology from Risk-On/Risk-Off to Bullish/Bearish throughout
10. Updated About page:
    - Made "What You Get" cards clickable (Current Regime, Articles, Track Record)
    - Changed CTA button to "See Current Regime"
11. Updated Home page:
    - Changed "Follow the Regime" section to link to Current Regime
    - Removed Substack pricing line
12. Added ScrollToTop component for Current Regime and Track Record pages
13. Configured `force-dynamic` on layout to prevent Vercel caching auth state

### Session 4 (Mar 4, 2026)
1. **Site Improvements**:
   - Added Open Graph meta tags for social sharing (Twitter/LinkedIn previews)
   - Added related articles section to article pages (based on shared tags)
   - Added reading time to articles (e.g., "8 min read")
   - Added RSS feed at `/rss.xml`
   - Added tag filtering on articles page (clickable tag pills)
   - Created custom 404 page

2. **Current Regime Page Redesign**:
   - Added left sidebar navigation (Overview, Daily Updates, History)
   - Created RegimeStats component (4 stat cards)
   - Created RegimeTimeline component (visual bar chart with month markers)
   - Created RegimeContext component ("What this means" card)
   - Added Regime History table with period returns

3. **Regime Strength Scaling**:
   - Converted raw z-spread to intuitive -10 to +10 scale
   - Threshold (0.25) = 0 on scale
   - Labels: Weak/Moderate/Strong based on distance from threshold
   - Info tooltip explaining the metric

4. **Supabase Integration for Real-Time Updates**:
   - Created `regime_status` table for regime data
   - Created `regime-assets` storage bucket for speedometer image
   - Website now fetches from Supabase (no redeploy needed for updates)
   - Created Python script `update_regime_supabase.py` for updating from notebook

5. **Raspberry Pi Scheduler**:
   - Created `pi_scheduler.py` for automatic updates
   - Runs every 10 minutes during market hours (9:30am-4:15pm ET)
   - Includes systemd service config for auto-start on boot

### Session 5 (Mar 5, 2026)
1. **Automated Daily Blurbs**:
   - Created `daily_updates` table in Supabase (migration: `003_daily_updates.sql`)
   - Created `generate_blurb.py` script for AI-generated daily updates
   - Uses Claude API (Anthropic) with detailed system prompt
   - Fetches TQQQ/GLD OHLCV data and regime strength for context
   - Updated `pi_scheduler.py` to generate blurbs at 4:15pm ET
   - Added markdown stripping to clean up Claude's output

2. **Website Changes**:
   - Created `/src/lib/daily-updates.ts` to fetch from Supabase
   - Created `/src/types/daily-update.ts` TypeScript interface
   - Updated `/current-regime/page.tsx` to read from Supabase instead of markdown files
   - Blurbs now stored as plain text (no markdown processing needed)
   - Added `DailyUpdates` component with pagination (shows 5, "Show more" for rest)
   - Created `/src/lib/regime-helpers.ts` for client/server compatible helpers

3. **Migration Script**:
   - Created `migrate_updates.py` to move existing markdown updates to Supabase
   - One-time script to run after creating the table

4. **Raspberry Pi Setup** (COMPLETED):
   - Connected to Pi at `192.168.1.163` via SSH (user: `kmf229`)
   - Created `/home/kmf229/market-regime/` working directory
   - Set up Python virtual environment (`venv`)
   - Installed dependencies: supabase, python-dotenv, schedule, pandas, numpy, matplotlib, pytz, anthropic, requests
   - Created `stocks_simple.py` using Polygon.io API (not yfinance)
   - Copied `trading_days.py` for market holiday detection
   - Created `.env` file with SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY
   - Set up systemd service (`regime-updater.service`) to run on boot
   - Added `PYTHONUNBUFFERED=1` for real-time log output

5. **Trading Day Detection**:
   - Updated `pi_scheduler.py` with `is_trading_day()` function
   - Uses `trading_days.py` to check for market holidays
   - Scheduler now skips weekends AND holidays (Good Friday, Thanksgiving, etc.)
   - Both regime updates and blurb generation respect trading days

6. **Regime History Returns** (COMPLETED):
   - Updated `update_regime_supabase.py` to calculate returns for each regime period
   - Bullish periods: TQQQ return (buy at close on start, sell at close on end)
   - Bearish periods: GLD return (buy at close on start, sell at close on end)
   - Fixed date logic: regime flip date is the END of old period (exit at close)
   - Returns now display in Regime History table on Current Regime page

### Session 6 (Mar 9, 2026)
1. **Automated Track Record Updates**:
   - Created `track_record` Supabase table (migration: `004_track_record.sql`)
   - Stores: summary metrics, monthly returns (JSONB), daily P&L history (JSONB), equity curve URL
   - Created `update_track_record.py` script for Pi automation
   - Downloads from IBKR FTP, decrypts with GPG, calculates metrics, uploads to Supabase
   - Updated `pi_scheduler.py` to run track record update every weekday at 8am ET

2. **Website Changes**:
   - Created `/src/lib/track-record-data.ts` to fetch from Supabase
   - Updated `/src/app/track-record/page.tsx` to use Supabase data
   - Updated `EquityCurve` component to accept external image URL
   - Added `revalidate = 60` for automatic data refresh without redeploy
   - Updated `next.config.js` to allow images from Supabase Storage

3. **Migration Script**:
   - Created `migrate_track_record.py` to load existing JSON data into Supabase
   - One-time script to run after creating the table

4. **Pi Requirements for Track Record**:
   - GPG must be installed with decryption key for IBKR files
   - Environment variables needed: `IBKR_FTP_USER`, `IBKR_FTP_PASS`
   - Daily history now stored in Supabase (no local CSV needed)

### Session 7 (Mar 19, 2026)
1. **Improved Daily Blurb Generation**:
   - Updated `generate_blurb.py` prompt to highlight significant daily moves
   - TQQQ moves >2% must be mentioned with actual percentage
   - GLD moves >1.5% must be mentioned with actual percentage
   - Prevents vague language like "mixed action" when big moves happen

2. **Track Record Pi Automation** (COMPLETED):
   - Updated `update_track_record.py` for Pi compatibility:
     - Uses plain FTP (not FTPS) for IBKR connection
     - Added S&P 500 benchmark comparison (same as mac version)
     - Fixed pandas `"ME"` deprecation (was `"M"` for month-end resample)
     - Added `--yes` flag to GPG for non-interactive decryption
     - Added `matplotlib.use('Agg')` for headless operation
   - Set up GPG on Pi:
     - Exported private key from Mac, imported on Pi
     - Configured `gpg-agent` for loopback pinentry mode
     - Removed passphrase from key for fully automated operation
   - Updated `pi_scheduler.py` systemd config for `kmf229` user
   - Track record now auto-updates every weekday at 8am ET

3. **Fixed Daily Blurb Accuracy Issues** (CRITICAL FIX):
   - **Problem**: Claude was calculating daily percentages incorrectly (had TQQQ/GLD swapped)
   - **Solution**: Pre-calculate percentages in Python, pass exact values to Claude
   - Changes to `generate_blurb.py`:
     - Added `calculate_daily_change()` function to compute exact daily % moves
     - Added `format_daily_performance()` to create explicit data for prompt
     - Removed raw OHLCV data from prompt (Claude was misreading it)
     - Updated prompt to use pre-calculated values only
     - Added explicit instruction: "Do NOT compute your own percentages"
     - Added `--debug` flag to verify data without calling Claude
   - Removed prices from output:
     - Updated prompt with "NEVER mention prices or dollar values"
     - Only percentages are discussed now
   - Added P&L milestone tracking:
     - Uses `regime_status.current_trade_return` for real-time trade P&L
     - Uses `track_record.summary` for overall strategy return
     - Detects milestones: crossing zero, significant drawdowns, etc.

4. **Deploying Scripts to Pi**:
   ```bash
   # Copy updated scripts
   scp scripts/generate_blurb.py kmf229@192.168.1.163:/home/kmf229/market-regime/
   scp scripts/update_track_record.py kmf229@192.168.1.163:/home/kmf229/market-regime/
   scp scripts/pi_scheduler.py kmf229@192.168.1.163:/home/kmf229/market-regime/

   # Restart service
   ssh kmf229@192.168.1.163 "sudo systemctl restart regime-updater"
   ```

### Session 8 (Mar 25, 2026)
1. **Intraday vs Close Regime Logic** (MAJOR CHANGE):
   - **Problem**: Regime was flipping intraday before market close, showing TQQQ stats when still officially in GLD
   - **Solution**: Separate "signal regime" (real-time) from "official regime" (confirmed at close)
   - Database changes:
     - Added `signal_regime` column to `regime_status` table (migration: `007_signal_regime.sql`)
     - `signal_regime`: Real-time intraday signal (updated every 10 min)
     - `current_regime`: Official confirmed regime (only changes at 4pm ET close)
   - Python changes (`update_regime_supabase.py`):
     - Added `update_intraday()` function: Only updates signal_regime, strength, speedometer
     - Added `update_intraday_all()` convenience function
     - Modified `update_regime_status()` to be the "close" update
   - Python changes (`pi_scheduler.py`):
     - 10-min updates now use `update_intraday_all()` (signal only)
     - 4:16pm close update now does full regime flip via `update_all()`
   - Frontend changes:
     - Added `signalRegime` to TypeScript types
     - RegimeStats: Trade stats use `currentRegime` (official), Strength card uses `signalRegime`
     - LiveRegimeStatus: Added "Potential Regime Change" alert card (amber warning)
     - RegimeContext: Receives `signalRegime` prop, adjusted "approaching threshold" logic

2. **Potential Regime Change Alert**:
   - New amber alert card appears when `signalRegime != currentRegime`
   - Shows: "The intraday signal is now showing [bullish/bearish], but the regime won't officially flip until market close at 4pm ET"
   - Disappears once the close confirms the new regime

3. **Deploying Changes**:
   ```bash
   # 1. Run SQL migration on Supabase Dashboard:
   #    Copy contents of supabase/migrations/007_signal_regime.sql

   # 2. Push website changes (auto-deploys to Vercel)
   git add -A && git commit -m "Add intraday signal regime logic" && git push

   # 3. Copy updated scripts to Pi
   scp scripts/update_regime_supabase.py kmf229@192.168.1.163:/home/kmf229/market-regime/
   scp scripts/pi_scheduler.py kmf229@192.168.1.163:/home/kmf229/market-regime/

   # 4. Restart Pi service
   ssh kmf229@192.168.1.163 "sudo systemctl restart regime-updater"
   ```

### Session 9 (May 6, 2026)
1. **Substack Notes Automation System** (NEW FEATURE):
   - Built complete automated system for generating Substack Notes using Claude AI
   - 3 note types: Observational (morning), Philosophy (midday), Reactive (market close)
   - Notes sent via email for manual posting (not auto-posted)
   - Created modular architecture with 7 Python modules:
     - `database.py` - SQLite storage for all generated notes
     - `market_data.py` - Polygon.io API for OHLCV data (SPY, TQQQ, GLD)
     - `prompts.py` - Load/format prompt templates with placeholder replacement
     - `ai_client.py` - Claude API wrapper (Claude Sonnet 4)
     - `sms_client.py` - Email delivery via Resend
     - `main.py` - CLI entry point with manual testing support
     - `README.md`, `DEPLOY.md`, `SUMMARY.md` - Complete documentation

2. **Features**:
   - Avoids repetition: Analyzes last 10 notes of same type + last 5 overall
   - Market-aware: Real-time OHLCV data for observational/reactive notes
   - Randomized scheduling: Different time each day within windows
   - Trading days only: Skips weekends and market holidays
   - 3 options per batch: Gives variety for manual selection
   - Database tracking: All notes stored with metadata

3. **Scheduler Integration**:
   - Updated `pi_scheduler.py` to add notes scheduling
   - Random time windows:
     - Observational: 9:25am - 10:30am ET
     - Philosophy: 11:30am - 1:00pm ET
     - Reactive: 4:00pm - 4:15pm ET
   - **Disabled daily blurb generation** (saves Claude credits)
   - Integrated with existing systemd service

4. **Environment Variables Added**:
   ```bash
   POLYGON_API_KEY=your-polygon-api-key
   NOTES_EMAIL=your-email@example.com
   FROM_EMAIL=alerts@marketregimes.com
   ```

5. **Database Schema** (SQLite):
   ```sql
   CREATE TABLE notes (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       note_type TEXT NOT NULL,
       prompt_used TEXT,
       market_data_used TEXT,
       generated_note_options TEXT NOT NULL,
       selected_or_posted_note TEXT,
       status TEXT DEFAULT 'generated'
   )
   ```

6. **Deployment Instructions**:
   - Copy `notes_automation/` to Pi: `/home/kmf229/market-regime/`
   - Install new dependencies: `anthropic`, `resend`, `requests`
   - Update `.env` with new variables
   - Initialize database: `python -m notes_automation.main --type observational --init-db`
   - Test components independently
   - Restart systemd service
   - See `DEPLOY.md` for full step-by-step guide

7. **Cost Impact**:
   - Removed daily blurb (saves ~365K tokens/year)
   - Added 3 notes/day (uses ~750K tokens/year on trading days)
   - Net: Slightly higher usage, but manual control and higher quality

### Session 10 (Jun 4, 2026)
1. **Interactive Funding Level Selector** (NEW FEATURE):
   - Added interactive toggle to Track Record page showing performance at different leverage levels
   - 4 funding options: 33% (3x leverage, default), 50% (2x), 75% (1.3x), 100% (1x)
   - All metrics update dynamically without page reload
   - Pure frontend transformation - no API changes needed

2. **Technical Implementation**:
   - Created `lib/funding-calculations.ts` with all calculation logic:
     - `adjustReturn()` - Scale individual returns based on funding level
     - `adjustSummary()` - Recalculate all summary metrics
     - `adjustMonthlyReturns()` - Scale monthly returns table
     - `adjustTrades()` - Recalculate trade equity values
     - `generateEquityCurve()` - Build equity curve data
   - Created `FundingLevelSelector.tsx` - Toggle button component
   - Updated `EquityCurve.tsx` to use Canvas for dynamic chart rendering
   - Converted Track Record page to client-side component with React state
   - Created `track-record/layout.tsx` for metadata (client components can't export metadata)

3. **Math & Calculations**:
   - Scale factor: `33 / selected_funding_pct` (default is 33%)
   - Adjusted return: `original_return × scale_factor`
   - Starting equity: `$250,000 × (funding_pct / 100)`
   - Dollar P&L stays constant, only percentage returns change
   - All derived metrics (CAGR, Sharpe, max drawdown, etc.) recalculated from adjusted returns

4. **What Updates Dynamically**:
   - Hero stats: Cumulative Return, YTD, CAGR, Max Drawdown
   - Benchmark comparison: Strategy column recalculates, S&P 500 stays fixed
   - Monthly returns table: All cells and YTD recalculate
   - Performance summary: All metrics except % Up Months recalculate
   - Equity curve: Canvas chart regenerates with new scale
   - Trade history: Equity and return % columns recalculate, P&L unchanged

5. **User Experience**:
   - Default view: 33% funding (Kevin's actual trading at 3x leverage)
   - Instant updates when clicking different funding levels
   - Smooth transitions, no loading spinners
   - Mobile-responsive toggle buttons
   - Clear explanation text below selector

---

## TODO for Next Session

No critical items remaining. See Future Enhancements for potential improvements.

---

## Future Enhancements

### Current Regime Page Ideas
- [ ] **Benchmark comparison** - Show strategy cumulative return vs buy-and-hold SPY
- [ ] **Performance metrics card** - Sharpe ratio, max drawdown, win rate
- [ ] **"Last updated" timestamp** - Show "Updated X minutes ago" for freshness
- [ ] **Cumulative return chart** - Visual equity curve for the strategy
- [ ] **Regime change alerts** - Email notification when regime flips (could integrate with Substack)
- [ ] **Export data** - Download regime history as CSV

### Other Ideas
- [ ] Drawdown chart on Track Record page
- [ ] Rolling returns display
- [ ] Mobile app / PWA
- [ ] Export track record data as CSV

### Completed
- [x] Regime history timeline (Session 4)
- [x] Open Graph meta tags
- [x] Related articles
- [x] Reading time
- [x] RSS feed
- [x] Tag filtering
- [x] Custom 404 page
- [x] Real-time regime updates via Supabase + Raspberry Pi (Session 5)
- [x] Automated AI-generated daily blurbs (Session 5)
- [x] Trading day detection for holidays (Session 5)
- [x] Regime period returns calculation (Session 5)
- [x] Daily updates pagination (Session 5)
- [x] Automated Track Record updates via Supabase + Pi (Session 6)
- [x] Track Record Pi automation with GPG (Session 7)
- [x] S&P 500 benchmark in Track Record (Session 7)
- [x] Improved daily blurb prompt for significant moves (Session 7)
- [x] Fixed daily blurb accuracy (pre-calculated percentages) (Session 7)
- [x] Removed prices from daily blurbs (Session 7)
- [x] P&L milestone tracking in daily blurbs (Session 7)
- [x] Intraday vs close regime confirmation logic (Session 8)
- [x] Potential regime change alert card (Session 8)
- [x] Substack Notes automation system (Session 9)
- [x] Interactive funding level selector on Track Record page (Session 10)
- [x] Dynamic equity curve rendering with Canvas (Session 10)

---

## Contact / Links

- **Website**: https://marketregimes.com
- **Newsletter**: https://newsletter.marketregimes.com
- **GitHub**: https://github.com/kmf229/market-regime-report
- **Author**: Kevin Fitzpatrick
