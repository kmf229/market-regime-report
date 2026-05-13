# Deployment Update - Market-Blind Notes (May 8, 2026)

## What Changed

### Changed from market-aware to market-blind notes:
- **Old**: Observational notes (used market data) → **New**: Discipline notes (market-blind)
- **Old**: Reactive notes (used market data) → **New**: Reflection notes (market-blind)
- **Kept**: Philosophy notes (already market-blind)

### Reason for Change
Market data was causing inaccuracies - Claude was misinterpreting OHLCV data and making incorrect statements about daily moves. All notes are now timeless and focus on trading psychology/process.

## Files Changed

### New Prompt Files
- `prompts/notes/discipline.txt` - Morning notes about staying grounded in your process
- `prompts/notes/reflection.txt` - Evening notes about patience and perspective
- Kept: `prompts/notes/philosophy.txt` (unchanged)
- Old files still exist but unused: `observational.txt`, `reactive.txt`

### Updated Python Files
- `scripts/notes_automation/main.py` - Changed note types, removed market data logic
- `scripts/notes_automation/prompts.py` - Updated docstrings, fixed path bug
- `scripts/pi_scheduler.py` - Renamed functions, updated scheduling
- `scripts/notes_automation/README.md` - Updated documentation
- `scripts/notes_automation/SUMMARY.md` - Updated documentation
- `scripts/notes_automation/DEPLOY.md` - Updated deployment guide

### Bug Fixes
- Fixed path resolution in `prompts.py` (was going up 3 levels instead of 2)

## Deployment to Pi

### 1. Copy Updated Files

From your Mac:
```bash
cd /Users/kmf229/Documents/Trading/Substack/website

# Copy the entire notes_automation directory (includes all changes)
scp -r scripts/notes_automation kmf229@192.168.1.163:/home/kmf229/market-regime/

# Copy updated scheduler
scp scripts/pi_scheduler.py kmf229@192.168.1.163:/home/kmf229/market-regime/

# Copy new prompt files
scp -r prompts kmf229@192.168.1.163:/home/kmf229/market-regime/
```

### 2. Update Environment Variables

SSH into the Pi:
```bash
ssh kmf229@192.168.1.163
cd /home/kmf229/market-regime
nano .env
```

Make sure these variables are set:
```bash
# Required for notes
ANTHROPIC_API_KEY=your-anthropic-key
RESEND_API_KEY=re_your-resend-key
NOTES_EMAIL=your-email@example.com
FROM_EMAIL=alerts@marketregimes.com

# Not needed for notes anymore (but keep for other scripts):
# POLYGON_API_KEY=your-polygon-key
```

Save and exit (Ctrl+X, Y, Enter).

### 3. Test the Changes

Still on the Pi:
```bash
cd /home/kmf229/market-regime
source venv/bin/activate

# Test prompt loading
python -m notes_automation.prompts

# Test generating each note type (uses Claude credits, but small amount)
python -m notes_automation.main --type discipline
python -m notes_automation.main --type philosophy
python -m notes_automation.main --type reflection
```

Expected output: 3 note options sent to your email for each type.

### 4. Restart the Service

```bash
sudo systemctl restart regime-updater
sudo systemctl status regime-updater
```

Verify no errors in the status output.

### 5. Monitor Logs

```bash
journalctl -u regime-updater -f
```

Watch for note generation at:
- Morning: Random time between 9:25-10:30am ET
- Midday: Random time between 11:30am-1:00pm ET
- Evening: Random time between 4:00-4:15pm ET

## What to Expect

### Email Format
You'll receive 3 emails per day (on trading days only) with subject lines:
- "Discipline Notes - MM/DD"
- "Philosophy Notes - MM/DD"
- "Reflection Notes - MM/DD"

Each email contains 3 note options to choose from.

### Note Themes
- **Discipline**: Following your system, not overriding rules, staying grounded
- **Philosophy**: Investor psychology, process over prediction, timeless wisdom
- **Reflection**: End-of-day perspective, patience, processing outcomes

### No More Market Data
Notes will NOT mention:
- Today's price action
- Specific percentage moves
- TQQQ/GLD/SPY performance
- Intraday market behavior

They'll focus entirely on:
- Trading psychology
- Process and discipline
- Patience and perspective
- Timeless investing wisdom

## Rollback (If Needed)

If something goes wrong:
```bash
# On Pi
cd /home/kmf229/market-regime
git checkout HEAD~1 pi_scheduler.py  # If you committed changes
# Or manually restore old files from backup

sudo systemctl restart regime-updater
```

## Verification Checklist

- [ ] All files copied to Pi successfully
- [ ] Environment variables updated
- [ ] Prompt files exist in `/home/kmf229/market-regime/prompts/notes/`
- [ ] Test runs completed without errors
- [ ] Service restarted successfully
- [ ] Logs show no errors
- [ ] Received test emails with note options
- [ ] Notes don't mention market data or prices

## Notes

- The old `observational.txt` and `reactive.txt` prompt files can be deleted from Pi after confirming everything works
- Database schema remains unchanged - old notes will still be stored with their original types
- No changes to regime updates, track record updates, or other Pi functions

---

**Updated:** May 8, 2026
**Reason:** Fix market data accuracy issues in notes
**Status:** Ready for Pi deployment
