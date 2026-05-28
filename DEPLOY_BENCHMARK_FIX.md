# Benchmark Comparison Fix - Deployment Steps

**Issue**: SPY/QQQ/GLD benchmark returns were not updating on the Current Regime page.

**Root Cause**: The `update_benchmark_prices.py` script was never scheduled to run on the Pi.

**Fix**: Added scheduled daily updates at 8:05am ET on weekdays.

---

## What Was Changed

### 1. Website Code (Already Deployed ✓)
- Added `revalidate = 60` to `/current-regime/page.tsx` for fresh data
- Changes pushed to GitHub and auto-deployed to Vercel

### 2. Pi Scheduler (Needs Deployment)
- Added `update_benchmarks()` function to `pi_scheduler.py`
- Scheduled to run every weekday at 8:05am ET
- Updated startup logs to show benchmark update schedule

---

## Deployment Steps (Run When Home)

### Step 1: Copy Updated Script to Pi

```bash
# From your Mac, in the website directory
cd /Users/kmf229/Documents/Trading/Substack/website

# Copy updated scheduler to Pi
scp scripts/pi_scheduler.py kmf229@192.168.1.163:/home/kmf229/market-regime/
```

### Step 2: Backfill Historical Data (ONE-TIME ONLY)

This will populate all benchmark prices from the strategy start date (Nov 14, 2025) to today.

```bash
# SSH into Pi
ssh kmf229@192.168.1.163

# Navigate to working directory
cd /home/kmf229/market-regime

# Activate virtual environment
source venv/bin/activate

# Run backfill (fetches from Nov 14, 2025 to today)
python update_benchmark_prices.py --backfill

# Expected output:
# ============================================================
# Benchmark Prices Update
# Started at: 2026-05-28 ...
# ============================================================
#
# Fetching prices from 2025-11-14 to 2026-05-28...
#
#   TQQQ...
#     ✓ Processed 138 days
#   SPY...
#     ✓ Processed 138 days
#   QQQ...
#     ✓ Processed 138 days
#   GLD...
#     ✓ Processed 138 days
#
# ============================================================
# Summary: 552 inserted, 0 updated
# ============================================================

# Exit virtual environment
deactivate
```

### Step 3: Restart Pi Service

```bash
# Still on Pi, restart the service to load new scheduler
sudo systemctl restart regime-updater

# Check status to ensure it restarted successfully
sudo systemctl status regime-updater

# Expected output should show:
# ● regime-updater.service - Market Regime Updater
#    Loaded: loaded (/etc/systemd/system/regime-updater.service; enabled; ...)
#    Active: active (running) since ...
```

### Step 4: Verify Logs

```bash
# View live logs to confirm scheduler is running
journalctl -u regime-updater -f

# You should see the startup message with new line:
# ==================================================
# Market Regime Updater
# ==================================================
# Started at: 2026-05-28 ...
# Schedule: Every 10 minutes during market hours (intraday signal only)
# Market hours: Mon-Fri, 9:30am-4:25pm ET
# Regime alerts: 3:30pm ET (weekdays)
# Official regime flip: 4:16pm ET (weekdays)
# Substack note: 4:17pm ET (weekdays)
# Track record update: Weekdays 8:00am ET
# Benchmark prices update: Weekdays 8:05am ET    <-- NEW LINE
# Weekly digest: Sunday 8:00am ET

# Press Ctrl+C to exit log view
```

### Step 5: Exit Pi

```bash
# Log out of Pi
exit
```

---

## Verification (After Deployment)

### Immediate Verification (After Backfill)

1. Go to https://marketregimes.com/current-regime
2. Scroll to "Benchmark Comparison" section
3. You should now see:
   - **Strategy** (TQQQ or GLD) - with current return %
   - **SPY** - with actual return % (not stuck at old value)
   - **QQQ** - with actual return % (not stuck at old value)
   - **GLD** - with actual return % (not stuck at old value)

### Next Morning Verification (After 8:05am ET)

1. Check Pi logs to confirm benchmark update ran:
   ```bash
   ssh kmf229@192.168.1.163
   journalctl -u regime-updater | grep "benchmark"

   # Should show:
   # [2026-05-29 08:05:00] Updating benchmark prices...
   # [2026-05-29 08:05:03] Benchmark prices update complete!
   ```

2. Check website again - returns should reflect today's closing prices

---

## Ongoing Maintenance

- **Automatic**: Pi will update benchmark prices every weekday at 8:05am ET
- **No action needed**: Website will automatically fetch fresh data (revalidates every 60 seconds)
- **No redeployment needed**: Changes happen in database, website picks them up automatically

---

## Troubleshooting

### If backfill fails with "No data returned"

- Check `POLYGON_API_KEY` is set in `/home/kmf229/market-regime/.env`
- Verify key is valid: https://polygon.io/dashboard/api-keys
- Try a shorter date range:
  ```bash
  python update_benchmark_prices.py --from 2026-05-01
  ```

### If scheduled updates don't run

- Check service is running: `sudo systemctl status regime-updater`
- Check for errors in logs: `journalctl -u regime-updater -n 50`
- Verify `POLYGON_API_KEY` in `.env` file
- Restart service: `sudo systemctl restart regime-updater`

### If website still shows old data

- Wait 60 seconds for revalidation to occur
- Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check Supabase table has data:
  ```sql
  SELECT ticker, date, close
  FROM benchmark_prices
  ORDER BY date DESC
  LIMIT 20;
  ```

---

## Summary

**Before deployment**: Benchmark returns (SPY, QQQ, GLD) were stuck at initial values

**After deployment**:
- Historical data populated (Nov 14, 2025 to today)
- Daily automatic updates at 8:05am ET
- Website shows accurate, up-to-date returns for all benchmarks

**Estimated time**: 5-10 minutes total
