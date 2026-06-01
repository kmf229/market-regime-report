# Deployment Summary - Market Regime Capital CTA Rebrand

**Date**: May 31, 2026
**Status**: ✅ COMPLETE

---

## Overview

Successfully transformed the website from "The Market Regime Report" newsletter to "Market Regime Capital" CTA, changing from ETF proxies (TQQQ/GLD) to futures contracts (NQ/GC).

---

## ✅ Completed Changes

### 1. Website Rebrand (Live on marketregimes.com)

**Branding Updates:**
- Header: "The Market Regime Report" → "Market Regime Capital"
- All metadata (titles, descriptions, Open Graph tags)
- Footer copyright
- All page titles and content

**Ticker Symbol Changes:**
- TQQQ → NQ (E-mini Nasdaq 100 futures)
- GLD → GC (Gold futures)
- Updated all UI components, tooltips, and labels
- Updated regime speedometer labels

**Messaging Updates:**
- Changed from "newsletter" to "CTA" focus
- Updated "investors" to "traders"
- Added futures trading risk warnings to disclaimers
- Removed newsletter-specific language throughout

**Articles:**
- Unpublished all strategy/backtest articles (set `published: false`)
- Articles preserved for future editing to futures context:
  - `how-this-strategy-works.md`
  - `history-of-the-market-regime-model-*.md` (all 7 parts)
  - `stress-testing-the-market-regime-model.md`
  - `this-is-what-a-real-drawdown-looks-like.md`
  - `update-2026-05-14.md`

### 2. Backend Python Scripts

**Updated Scripts:**
- ✅ `stocks_simple.py` - Added `ohlc_futures()` method using yfinance
- ✅ `update_regime_supabase.py` - Uses NQ/GC futures for calculations
- ✅ `generate_blurb.py` - Fetches NQ/GC futures data
- ✅ `update_benchmark_prices.py` - Updated ticker references
- ✅ `send_alerts.py` - Updated ticker references
- ✅ `generate_weekly_digest.py` - Updated ticker references
- ✅ `generate_substack_note.py` - Updated ticker references
- ✅ `pi_scheduler.py` - Disabled unused automation
- ✅ All `notes_automation/*` scripts - Updated ticker references

**Disabled Automation:**
- ❌ Daily blurb generation (4:15pm ET) - No longer used
- ❌ Substack note generation (4:17pm ET) - No longer used
- ❌ 3x daily Substack notes (discipline, philosophy, reflection) - No longer used

**Active Automation:**
- ✅ Regime updates every 10 minutes (9:30am-4:25pm ET)
- ✅ Regime change alerts (3:30pm ET)
- ✅ Official regime flip at close (4:16pm ET)
- ✅ Track record update (8:00am ET weekdays)
- ✅ Benchmark prices update (8:05am ET weekdays)
- ✅ Weekly digest (Sunday 8:00am ET)

### 3. Futures Data Setup

**Data Source: yfinance (Temporary)**
- Using Yahoo Finance continuous contracts:
  - `NQ=F` - E-mini Nasdaq 100 futures (continuous)
  - `GC=F` - Gold futures (continuous)
- Successfully tested on Raspberry Pi
- Latest data confirmed:
  - NQ: $30,405.25 (May 29, 2026)
  - GC: $4,560.50 (May 29, 2026)

**Why yfinance:**
- Polygon.io futures API not accessible with current subscription
- yfinance provides free, reliable continuous futures data
- Can switch to Polygon futures when available

### 4. Raspberry Pi Deployment

**Location:** `192.168.1.163:/home/kmf229/market-regime/`

**Deployed Files:**
- `stocks_simple.py` (with yfinance support)
- `update_regime_supabase.py`
- `generate_blurb.py`
- `pi_scheduler.py`

**Service Status:**
```
● regime-updater.service - Market Regime Updater
   Active: active (running)
   Schedule: Every 10 minutes during market hours
```

**Dependencies Added:**
- `yfinance` - Already installed, version 1.3.0

---

## 📊 Current State

### Website
- ✅ Fully rebranded as "Market Regime Capital"
- ✅ All references changed from TQQQ/GLD to NQ/GC
- ✅ Articles unpublished (ready for futures editing)
- ✅ Live at marketregimes.com

### Raspberry Pi
- ✅ All scripts updated and deployed
- ✅ yfinance working for NQ/GC data
- ✅ Service running without errors
- ✅ Unused automation disabled

### Data Flow
- ✅ NQ/GC futures data fetching works
- ✅ Regime calculations ready for futures
- ✅ Daily updates disabled (as requested)

---

## 🔄 Future Upgrades (Optional)

### When Polygon Futures Access Available:

1. **Contact Polygon.io Support**
   - Confirm futures data access
   - Get correct ticker format for NQ/GC
   - May require subscription upgrade

2. **Switch from yfinance to Polygon**
   - Update `stocks_simple.py` to use Polygon v1 futures endpoint
   - Remove yfinance dependency
   - Get more granular data (tick, minute bars)

### Code Changes Needed:
```python
# In stocks_simple.py, update ohlc_futures() to use:
url = f"https://api.polygon.io/futures/v1/aggs/{ticker}?resolution=1session..."
```

---

## 📁 Git Commits

All changes pushed to GitHub: `github.com/kmf229/market-regime-report`

**Recent commits:**
1. `617d2b2` - Rebrand to Market Regime Capital CTA
2. `34baf27` - Update Python scripts: TQQQ→NQ, GLD→GC
3. `90203c6` - Add Polygon futures support, disable notes
4. `5ef6fe7` - Switch to yfinance for futures data

---

## 🎯 Summary

**Website**: Fully operational as Market Regime Capital CTA
**Data**: Successfully fetching NQ/GC futures via yfinance
**Automation**: Streamlined - removed unused Substack notes
**Status**: Production ready ✅

---

## 📞 Support

**Polygon.io Futures Documentation:**
- [Futures API Overview](https://polygon.io/futures)
- [Futures Aggregates API](https://massive.com/docs/rest/futures/aggregates)

**yfinance Documentation:**
- [yfinance GitHub](https://github.com/ranaroussi/yfinance)
- Continuous contract format: `NQ=F`, `GC=F`, `ES=F`, etc.

**Contact for Polygon Support:**
- Email: support@polygon.io
- Ask about futures data access and ticker format for NQ/GC
