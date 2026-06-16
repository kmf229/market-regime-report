# Market Regime Capital - Website Project

## Project Overview

This is a Next.js 14+ website for **Market Regime Capital**, a systematic futures trading CTA run by Kevin Fitzpatrick. The site is deployed on Vercel at **marketregimes.com**.

### Site Architecture
Pre-registration CTA website for institutional investors:
- **Site**: `marketregimes.com` — Public-facing institutional marketing site
- **Trading instruments**: Liquid futures (specific instruments not disclosed to protect proprietary methodology)
- **Business stage**: Building auditable track record for CFTC/NFA registration (target: 2027-2028)

### Navigation Structure
```
[Logo] Market Regime Capital     Home | About | Approach | Track Record | Insights | Contact
```
- **Home** → `/` - Investment thesis and edge explanation
- **About** → `/about` - Firm information, leadership, credibility
- **Approach** → `/approach` - Methodology, portfolio fit, differentiation from CTAs
- **Track Record** → `/track-record` - Live performance data with disclaimer
- **Insights** → `/insights` - Consolidated articles (market commentary, research, strategy)
- **Contact** → `/contact` - Contact form (Resend API)

**REMOVED (June 2026 overhaul):**
- `/current-regime` - No live signals publicly visible
- `/login` - No authentication system
- `/updates`, `/the-strategy`, `/research` - Consolidated into `/insights`

### Business Model
- **Pre-registration CTA** building institutional-quality track record
- All trades executed with real capital, documented in real-time
- Performance data available upon request for qualified investors
- Target registration: 2027-2028 with CFTC/NFA
- Positioning: Institutional allocators, not retail investors
- Live trading commenced: November 2025

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
- **Data**: Track record stored in Supabase (updated daily by Pi on weekdays at 8am ET)
- **Articles**: Markdown files in `/content/articles/` with gray-matter frontmatter
- **Markdown Processing**: gray-matter, remark, remark-html
- **Contact Form**: Resend API for email delivery
- **Database**: Supabase (track_record table for performance data)
- **Authentication**: REMOVED (June 2026) - No login system, no protected pages

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
│   │   ├── layout.tsx                  # Root layout with Header/Footer (no auth)
│   │   ├── page.tsx                    # Home page (institutional messaging)
│   │   ├── about/
│   │   │   └── page.tsx                # About page (firm info, leadership)
│   │   ├── api/
│   │   │   └── contact/
│   │   │       └── route.ts            # Contact form API (Resend)
│   │   ├── approach/
│   │   │   └── page.tsx                # Methodology, portfolio fit, differentiation
│   │   ├── articles/
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Individual article page (SSG)
│   │   ├── contact/
│   │   │   └── page.tsx                # Contact page with form
│   │   ├── insights/
│   │   │   └── page.tsx                # Consolidated articles hub
│   │   └── track-record/
│   │       └── page.tsx                # Track Record page (client-side)
│   ├── components/
│   │   ├── BenchmarkComparison.tsx     # Strategy vs S&P 500 comparison
│   │   ├── ContactForm.tsx             # Contact form (Resend integration)
│   │   ├── Disclaimer.tsx              # Reusable disclaimer (4 variants)
│   │   ├── EquityCurveWithFunding.tsx  # Equity curve with funding selector
│   │   ├── FundingLevelSelector.tsx    # Track record funding level toggle
│   │   ├── Header.tsx                  # Logo + title left, nav right (no auth)
│   │   ├── HeroStats.tsx               # Large 4-metric display
│   │   ├── InsightsFilter.tsx          # Category filter for articles
│   │   ├── MetricsPanel.tsx            # Detailed metrics grid
│   │   ├── MonthlyReturnsTable.tsx     # Monthly returns HTML table
│   │   ├── NavLink.tsx                 # Active page indicator
│   │   └── ScrollToTop.tsx             # Scroll to top on page load
│   ├── lib/
│   │   ├── articles.ts                 # Article reading/parsing utilities
│   │   ├── track-record-data.ts        # Fetch track record from Supabase
│   │   ├── funding-calculations.ts     # Funding level calculations & adjustments
│   │   └── supabase/
│   │       ├── client.ts               # Browser Supabase client
│   │       └── server.ts               # Server Supabase client
│   └── types/
│       ├── article.ts                  # Article TypeScript interfaces
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
**Purpose:** Hook institutional allocators with the investment thesis and edge
- Hero section with background image (`/images/hero.jpg`)
- Tagline: "Systematic Futures Management. Institutional Discipline."
- **"The Edge" section**: Explains institutional capital rotation edge (see Investment Thesis below)
- **"What Sets Us Apart"**: 3 differentiator cards (Systematic Process, Full Transparency, Aligned Incentives)
- Track Record Preview section with CTA button
- Latest Insights (3 recent articles)
- Disclaimer

### About Page (`/about`)
**Purpose:** Answer "Who are you?" and establish credibility
- Hero section with background
- **"The Firm"**: Pre-registration status, track record building, registration timeline 2027-2028
- **How It Works**: Risk-On vs Risk-Off positioning (green/red cards)
- **Leadership - Kevin Fitzpatrick**: 20 years experience, 2,000+ parameter testing, live trading since 2025
- **Future Investment Program**: Brief CTA program overview
- CTA section (View Approach + View Track Record buttons)
- Disclaimer

### Approach Page (`/approach`)
**Purpose:** Answer "How does it work?" and "Where does it fit in my portfolio?"
- Hero section with background
- **"Methodology"**: How the framework measures institutional capital rotation
- **"Asset Universe"**: Why futures (liquidity, transparency, institutional infrastructure)
- **"Risk Management"**: Position sizing, drawdown controls, real-time monitoring, concentrated exposure
- **"Why Futures?"**: 4 numbered advantages (liquidity, cost, two-way markets, transparency)
- **"Portfolio Construction"** (NEW): S&P correlation 0.33-0.51, bond correlation near zero, crisis alpha examples, typical 10-20% allocation
- **"How We're Different from CTAs"** (NEW): One macro decision vs 50-100 market trend following, concentrated conviction, verifiable with public data, 2,000+ parameter robustness
- CTA section (View Track Record + Contact Us buttons)
- Disclaimer

### Track Record Page (`/track-record`)
**Purpose:** Full performance transparency with actual trades
- Hero section with background
- Performance period dates and data-through date
- **HeroStats**: 4 large metrics (Cumulative Return, YTD, CAGR, Max Drawdown)
- **Performance Disclosure**: Blue disclaimer box (actual trades, not hypothetical)
- **Benchmark Comparison**: Strategy vs S&P 500 metrics side-by-side
- **Monthly Returns Table**: Full grid with green/red cells
- **Metrics Panel**: Detailed performance statistics
- **Funding Level Selector**: Toggle between 33%, 50%, 75%, 100% funding
  - 33% = 3x leverage (default, Kevin's actual trading)
  - All metrics recalculate dynamically when funding level changes
  - Math: Scale factor = 33 / selected_funding_pct
- **Equity Curve**: Chart updates based on selected funding level
- Disclaimer

### Insights Page (`/insights`)
**Purpose:** Consolidated content hub (replaced /updates, /the-strategy, /research)
- Hero section with background
- Category filter buttons: All | [dynamic categories from articles]
- Article grid with thumbnails, dates, descriptions
- Powered by `InsightsFilter.tsx` client component for filtering

### Contact Page (`/contact`)
**Purpose:** Lead generation for qualified investors
- Hero section with background
- **Contact Form**: Name, Email, Company, Accredited Investor checkbox, Message
- **What to Expect**: Response time, process for qualified investors
- **Regulatory Notice**: Accredited investor definition, future availability
- Form submits to `/api/contact` → Resend API → email to marketregimereport@gmail.com
- Disclaimer

### Article Page (`/articles/[slug]`)
- Title, date, category, reading time
- Featured image (if set)
- Article content with prose styling
- Tags display

---

## Investment Thesis & Institutional Messaging

### Overview
The site is positioned for **institutional allocators**, not retail investors. Messaging focuses on answering the 4 key questions sophisticated investors ask when evaluating alternative managers.

### The 4 Institutional Questions

#### 1. Who are you?
**Answered on: About page**

Market Regime Capital is a pre-registration systematic futures manager building an auditable track record for CFTC/NFA registration (target: 2027-2028). Kevin Fitzpatrick, founder and portfolio manager, has 20 years of trading experience and data science background. The regime framework underwent extensive development:
- Multi-year research into institutional capital flows and market leadership
- 2,000+ parameter variations tested with consistent profitability
- Out-of-sample validation confirming structural edge (not curve-fitted)
- Live forward testing with personal capital beginning November 2025

All trades executed with real capital, documented in real-time, performance data available upon request for qualified investors.

#### 2. What's your edge?
**Answered on: Home page "The Edge" section**

**The edge is exploiting institutional capital rotation** — the measurable, slow-moving shift of large capital pools between risk-on sectors and risk-off havens.

**How it works:**
When the market environment shifts, large pools of capital (pension funds, endowments, mutual funds, ETFs) rotate between risk-on and risk-off positioning. A pension fund managing $50 billion can't reposition overnight. That rotation takes weeks to months, creating persistent, measurable drift in relative sector strength.

The framework detects this rotation **while it's happening** — not by predicting it, but by measuring the herd's footprint through quantitative analysis of market leadership patterns. We're not front-running the herd, we're measuring the herd's footprint and walking in the same direction.

**Why does the edge persist? Three structural reasons that don't go away:**

1. **Institutional size creates lag**: Large capital pools cannot move quickly. Size creates lag, and lag creates opportunity for anyone measuring the flow.

2. **Herding is rational for professional money managers**: Career risk ensures coordinated behavior. A portfolio manager who deviates from consensus and is wrong gets fired. One who follows consensus and is wrong gets to say "everyone got it wrong." This incentive structure drives coordinated movement indefinitely.

3. **Risk-on/risk-off is fundamental**: This dynamic isn't a statistical anomaly that gets arbitraged away — it's the basic mechanism by which capital prices risk. As long as investors differentiate between growth and safety, regime transitions will exist.

**Differentiator from traditional CTAs:**
Most CTAs ask "Is this market trending up or down?" and trade 50-100+ individual markets with diversified trend-following. Market Regime Capital asks a fundamentally different question: "Is the overall market environment favoring growth or safety?" — then makes **one high-conviction macro decision** expressed through concentrated futures positions.

#### 3. Why should I allocate to you?
**Answered on: Home page differentiators, Approach page differentiation section**

**What makes this different from other trend-following CTAs:**

- **One macro decision vs diversified whipsaw**: Traditional CTAs trade 50-100 markets applying momentum signals independently. Their diversification IS their risk management. Market Regime Capital makes one regime call (risk-on or risk-off) with concentrated conviction.

- **Transparency and verifiability**: An investor always knows exactly what they own — either equity index futures or alternative asset futures, nothing else. They can verify the thesis ("are risk-on sectors leading or lagging?") themselves with publicly available sector data. No black box, no 200-market portfolio they can't track.

- **Simplicity is robustness**: The strategy was tested across 2,000+ parameter variations and virtually all were profitable. That doesn't happen with overfit, complex systems. It happens when the underlying signal captures something structurally real.

- **Actual trades, not hypothetical**: Track record reflects live executed trades with real capital at stated prices, including all commissions and slippage. Performance data available upon request for institutional due diligence.

- **Aligned incentives**: Performance-based fee structure with complete alignment of interests. Compensation tied directly to realized returns.

#### 4. How does your strategy fit in my portfolio?
**Answered on: Approach page "Portfolio Construction" section**

**Correlation profile:**
- **S&P 500 correlation**: 0.33 to 0.51 depending on program leverage — low enough to provide genuine diversification, but not zero because the strategy IS long equities during bullish regimes. This is a **feature, not a bug**: you get equity upside participation during bull markets AND regime-driven protection during bear markets. Pure zero-correlation strategies often miss rallies entirely.
- **Bond correlation**: Near zero — the signal is driven by equity sector rotation, which is independent of interest rate dynamics.

**Crisis alpha — the diversification story is clearest during crises:**
- **2008**: When the S&P dropped 38%, the strategy was positioned in gold
- **COVID 2020**: Strategy caught the bearish signal and positioned defensively before rotating bullish in May 2020 to catch the entire recovery rally

This is crisis alpha — not just avoiding the worst of drawdowns, but being positioned to profit from the conditions that cause them.

**Where it fits in a portfolio:**
- **Typical allocation**: Managed futures / alternatives sleeve at 10-20% of total portfolio
- **Use case**: Not replacing equities or bonds — it's the third leg that zigs when stocks zag, participates when stocks rally, and generates alpha independent of the traditional 60/40 framework
- **Example**: An allocator running a $100M balanced portfolio adds $10-15M here and improves their portfolio Sharpe ratio without meaningfully increasing correlation to traditional assets

---

## Regime Updates System (DEPRECATED - June 2026)

**Historical system** (no longer used for public site):
- Daily updates stored in Supabase `daily_updates` table
- Speedometer image generated and stored in Supabase Storage
- Updated automatically by Pi every 10 minutes during market hours

**Why deprecated:**
- `/current-regime` page removed from public site in June 2026 overhaul
- Live regime signals no longer displayed publicly
- System still exists in database but is not actively maintained
- Pi scheduler tasks for regime updates have been disabled

**Legacy infrastructure:**
- Supabase tables: `regime_status`, `daily_updates`
- Supabase Storage bucket: `regime-assets`
- Components deleted: RegimeStats, RegimeTimeline, RegimeContext, etc.

---

## Real-Time Regime Updates (DEPRECATED - June 2026)

**Note:** This system is no longer used for the public website. Documentation preserved for reference.

### Architecture (Historical)
- Regime data stored in Supabase `regime_status` table
- Speedometer image stored in Supabase Storage
- Website fetched from Supabase on each page load
- Raspberry Pi updated data every 10 minutes during market hours (NOW DISABLED)

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
| Task | Schedule | Status | Description |
|------|----------|--------|-------------|
| Track record | Weekdays 8:00am ET | ✅ ACTIVE | Update from IBKR FTP |
| Regime updates | Every 10 min (market hours) | ❌ DISABLED (Jun 2026) | Update regime data + speedometer |
| Close regime update | 4:16pm ET | ❌ DISABLED (Jun 2026) | Official regime flip at market close |
| Benchmark prices | Weekdays 8:05am ET | ❌ DISABLED (Jun 2026) | Update SPY/QQQ/GLD prices |
| Weekly digest | Sunday 8:00am ET | ❌ DISABLED (Jun 2026) | Send weekly summary email |
| Substack notes (3 types) | Randomized daily | ❌ DISABLED (Jun 2026) | Discipline/philosophy/reflection notes |

**Why disabled:** Website overhaul removed live regime signals from public view. Only track record update remains necessary for public site data.

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

## Authentication System (REMOVED June 2026)

**Previous system:**
- Supabase Auth with magic link (email)
- Protected route: `/current-regime`
- `profiles` table with access control

**Why removed:**
- Institutional overhaul eliminated live regime signals from public site
- `/current-regime` page deleted entirely
- No protected pages = no authentication needed
- Simpler architecture for marketing site

**Current state:**
- All pages are public
- No login system
- No middleware for route protection
- Supabase still used for track record data storage only

---

## Contact Form System

### Implementation
- **API Route**: `/api/contact` (Next.js API route)
- **Email Provider**: Resend API
- **From address**: `contact@marketregimes.com`
- **To address**: `marketregimereport@gmail.com`

### Form Fields
- Name (required)
- Email (required)
- Company (optional)
- Accredited Investor checkbox (optional)
- Message (required)

### Environment Variables
```
RESEND_API_KEY=re_2WPCxhcY_KEBbJVA282WLTULEQh4q6FAU
```

**Domain verification:** Already completed on Resend for `marketregimes.com`

---

## Proprietary Information Protection

### DO NOT Disclose on Website

The following details are proprietary and must NOT appear on the public site:

1. **Specific instruments traded**
   - No mention of "NQ futures" or "Nasdaq 100 futures"
   - No mention of "GC futures" or "Gold futures"
   - Use generic terms: "equity index futures" and "alternative assets"

2. **Specific sector/ETF components**
   - No listing of risk-on sectors: technology, industrials, consumer discretionary
   - No listing of risk-off sectors: utilities, staples, treasuries, gold
   - Use generic: "risk-on sectors" and "risk-off sectors"

3. **Technical methodology details**
   - No mention of "z-score" normalization (use "normalized basis")
   - No specific thresholds or parameter values
   - No specific indicator formulas or calculations

4. **Business metrics**
   - No target AUM figures
   - No specific investor count targets
   - General language: building capacity for qualified institutional investors

### Acceptable General Disclosures

What CAN be discussed publicly:

- Regime-based framework concept
- Institutional capital rotation as the edge
- Why the edge persists (structural reasons)
- Futures as the asset class (without naming specific contracts)
- Generic sector rotation concept
- Performance metrics from actual trades
- Correlation statistics to major indices
- Portfolio construction guidance

---

## Design Guidelines

### Colors
- **Brand accent**: `text-emerald-600` / `bg-emerald-600` (#16a34a) — Used for section labels, active filters, numbered badges
- **Positive**: `text-emerald-600` (#16a34a) — Green for positive returns
- **Negative**: `text-red-600` (#dc2626) — Red for negative returns
- **Neutral**: `text-gray-500` (#6b7280)
- **Backgrounds**: `bg-gray-50`, `bg-gray-900`, `bg-white`
- **Hero overlay**: `bg-white/70` (70% white overlay on hero.jpg)

### Typography
- **Site title**: Spectral (serif), `font-spectral`
- **Navigation/Body**: Inter (sans-serif)
- **Article prose**: Tailwind Typography plugin

### Visual Treatment (June 2026)
- **Hero sections**: All main pages use `/images/hero.jpg` background with 70% white overlay
- **Section labels**: Emerald green uppercase tracking-wider small text
- **Numbered badges**: Emerald circles with white text (replaces gray-900)
- **Filter buttons**: Emerald active state (replaces gray-900)

### Header Layout
- Single row: Logo + "Market Regime Capital" on left, nav links on right
- No authentication icon
- Subtle bottom border
- Mobile: Hamburger menu

### Footer
- 4-column grid: Firm Info | Navigation | Resources | Legal
- Comprehensive CFTC/NFA regulatory disclaimers
- Registration status disclosure
- Copyright: "© 2026 Market Regime Capital. All rights reserved."

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

**Early Jun 2026**: Interactive funding level selector on Track Record page (33%/50%/75%/100% funding with dynamic recalculation of all metrics), removed email alert system for simplification.

**Mid Jun 2026 - MAJOR INSTITUTIONAL OVERHAUL**:
- **Removed live signal infrastructure**: Deleted 27 files including `/current-regime` page, all regime components, authentication system
- **New navigation**: 6 items (Home, About, Approach, Track Record, Insights, Contact) - removed auth, consolidated articles
- **Created new pages**: `/approach` (methodology + portfolio fit + differentiation), `/insights` (consolidated articles hub), enhanced `/contact` with Resend form
- **Messaging shift**: From retail education ("most traders fail because...") to institutional value prop ("here's our edge and why it persists")
- **Added Investment Thesis documentation**: Answers 4 institutional questions (Who are you? What's your edge? Why allocate? Portfolio fit?)
- **Visual enhancements**: Hero image backgrounds on all pages, emerald green brand accents throughout
- **Regulatory compliance**: Comprehensive CFTC/NFA disclaimers in footer, performance disclosure on track record
- **Pi scheduler**: Disabled 5 tasks (regime updates, benchmarks, weekly emails, Substack notes), kept only track record update
- **Business positioning**: Pre-registration CTA building track record for 2027-2028 registration, targeting institutional allocators not retail

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
