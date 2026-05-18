# Deployment Guide: Current Regime Page Updates

## Overview

Added three new visual components to the Current Regime page:
1. **Regime Strength History Chart** - Daily regime strength from -10 to +10
2. **Benchmark Comparison** - Current trade vs SPY/QQQ/GLD
3. **Regime Timeline Strip** - Visual history bar (enhanced existing component)

## Deployment Steps

### 1. Run Database Migrations

Go to Supabase SQL Editor and run these migrations in order:

#### Migration 1: Regime Strength History Table
```sql
-- File: supabase/migrations/010_regime_strength_history.sql

CREATE TABLE IF NOT EXISTS regime_strength_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  regime_strength DECIMAL NOT NULL,
  regime TEXT NOT NULL CHECK (regime IN ('bullish', 'bearish')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regime_strength_date ON regime_strength_history(date DESC);

ALTER TABLE regime_strength_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON regime_strength_history
  FOR SELECT USING (true);

CREATE POLICY "Allow service role to insert" ON regime_strength_history
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update" ON regime_strength_history
  FOR UPDATE USING (auth.role() = 'service_role');
```

#### Migration 2: Benchmark Prices Table
```sql
-- File: supabase/migrations/011_benchmark_prices.sql

CREATE TABLE IF NOT EXISTS benchmark_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL CHECK (ticker IN ('TQQQ', 'SPY', 'QQQ', 'GLD')),
  date DATE NOT NULL,
  open DECIMAL NOT NULL,
  high DECIMAL NOT NULL,
  low DECIMAL NOT NULL,
  close DECIMAL NOT NULL,
  volume BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ticker, date)
);

CREATE INDEX IF NOT EXISTS idx_benchmark_ticker_date ON benchmark_prices(ticker, date DESC);
CREATE INDEX IF NOT EXISTS idx_benchmark_date ON benchmark_prices(date DESC);

ALTER TABLE benchmark_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON benchmark_prices
  FOR SELECT USING (true);

CREATE POLICY "Allow service role to insert" ON benchmark_prices
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update" ON benchmark_prices
  FOR UPDATE USING (auth.role() = 'service_role');
```

### 2. Deploy Updated Scripts to Pi

Copy the updated scripts to your Raspberry Pi:

```bash
# From your local machine
cd /Users/kmf229/Documents/Trading/Substack/website

# Copy updated regime script (now saves strength history)
scp scripts/update_regime_supabase.py kmf229@192.168.1.163:/home/kmf229/market-regime/

# Copy new benchmark prices script
scp scripts/update_benchmark_prices.py kmf229@192.168.1.163:/home/kmf229/market-regime/

# Restart the Pi service
ssh kmf229@192.168.1.163 "sudo systemctl restart regime-updater"
```

### 3. Backfill Historical Data (One-Time)

On the Pi, run these commands to populate historical data:

```bash
ssh kmf229@192.168.1.163
cd /home/kmf229/market-regime
source venv/bin/activate

# 1. Backfill regime strength history (if you have historical data in your notebook)
# You'll need to run this from your Jupyter notebook with historical regime_s and z_spread_smoothed data
# Example (run in notebook):
# from update_regime_supabase import save_daily_strength_history, get_supabase_client
# supabase = get_supabase_client()
# for date in regime_s.index:
#     save_daily_strength_history(regime_s[:date], z_spread_smoothed[:date], supabase)

# 2. Backfill benchmark prices (last 6 months of data)
python update_benchmark_prices.py

# The script will fetch the last 5 days by default
# To get more history, you can modify days_back in the script
```

### 4. Update Pi Scheduler (Optional)

If you want to add benchmark price updates to the daily schedule, update `pi_scheduler.py`:

```python
# Add to imports at top
from update_benchmark_prices import update_benchmark_prices

# Add to schedule (after track record update at 8am)
schedule.every().day.at("08:05").do(job_wrapper, update_benchmark_prices, "benchmark_prices")
```

Then restart the service:
```bash
ssh kmf229@192.168.1.163 "sudo systemctl restart regime-updater"
```

### 5. Verify Website Deployment

Vercel should auto-deploy the website from GitHub. Check:
- https://marketregimes.com/current-regime

The page should now show:
1. Speedometer + Stats (existing)
2. **NEW: Regime Strength History Chart** (will be empty until you backfill data)
3. **NEW: Benchmark Comparison** (will show once benchmark prices are populated)
4. **NEW: Regime Timeline Strip** (should work immediately with existing data)

## Troubleshooting

### Regime Strength Chart is Empty

**Cause**: No historical regime strength data in the database yet.

**Solution**: The chart will start populating automatically as the Pi runs daily updates. To backfill historical data, you need to:
1. Open your Jupyter notebook with historical regime calculations
2. Import the `save_daily_strength_history` function
3. Loop through your historical dates and save each day's strength value

### Benchmark Comparison is Empty

**Cause**: No benchmark price data in the database yet.

**Solution**: Run `python update_benchmark_prices.py` on the Pi. This will fetch the last 5 days. For more history, modify the script's `days_back` parameter.

### Pi Script Errors

**Check logs**:
```bash
ssh kmf229@192.168.1.163 "journalctl -u regime-updater -f"
```

**Common issues**:
- Missing Supabase credentials: Check `.env` file has `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Database permissions: Ensure service role key is used (not anon key)
- Table doesn't exist: Run the migrations in Supabase SQL Editor

## Data Flow Summary

### Daily at Market Close (4:16pm ET):
1. Pi calls `update_all()` in `update_regime_supabase.py`
2. This now also calls `save_daily_strength_history()` to append today's strength value
3. Website fetches this data to power the Regime Strength History Chart

### Daily at 8:05am ET (proposed):
1. Pi calls `update_benchmark_prices()` to fetch latest TQQQ, SPY, QQQ, GLD prices
2. Website uses this data for the Benchmark Comparison component

## Files Changed

**New Files**:
- `scripts/update_benchmark_prices.py` - Fetches benchmark prices from Polygon.io
- `src/components/RegimeStrengthChart.tsx` - Recharts line chart component
- `src/components/CurrentTradeBenchmark.tsx` - Horizontal bar comparison chart
- `src/lib/regime-strength-history.ts` - Data fetching for strength history
- `src/lib/benchmark-prices.ts` - Data fetching for benchmark prices
- `supabase/migrations/010_regime_strength_history.sql` - New table migration
- `supabase/migrations/011_benchmark_prices.sql` - New table migration

**Modified Files**:
- `scripts/update_regime_supabase.py` - Added `save_daily_strength_history()` function
- `src/app/current-regime/page.tsx` - Integrated new components, removed calendar
- `src/components/LiveRegimeStatus.tsx` - Removed RegimeCalendar
- `src/types/regime-data.ts` - Added types for new data structures
- `package.json` - Added recharts dependency

## Next Steps

1. **Run migrations** in Supabase SQL Editor
2. **Deploy scripts** to Pi
3. **Backfill data** (benchmark prices at minimum)
4. **Monitor** for a few days to ensure data collection is working
5. **Optionally**: Add benchmark price updates to Pi scheduler

The website changes are already live via Vercel auto-deployment!
