# Substack Notes Automation - Implementation Summary

## What Was Built

A complete automated system for generating Substack Notes using Claude AI, integrated with your existing Raspberry Pi setup.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Raspberry Pi                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           pi_scheduler.py                        │  │
│  │  (systemd service, runs 24/7)                    │  │
│  │                                                   │  │
│  │  Every trading day at random times:              │  │
│  │  • 9:25-10:30am → Discipline note               │  │
│  │  • 11:30am-1pm  → Philosophy note               │  │
│  │  • 4:00-4:15pm  → Reflection note               │  │
│  └─────────────┬────────────────────────────────────┘  │
│                │                                        │
│                ▼                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │      notes_automation/main.py                    │  │
│  └─────────────┬────────────────────────────────────┘  │
│                │                                        │
│       ┌────────┴────────┬─────────────┬──────────┐    │
│       ▼                 ▼             ▼          ▼    │
│  ┌─────────┐   ┌──────────────┐  ┌────────┐  ┌────┐ │
│  │Database │   │Market Data   │  │Prompts │  │ AI │ │
│  │SQLite   │   │Polygon API   │  │Loader  │  │API │ │
│  └─────────┘   └──────────────┘  └────────┘  └────┘ │
│       │                                          │    │
│       │                                          │    │
│       ▼                                          ▼    │
│  Store notes                           3 note options │
│  + history                                       │    │
│                                                  │    │
└──────────────────────────────────────────────────┼────┘
                                                   │
                                                   ▼
                                        ┌──────────────────┐
                                        │   Email-to-SMS   │
                                        │  (via Resend)    │
                                        └────────┬─────────┘
                                                 │
                                                 ▼
                                            Your Phone
                                        (215-460-1131)
```

## Components

### 1. Database Module (`database.py`)
- SQLite database for storing all generated notes
- Tracks: note type, timestamp, prompt used, market data, 3 options
- Retrieves recent notes to avoid repetition
- Schema supports future expansion (posting tracking, etc.)

### 2. Market Data Module (`market_data.py`)
- **DEPRECATED**: No longer used for notes (kept for backward compatibility)
- Previously: Polygon.io API integration for OHLCV data

### 3. Prompts Module (`prompts.py`)
- Loads templates from `/prompts/notes/`
- Replaces placeholders: `{recent_notes}`
- Formats recent notes for context
- All notes are now market-blind

### 4. AI Client (`ai_client.py`)
- Claude API wrapper (Anthropic)
- Uses Claude 3.5 Sonnet for quality + speed
- Parses 3 numbered options from response
- Temperature: 0.8 for creative variety

### 5. SMS Client (`sms_client.py`)
- Email-to-SMS via Resend API
- Sends to: `2154601131@txt.att.net` (AT&T)
- Formats 3 note options with separators

### 6. Main CLI (`main.py`)
- Entry point: `python -m notes_automation.main --type <type>`
- Orchestrates full workflow
- Supports manual testing

### 7. Scheduler Integration (`pi_scheduler.py`)
- Randomized scheduling within time windows
- Only runs on trading days (respects holidays)
- Integrated with existing regime updater service
- **Disabled daily blurb generation** (saves Claude credits)

## Data Flow

1. **Scheduler triggers** at random time within window
2. **Fetch context**: Recent notes from database
3. **Build prompt** with context (no market data)
4. **Call Claude API** to generate 3 options
5. **Store in database** with metadata
6. **Send via email** to your inbox
7. **Manual posting**: You choose and post

## Key Features

✅ **Avoids repetition**: Analyzes last 10 notes of same type + last 5 overall
✅ **Market-blind**: No real-time data to ensure accuracy and timelessness
✅ **Randomized timing**: Different time each day (feels organic)
✅ **Modular design**: Easy to maintain and extend
✅ **Error handling**: Graceful failures, detailed logging
✅ **Cost-effective**: Replaced daily blurb with manual system
✅ **Trading days only**: Skips weekends and market holidays

## Environment Variables

New variables added to `.env`:

```bash
# POLYGON_API_KEY not needed for notes anymore (kept for other scripts)
NOTES_EMAIL=your-email@example.com
FROM_EMAIL=alerts@marketregimes.com
```

## File Locations

**Mac:**
```
/Users/kmf229/Documents/Trading/Substack/website/
├── scripts/
│   ├── notes_automation/           # All automation modules
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── market_data.py
│   │   ├── prompts.py
│   │   ├── ai_client.py
│   │   ├── sms_client.py
│   │   ├── main.py
│   │   ├── README.md
│   │   ├── DEPLOY.md
│   │   └── SUMMARY.md
│   └── pi_scheduler.py             # Updated with notes scheduling
└── prompts/
    └── notes/
        ├── discipline.txt
        ├── philosophy.txt
        └── reflection.txt
```

**Pi (after deployment):**
```
/home/kmf229/market-regime/
├── notes_automation/               # Copied from Mac
├── notes.db                        # SQLite database (auto-created)
├── pi_scheduler.py                # Updated scheduler
└── .env                           # Updated with new vars
```

## Testing

Each module can be tested independently:

```bash
# Test market data
python -m notes_automation.market_data

# Test SMS
python -m notes_automation.sms_client

# Test prompts
python -m notes_automation.prompts

# Test full generation (uses Claude credits)
python -m notes_automation.main --type philosophy
```

## Scheduling

**Randomized Times:**
- **Discipline**: Random between 9:25am - 10:30am ET (morning - start grounded in process)
- **Philosophy**: Random between 11:30am - 1:00pm ET (midday - timeless wisdom)
- **Reflection**: Random between 4:00pm - 4:15pm ET (evening - end-of-day perspective)

**Time picked fresh each day** via `schedule_random_note()` function.

## Cost Impact

**Before:**
- Daily blurb: ~1,000 tokens/day × 365 days = ~365K tokens/year

**After:**
- 3 notes/day: ~3,000 tokens/day × ~250 trading days = ~750K tokens/year
- BUT: More control, higher quality, manual curation

**Net:** Slightly higher token usage, but better output quality and manual control.

## Next Steps (Deployment)

See `DEPLOY.md` for full deployment instructions:

1. Copy files to Pi
2. Update `.env` with new variables
3. Install Python dependencies (`anthropic`, `resend`, `requests`)
4. Initialize database
5. Test each component
6. Restart systemd service
7. Monitor logs

## Maintenance

**Daily:** Check phone for note options, choose best one, post manually

**Weekly:** Review database to ensure notes aren't repeating

**Monthly:** Update prompt templates if needed to refine tone/style

**As Needed:** Adjust time windows in `pi_scheduler.py`

## Rollback Plan

If something goes wrong:
1. Restore old `pi_scheduler.py` from git
2. Remove `notes_automation/` directory on Pi
3. Restart service

All existing functionality (regime updates, track record, etc.) remains unchanged.

## Success Criteria

✅ Notes generate automatically 3x/day on trading days
✅ Email arrives with 3 options
✅ Notes avoid repeating recent themes
✅ Notes are timeless and accurate (no market data confusion)
✅ Database tracks all generated notes
✅ No interference with existing regime updates

---

**Built:** May 6, 2026
**Updated:** May 8, 2026 (removed market data, switched to discipline/reflection)
**Status:** Ready for Pi deployment
**Next:** Deploy updated version to Pi
