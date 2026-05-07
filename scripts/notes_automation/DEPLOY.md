# Deployment Guide - Substack Notes Automation

## Prerequisites

- Raspberry Pi with Python 3.8+ installed
- Existing `/home/kmf229/market-regime/` setup
- Valid API keys for Claude, Polygon, and Resend

## Step 1: Copy Files to Pi

From your Mac:

```bash
# Navigate to the project directory
cd /Users/kmf229/Documents/Trading/Substack/website

# Copy the notes_automation directory
scp -r scripts/notes_automation kmf229@192.168.1.163:/home/kmf229/market-regime/

# Copy the updated pi_scheduler.py
scp scripts/pi_scheduler.py kmf229@192.168.1.163:/home/kmf229/market-regime/
```

## Step 2: Update Environment Variables

SSH into the Pi:

```bash
ssh kmf229@192.168.1.163
```

Edit the `.env` file:

```bash
cd /home/kmf229/market-regime
nano .env
```

Add these new variables (keep existing ones):

```bash
# Polygon API (for market data)
POLYGON_API_KEY=your-polygon-api-key-here

# SMS Configuration (email-to-SMS via Resend)
SMS_PHONE=2154601131
SMS_GATEWAY=@txt.att.net
FROM_EMAIL=notes@marketregimes.com

# Existing variables (already present):
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_KEY=your-service-key
# ANTHROPIC_API_KEY=your-anthropic-key
# RESEND_API_KEY=re_your-resend-key
# IBKR_FTP_USER=your-ibkr-ftp-username
# IBKR_FTP_PASS=your-ibkr-ftp-password
```

Save and exit (Ctrl+X, Y, Enter).

## Step 3: Install Python Dependencies

Activate the virtual environment and install new packages:

```bash
cd /home/kmf229/market-regime
source venv/bin/activate

# Install new dependencies
pip install anthropic resend requests

# Verify installation
pip list | grep -E "anthropic|resend|requests"
```

## Step 4: Initialize Database

Run the initialization:

```bash
# Still in virtual environment
python -m notes_automation.main --type observational --init-db
```

You should see:
```
✓ Database initialized at /home/kmf229/market-regime/notes.db
```

## Step 5: Test Each Component

### Test 1: Market Data

```bash
python -m notes_automation.market_data
```

Expected output:
```
Testing market data fetching...

Market data as of YYYY-MM-DD:

SPY: Close $XXX.XX (Open $XXX.XX, High $XXX.XX, Low $XXX.XX) Daily change: +X.XX%
TQQQ: Close $XXX.XX (Open $XXX.XX, High $XXX.XX, Low $XXX.XX) Daily change: +X.XX%
GLD: Close $XXX.XX (Open $XXX.XX, High $XXX.XX, Low $XXX.XX) Daily change: +X.XX%
```

### Test 2: SMS Delivery

```bash
python -m notes_automation.sms_client
```

Expected output:
```
Testing SMS delivery...

📱 Sending SMS to 2154601131...
  ✓ Message sent! ID: xxxxxxxx
```

Check your phone - you should receive a test message.

### Test 3: Prompt Loading

```bash
python -m notes_automation.prompts
```

Expected output:
```
Testing prompt loading...

=== OBSERVATIONAL ===
Template loaded: XXXX characters
Placeholders: X

=== PHILOSOPHY ===
Template loaded: XXXX characters
Placeholders: X

=== REACTIVE ===
Template loaded: XXXX characters
Placeholders: X
```

### Test 4: Full Note Generation (Optional - uses Claude credits)

```bash
# This will call Claude API and send SMS
python -m notes_automation.main --type philosophy
```

Expected output:
```
============================================================
📝 Generating PHILOSOPHY notes
============================================================

📚 Fetching recent notes for context...
  ✓ Found X recent notes to avoid repeating

🔨 Building prompt...
  ✓ Prompt ready (XXXX characters)

🤖 Generating philosophy notes using Claude...
  ✓ Option 1: XXX characters
  ✓ Option 2: XXX characters
  ✓ Option 3: XXX characters

💾 Saving to database...
  ✓ Saved with ID: 1

📱 Sending to your phone...
  ✓ Message sent! ID: xxxxxxxx

✅ PHILOSOPHY notes generated and sent successfully!
```

## Step 6: Restart the Scheduler Service

Restart the systemd service to pick up changes:

```bash
sudo systemctl restart regime-updater
```

Check the status:

```bash
sudo systemctl status regime-updater
```

You should see it running with the new schedule information.

## Step 7: Monitor Logs

Watch the logs to verify everything is working:

```bash
journalctl -u regime-updater -f
```

You should see:
- Regime updates every 10 minutes during market hours
- Random note generation times printed at startup
- Note generation happening at scheduled times

Press Ctrl+C to stop watching logs.

## Step 8: Verify Notes Database

Check that notes are being stored:

```bash
cd /home/kmf229/market-regime
sqlite3 notes.db "SELECT id, created_at, note_type, status FROM notes ORDER BY created_at DESC LIMIT 5;"
```

## Troubleshooting

### Error: "No module named 'notes_automation'"

Make sure you're in the correct directory:

```bash
cd /home/kmf229/market-regime
python -m notes_automation.main --type philosophy
```

### Error: SMS not sending

1. Check Resend API key:
```bash
echo $RESEND_API_KEY
```

2. Verify SMS gateway is correct for AT&T (`@txt.att.net`)

3. Test SMS module directly:
```bash
python -m notes_automation.sms_client
```

### Error: Market data API failure

1. Check Polygon API key:
```bash
echo $POLYGON_API_KEY
```

2. Verify API is accessible:
```bash
curl "https://api.polygon.io/v1/open-close/SPY/2025-03-25?apiKey=$POLYGON_API_KEY"
```

### Error: Database locked

If you get a database locked error, restart the service:

```bash
sudo systemctl restart regime-updater
```

## Monitoring

### Check recent note generation

```bash
sqlite3 /home/kmf229/market-regime/notes.db << EOF
SELECT
    note_type,
    datetime(created_at, 'localtime') as created,
    status
FROM notes
ORDER BY created_at DESC
LIMIT 10;
EOF
```

### View all notes for today

```bash
sqlite3 /home/kmf229/market-regime/notes.db << EOF
SELECT
    id,
    note_type,
    datetime(created_at, 'localtime') as created
FROM notes
WHERE date(created_at) = date('now')
ORDER BY created_at;
EOF
```

## Daily Workflow

1. **Morning (9:25am - 10:30am)**: Receive observational note options via SMS
2. **Midday (11:30am - 1:00pm)**: Receive philosophy note options via SMS
3. **Market Close (4:00pm - 4:15pm)**: Receive reactive note options via SMS
4. **Manual Posting**: Copy/paste chosen option to Substack Notes

## Next Steps

- Monitor for the first few days to ensure smooth operation
- Adjust prompt templates in `/prompts/notes/` if needed
- Fine-tune scheduling windows in `pi_scheduler.py` if desired

## Rollback

If you need to revert:

```bash
# Restore old pi_scheduler.py from git
cd /Users/kmf229/Documents/Trading/Substack/website
git checkout HEAD~1 scripts/pi_scheduler.py

# Copy to Pi
scp scripts/pi_scheduler.py kmf229@192.168.1.163:/home/kmf229/market-regime/

# Restart service
ssh kmf229@192.168.1.163 "sudo systemctl restart regime-updater"
```
