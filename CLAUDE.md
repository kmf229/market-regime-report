# The Market Regime Report - Website Project

## Project Overview

This is a Next.js 14+ website for **The Market Regime Report**, a systematic trading newsletter run by Kevin Fitzpatrick. The site is deployed on Vercel at **marketregimes.com**, with the Substack newsletter at **newsletter.marketregimes.com**.

### Site Architecture
The site and newsletter are now **separate domains**:
- **Custom site** (this codebase): `marketregimes.com` — `/`, `/about`, `/track-record`, `/articles`
- **Substack newsletter**: `newsletter.marketregimes.com` — daily dashboards, paid content, subscriber management

### Navigation Structure
```
[Logo] The Market Regime Report     Home | Current Regime | Track Record | Articles | About | Newsletter | Sign In
```
- **Home** → `/` (custom)
- **Current Regime** → `/current-regime` (protected, requires login)
- **Track Record** → `/track-record` (custom)
- **Articles** → `/articles` (custom, Markdown-based)
- **About** → `/about` (custom)
- **Newsletter** → `newsletter.marketregimes.com` (Substack, opens in new tab)

### Business Model
- **Free**: Home, About, Track Record, Articles
- **Paid ($7/mo or $70/yr)**: Daily dashboards, regime signals, current positioning (on Substack)

### Future Goal
Kevin plans to eventually open an RIA (Registered Investment Advisor) to manage outside money, so the site should maintain an institutional, professional aesthetic.

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
- **Data**: Static JSON files in `/public/track_record/`
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
│   └── regime-updates/                 # Daily regime updates
│       └── YYYY-MM-DD.md               # Daily update files
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
│   │       └── page.tsx                # Track Record page
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
│   │   └── RegimeSidebar.tsx           # Left sidebar navigation
│   ├── lib/
│   │   ├── articles.ts                 # Article reading/parsing utilities
│   │   ├── regime-updates.ts           # Regime update reading/parsing
│   │   ├── regime-data.ts              # Fetch regime data from Supabase
│   │   └── supabase/
│   │       ├── client.ts               # Browser Supabase client
│   │       ├── server.ts               # Server Supabase client
│   │       └── middleware.ts           # Auth middleware helper
│   ├── middleware.ts                   # Next.js middleware for route protection
│   └── types/
│       ├── article.ts                  # Article TypeScript interfaces
│       ├── regime-update.ts            # Regime update TypeScript interfaces
│       ├── regime-data.ts              # Regime data TypeScript interfaces
│       └── track-record.ts             # Track record TypeScript interfaces
├── scripts/
│   ├── update_regime_supabase.py       # Python: update Supabase from notebook/Pi
│   └── pi_scheduler.py                 # Python: Raspberry Pi auto-updater
├── supabase/
│   └── migrations/
│       ├── 001_profiles.sql            # Profiles table + RLS policies
│       └── 002_regime_status.sql       # Regime status table for real-time data
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
- HeroStats: 4 large metrics
- Monthly Returns table (green/red)
- Performance Summary panel
- Equity Curve image
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

### Raspberry Pi Setup (TODO)
The Pi automatically updates regime data every 10 minutes during market hours.

**Files to copy to Pi:**
```
/home/pi/market-regime/
├── pi_scheduler.py          # Main scheduler script
├── update_regime_supabase.py # Supabase update functions
├── stocks.py                 # Your stock data module
└── .env                      # Supabase credentials
```

**Setup steps:**
1. Copy files to Pi:
   ```bash
   scp -r scripts/ pi@<PI_IP>:/home/pi/market-regime/
   scp stocks.py pi@<PI_IP>:/home/pi/market-regime/
   ```

2. SSH into Pi and install dependencies:
   ```bash
   ssh pi@<PI_IP>
   cd /home/pi/market-regime
   pip install supabase python-dotenv schedule pandas numpy matplotlib pytz
   ```

3. Create `.env` file:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key
   ```

4. Test the script:
   ```bash
   python pi_scheduler.py
   ```

5. Set up as systemd service (survives reboot):
   ```bash
   sudo nano /etc/systemd/system/regime-updater.service
   ```

   Paste:
   ```ini
   [Unit]
   Description=Market Regime Updater
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/market-regime
   Environment=SUPABASE_URL=https://your-project.supabase.co
   Environment=SUPABASE_SERVICE_KEY=your-service-key
   ExecStart=/usr/bin/python3 /home/pi/market-regime/pi_scheduler.py
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

6. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable regime-updater
   sudo systemctl start regime-updater
   sudo systemctl status regime-updater
   ```

**Schedule**: Every 10 minutes, Mon-Fri, 9:30am-4:15pm ET (extra 15 min for delayed data)

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

---

## Future Enhancements

### Planned
- [ ] Benchmark comparison (S&P 500/QQQ)
- [ ] Drawdown chart
- [ ] Rolling returns display
- [x] Regime history timeline (completed Session 4)

### Completed
- [x] Open Graph meta tags
- [x] Related articles
- [x] Reading time
- [x] RSS feed
- [x] Tag filtering
- [x] Custom 404 page
- [x] Real-time regime updates (Supabase + Pi)

---

## Contact / Links

- **Website**: https://marketregimes.com
- **Newsletter**: https://newsletter.marketregimes.com
- **GitHub**: https://github.com/kmf229/market-regime-report
- **Author**: Kevin Fitzpatrick
