# The Market Regime Report - Website Project

## Project Overview

This is a Next.js 14+ website for **The Market Regime Report**, a systematic trading newsletter run by Kevin Fitzpatrick. The site is deployed on Vercel at **marketregimes.com**, with the Substack newsletter at **newsletter.marketregimes.com**.

### Site Architecture
The site and newsletter are now **separate domains**:
- **Custom site** (this codebase): `marketregimes.com` — `/`, `/about`, `/track-record`, `/articles`
- **Substack newsletter**: `newsletter.marketregimes.com` — daily dashboards, paid content, subscriber management

### Navigation Structure
```
[Logo] The Market Regime Report     Home | Track Record | Articles | About | Newsletter
```
- **Home** → `/` (custom)
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
- **No database, no API routes** - purely static/SSG

---

## File Structure

```
website/
├── content/
│   └── articles/                       # Markdown articles
│       └── *.md                        # Article files with frontmatter
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
│   │   ├── layout.tsx                  # Root layout with Header/Footer
│   │   ├── page.tsx                    # Home page (with hero image)
│   │   ├── about/
│   │   │   └── page.tsx                # About page
│   │   ├── articles/
│   │   │   ├── page.tsx                # Article index (thumbnail layout)
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Individual article page (SSG)
│   │   └── track-record/
│   │       └── page.tsx                # Track Record page
│   ├── components/
│   │   ├── Header.tsx                  # Logo + title left, nav right
│   │   ├── NavLink.tsx                 # Active page indicator
│   │   ├── HeroStats.tsx               # Large 4-metric display
│   │   ├── MetricsPanel.tsx            # Detailed metrics grid
│   │   ├── MonthlyReturnsTable.tsx     # Monthly returns HTML table
│   │   └── EquityCurve.tsx             # Equity curve image display
│   ├── lib/
│   │   └── articles.ts                 # Article reading/parsing utilities
│   └── types/
│       ├── article.ts                  # Article TypeScript interfaces
│       └── track-record.ts             # Track record TypeScript interfaces
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
- How It Works: Risk-On vs Risk-Off
- Three pillars
- Dark CTA band
- Newsletter section
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
- How It Works
- About Kevin
- What Subscribers Get
- CTA section
- Disclaimer

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

---

## Future Enhancements

### Planned
- [ ] Benchmark comparison (S&P 500/QQQ)
- [ ] Drawdown chart
- [ ] Rolling returns display
- [ ] Regime history timeline

### For Substack Only
- Current regime indicator
- Real-time signals
- Daily dashboards

---

## Contact / Links

- **Website**: https://marketregimes.com
- **Newsletter**: https://newsletter.marketregimes.com
- **GitHub**: https://github.com/kmf229/market-regime-report
- **Author**: Kevin Fitzpatrick
