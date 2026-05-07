# Substack Notes Automation - Quick Start

## What This Does

Generates 3 types of Substack Notes daily using Claude AI:
1. **Observational** (morning) - Market observations
2. **Philosophy** (midday) - Investor psychology
3. **Reactive** (close) - Market reactions

Notes are sent to your phone via SMS for manual posting.

## Deploy in 10 Minutes

### 1. Copy Files to Pi

From your Mac terminal:

```bash
cd /Users/kmf229/Documents/Trading/Substack/website

# Copy automation directory
scp -r scripts/notes_automation kmf229@192.168.1.163:/home/kmf229/market-regime/

# Copy updated scheduler
scp scripts/pi_scheduler.py kmf229@192.168.1.163:/home/kmf229/market-regime/
```

### 2. Update Environment Variables

SSH into Pi and edit `.env`:

```bash
ssh kmf229@192.168.1.163
cd /home/kmf229/market-regime
nano .env
```

Add these lines (keep existing variables):

```bash
POLYGON_API_KEY=your-polygon-api-key-here
SMS_PHONE=2154601131
SMS_GATEWAY=@txt.att.net
FROM_EMAIL=notes@marketregimes.com
```

Save: `Ctrl+X`, `Y`, `Enter`

### 3. Install Dependencies

```bash
source venv/bin/activate
pip install anthropic resend requests
```

### 4. Initialize Database

```bash
python -m notes_automation.main --type observational --init-db
```

### 5. Test SMS

```bash
python -m notes_automation.sms_client
```

Check your phone - you should receive a test message.

### 6. Restart Service

```bash
sudo systemctl restart regime-updater
sudo systemctl status regime-updater
```

## Done!

You'll now receive 3 SMS messages each trading day:
- Morning (9:25-10:30am)
- Midday (11:30am-1pm)
- Close (4:00-4:15pm)

Each message contains 3 note options. Choose your favorite and post manually to Substack.

## Manual Testing

Generate notes on demand:

```bash
cd /home/kmf229/market-regime
python -m notes_automation.main --type observational
python -m notes_automation.main --type philosophy
python -m notes_automation.main --type reactive
```

## Troubleshooting

**No SMS received?**
```bash
# Check logs
journalctl -u regime-updater -f

# Test SMS module
python -m notes_automation.sms_client
```

**Market data errors?**
```bash
# Test Polygon API
python -m notes_automation.market_data
```

**Need help?**
See `DEPLOY.md` for detailed troubleshooting.

## What Changed

- **Added**: Notes automation (3x/day)
- **Removed**: Daily blurb generation (saves Claude credits)
- **Same**: All regime updates, track record, alerts work as before

## Next Steps

Monitor for first few days, then adjust:
- Prompt templates in `/prompts/notes/` for tone/style
- Scheduling windows in `pi_scheduler.py` for timing
