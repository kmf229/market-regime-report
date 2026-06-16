# Market Regime Capital — Website Overhaul Brief
## Claude Code Project Brief

---

## Objective

Redesign marketregimes.com to match the look, feel, and professionalism of top-tier institutional CTA websites. The current site was built as a strategy showcase with a public regime indicator. It needs to evolve into a credible, institutional-quality investment management firm website.

---

## Design Research — Sites to Study

Before writing any code, visit each of these websites and analyze their design patterns, layout, typography, color palette, navigation structure, and overall tone. These are the top CTA firms in the world and their websites represent the standard we want to match.

### Primary References (visit and analyze these):

1. **Aspect Capital** — https://www.aspectcapital.com
   - Clean, minimal design with lots of whitespace
   - Hero section with a single bold tagline
   - Video embed on homepage
   - Muted, professional color palette (blues, whites, grays)
   - Sections: About, Approach, Team, Solutions, Insight, Careers, Contact

2. **Winton Capital** — https://www.winton.com
   - Dark green/teal theme, very distinctive
   - Background video on hero
   - "We are experts in quantitative investing" — single clear message
   - Research/insights section prominent
   - Sections: What We Do, Research, About, Careers

3. **DUNN Capital** — https://dunncapital.com
   - Gates full content behind accredited investor verification
   - Clean entry page with firm description and "Request Access" CTA
   - Good model for a smaller firm that protects proprietary info
   - Founded 1974, 0% management fee / incentive-only (same model as us)

4. **Abraham Trading** — https://www.abrahamtrading.com
   - Regulatory disclaimer gate before entering (NFA compliance)
   - Clean, simple design appropriate for a smaller firm
   - Good reference for our current scale

5. **Graham Capital** — https://www.grahamcapital.com
   - Institutional, understated design
   - Minimal public information
   - Contact-focused

### Design Patterns to Extract:

- **Typography**: What fonts do they use? Serif for headlines, sans-serif for body is common
- **Color palette**: Professional, muted tones (navy, dark green, charcoal, white, gold accents)
- **Hero section**: Single compelling tagline, no clutter
- **Navigation**: Simple top nav with 4-6 items max
- **Content density**: Very low — lots of whitespace, short paragraphs, minimal text per page
- **CTAs**: "Contact Us" or "Request Access" — not "Sign Up" or "Subscribe"
- **Imagery**: Abstract, sophisticated (geometric patterns, landscapes, subtle motion)
- **Footer**: Regulatory disclaimers, NFA/CFTC disclosures, copyright

---

## Current Site: marketregimes.com

The current site has these content sections that need to be restructured:
- **Updates** (market commentary and regime updates)
- **The Strategy** (explanation of how the system works)
- **Research** (backtesting analysis, data, methodology)
- **Regime Indicator Page** (REMOVE THIS — shows live signal publicly)

The site also has:
- YouTube video content (keep but integrate into new design)
- Animated React chart components (can keep if they fit the new design)
- Track record / performance section

### Current Tech Stack:
- The site is at marketregimes.com
- Check the current codebase to understand the tech stack before redesigning
- Preserve any existing content that can be restructured into the new design

---

## New Site Structure

### 1. Homepage
- **Hero Section**: Full-width, clean background (subtle gradient or abstract pattern, NOT a stock photo of Wall Street)
- **Tagline**: Something like "Systematic Regime-Based Investing" or "We identify market regimes. We position accordingly." — keep it short and confident
- **Brief 1-2 sentence description**: "Market Regime Capital is a systematic investment firm that rotates between growth and safety assets based on quantitative market regime detection."
- **CTA Button**: "Learn More" or "Contact Us"
- **Below the fold**: 2-3 cards highlighting key differentiators:
  - "20 Years of Data" or "Data-Driven Decisions"
  - "Systematic & Rules-Based"
  - "Aligned Incentives — 0% Management Fee"

### 2. About Page
- The firm's story (Kevin's background, 20 years of trading experience, data science career)
- Philosophy: "We believe markets alternate between risk-on and risk-off regimes. Our system identifies these transitions and positions accordingly."
- Team section: Kevin's bio with photo, credentials (Director of Data Science, 20 years trading experience)
- Timeline or milestones (optional): founded 2025, live trading since Nov 2025, etc.

### 3. Approach / Strategy Page
- High-level description of the methodology — DO NOT reveal specific parameters
- Describe in general terms: "Our proprietary system analyzes relative strength across economic sectors to identify whether market conditions favor growth assets or safe-haven assets."
- The two-panel visual (tech companies vs gold — from the pitch deck) could work here
- Key stats: "The system makes approximately 5-6 allocation decisions per year based on data, not emotion"
- Can include the "patience" concept: "Our edge comes from sustained trends, not frequent trading"

### 4. Programs / Solutions Page
- Overview of the investment programs offered
- Conservative and Aggressive descriptions (no specific return numbers publicly — save those for qualified investors)
- General risk/return characteristics described qualitatively
- "Contact us to learn more about our programs and minimum investment requirements"
- Gate detailed performance behind a contact form or accredited investor verification

### 5. Insights / Research Page
- Blog-style content: market commentary, strategy research, educational content
- This is where the current "Updates" and "Research" content lives
- Keep it active — regular posts build credibility and SEO
- NO live regime signals or current positioning

### 6. Contact Page
- Simple contact form: name, email, message
- Phone number (optional)
- Physical address (Kevin's business address)
- "For qualified investors interested in learning more about our programs, please reach out."

---

## Design Specifications

### Color Palette
Current site colors (can be refined but keep the general direction):
- Primary dark: #0F1B2D (navy/charcoal)
- Body text: #2C3E50
- Green accent: #27AE60 (use sparingly — for CTAs and highlights)
- Gold accent: #D4A843 (use sparingly)
- Muted text: #7F8C8D
- Background: White (#FFFFFF) with subtle light gray sections (#F8F9FA)

### Typography
- Headlines: Georgia or a premium serif font (matches pitch deck)
- Body text: Calibri, Inter, or a clean sans-serif
- Keep font sizes large and readable
- Lots of whitespace between sections

### Tone & Voice
- Professional but accessible
- Confident without being arrogant
- "We" language (even though it's one person — it's the firm speaking)
- Avoid jargon on public pages — save technical language for the Insights section
- No hype, no promises, no "guaranteed returns" language

### Responsive Design
- Must look great on mobile (investors check websites on their phones)
- Navigation collapses to hamburger menu on mobile
- Hero section scales properly
- Touch-friendly CTAs

---

## Critical Requirements

### 1. REMOVE the public regime indicator page
- The live regime signal must NOT be publicly visible
- Any reference to "current regime: Bullish/Bearish" must be removed from public pages
- Historical performance can be shown in general terms but not live signals

### 2. NFA/Regulatory Compliance
- Footer must include disclaimer: "Past performance is not necessarily indicative of future results. The risk of loss in trading futures can be substantial."
- If showing any performance data, include appropriate disclaimers
- Consider adding a disclaimer gate (like Abraham Trading) that users must acknowledge before viewing the site
- Include: "Market Regime Capital LLC is [not yet] registered as a Commodity Trading Advisor with the CFTC and is [not yet] a member of the NFA." (update this language once registered)

### 3. Performance Data Gating
- Detailed track records, monthly returns, and specific performance numbers should NOT be publicly visible
- Gate behind a contact form or accredited investor verification
- Public pages can reference general concepts ("20-year backtest", "systematic approach") without specific numbers

### 4. No Public Trading Signals
- Remove any feature that shows current or recent trading positions
- Remove any feature that could be interpreted as investment advice to the general public
- The website is a firm profile, not a trading tool

---

## Content to Preserve/Migrate

- YouTube video content: embed in About or Strategy page
- Any written research/analysis: move to Insights section
- Animated chart components: can potentially use on Strategy page if they don't reveal proprietary info
- Email list / newsletter signup: keep if it exists, position as "Subscribe to our insights"

---

## SEO & Meta

- Title: "Market Regime Capital | Systematic Regime-Based Investing"
- Meta description: "Market Regime Capital is a systematic investment firm that identifies market regimes and positions between growth and safety assets."
- Include Open Graph tags for social sharing
- Clean URLs: /about, /approach, /programs, /insights, /contact

---

## Nice-to-Have (v2)

- Blog/CMS functionality for the Insights section (easy to add new posts)
- Email capture integration (Mailchimp, ConvertKit, etc.)
- Investor portal login (for qualified investors to view performance data)
- Dark mode toggle
- Analytics integration (Google Analytics or Plausible)

---

*This brief contains proprietary business information. Do not share externally.*
