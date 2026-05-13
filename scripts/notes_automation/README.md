# Substack Notes Automation

Automated system for generating Substack Notes using Claude AI, running on Raspberry Pi.

## Overview

This system generates 3 types of daily Substack Notes:

1. **Discipline** (9:25am - 10:30am): Morning notes about following your process and staying grounded
2. **Philosophy** (11:30am - 1:00pm): Investor psychology, discipline, and timeless investing wisdom
3. **Reflection** (4:00pm - 4:15pm): End-of-day perspective, patience, and processing the day

All notes are **market-blind** (no real-time market data) to ensure accuracy and timelessness.

Notes are generated using Claude AI and sent via email for manual posting.

## Features

- 📝 AI-generated note options (3 per batch)
- 🗄️ SQLite database for tracking generated notes
- 🔁 Avoids repeating recent topics, phrases, and analogies
- 📧 Email delivery via Resend (reliable and fast)
- ⏰ Random scheduling within time windows
- 🤖 Fully automated on Raspberry Pi
- 🧘 Market-blind: No real-time data to ensure accuracy

## Project Structure

```
notes_automation/
├── __init__.py          # Package initialization
├── database.py          # SQLite database operations
├── market_data.py       # Polygon.io API client
├── prompts.py           # Prompt loading and formatting
├── ai_client.py         # Claude API wrapper
├── sms_client.py        # Email-to-SMS via Resend
├── main.py              # CLI entry point
└── README.md            # This file
```

## Database Schema

```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note_type TEXT NOT NULL,
    prompt_used TEXT,
    market_data_used TEXT,
    generated_note_options TEXT NOT NULL,
    selected_or_posted_note TEXT,
    status TEXT DEFAULT 'generated'
)
```

## CLI Usage

### Generate notes manually

```bash
# From the scripts directory
cd /home/kmf229/market-regime

# Generate discipline note
python -m notes_automation.main --type discipline

# Generate philosophy note
python -m notes_automation.main --type philosophy

# Generate reflection note
python -m notes_automation.main --type reflection

# Generate all 3 types
python -m notes_automation.main --type all

# Initialize database (first time only)
python -m notes_automation.main --type discipline --init-db
```

## Automated Scheduling

The system is integrated into `pi_scheduler.py` and runs automatically via systemd service.

**Schedule:**
- Observational: Random time between 9:25am - 10:30am ET
- Philosophy: Random time between 11:30am - 1:00pm ET
- Reactive: Random time between 4:00pm - 4:15pm ET

**Only runs on trading days** (skips weekends and holidays).

## Environment Variables

Required in `/home/kmf229/market-regime/.env`:

```bash
# Claude API
ANTHROPIC_API_KEY=your-anthropic-key

# Market data
POLYGON_API_KEY=your-polygon-api-key

# Email delivery via Resend
RESEND_API_KEY=re_your-resend-key
NOTES_EMAIL=your-email@example.com
FROM_EMAIL=alerts@marketregimes.com
```

## Testing

### Test market data fetching
```bash
python -m notes_automation.market_data
```

### Test SMS delivery
```bash
python -m notes_automation.sms_client
```

### Test prompt loading
```bash
python -m notes_automation.prompts
```

### Test Claude API
```bash
python -m notes_automation.ai_client
```

## Prompt Templates

Prompts are stored in `/prompts/notes/`:
- `observational.txt` - Morning market observations
- `philosophy.txt` - Investor psychology/discipline
- `reactive.txt` - Market close reactions

Each prompt uses placeholders:
- `{recent_notes}` - Recent notes to avoid repetition
- `{market_data}` - Current market data (observational/reactive only)
- `{session_context}` - Intraday context (reactive only)

## Troubleshooting

### Database locked error
```bash
# Kill any existing connections
sudo systemctl restart regime-updater
```

### SMS not receiving
1. Check Resend API key is valid
2. Verify SMS gateway for your carrier
3. Test with: `python -m notes_automation.sms_client`

### No market data
1. Check Polygon API key
2. Verify API rate limits not exceeded
3. Test with: `python -m notes_automation.market_data`

## Deployment

See `DEPLOY.md` for full deployment instructions.
