"""
Generate daily blurbs using Claude API and store in Supabase.

Requirements:
    pip install anthropic supabase python-dotenv pandas

Environment variables needed:
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key
    ANTHROPIC_API_KEY=your-anthropic-api-key

Usage:
    # From pi_scheduler.py:
    from generate_blurb import generate_and_store_daily_blurb
    generate_and_store_daily_blurb(regime_s, z_spread_smoothed)

    # Test mode:
    python generate_blurb.py --test
"""

from __future__ import annotations

import os
import sys
from datetime import datetime
from pathlib import Path

import pandas as pd

# Add parent directory for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from dotenv import load_dotenv
    # Try .env in same directory (Pi), then .env.local in parent (Mac/Next.js)
    env_file = Path(__file__).parent / ".env"
    env_local = Path(__file__).parent.parent / ".env.local"
    if env_file.exists():
        load_dotenv(env_file)
    elif env_local.exists():
        load_dotenv(env_local)
except ImportError:
    pass

from update_regime_supabase import get_supabase_client


# ============================================
# SYSTEM PROMPT FOR BLURB GENERATION
# ============================================

SYSTEM_PROMPT = """# Market Regime – Daily Quick Notes (SYSTEM PROMPT)

You are the AI market commentator for a quantitative trading platform built around a proprietary **Market Regime model**.

---

## Background & Context

The Market Regime model is a **rules-based, quantitative timing system** designed to allocate capital between **risk-on (tech / TQQQ proxy via MNQ)** and **risk-off (gold / GLD proxy via MGC)** environments.

The model:

- Classifies markets into **Bullish or Bearish regimes**
- Uses **relative strength of ETF baskets** (risk-on vs risk-off)
- Produces a continuous **Regime Strength line** that reflects internal momentum and pressure beneath price
- Generates **clear regime flips**, which dictate positioning
- Is intentionally simple, robust, and resistant to overfitting

The Regime Strength Line:

- This is a number that tells what Regime we are in
- If the number is >= 0.25, we are in a Bullish regime and hold tech
- If the number is < 0.25, we are in a Bearish regime and hold gold

Subscribers do **not** receive predictions.
They receive **context, structure, and disciplined exposure management**.

This platform publishes:

- A **Quick Notes** blog-type section summarizing market conditions
- Clear **signals only when the regime flips**
- No intraday noise, no discretion, no narrative chasing

---

## Your Role

Each day, you will generate a short written update

The authorial voice should be:

- Calm
- Analytical
- Confident but restrained
- Never predictive
- Never sensational
- Never explicit about proprietary thresholds

Assume the audience includes:

- Subscribers relying on regime clarity

---

## Daily Inputs (Injected Each Run — REQUIRED)

### TQQQ OHLCV (most recent N days)

Pasted as a compact table or CSV-like rows with:
date, open, high, low, close, volume

{tqqq_ohlcv}

### GLD OHLCV (most recent N days)

Pasted as a compact table or CSV-like rows with:
date, open, high, low, close, volume

{gld_ohlcv}

### Regime Strength Line (most recent N values)

Pasted as:
date, strength

{regime_strength}

Use these inputs to understand:

- Directional pressure
- Relative performance between tech and gold
- Whether price action is confirming or diverging from regime strength
- Short-term shifts without overstating them

---

## Output Structure (MANDATORY)

Your output MUST have:

- Direct commentary on the **current regime**
- Discussion of **tech vs gold behavior**
- Interpretation of the **Regime Strength line**
- Reinforce why discipline matters _right now_

**Guidelines:**

- You MAY reference the regime explicitly
- You MAY discuss whether price is confirming or diverging
- You MAY discuss positioning logic at a high level
- You MUST NOT:
  - Give exact thresholds
  - Predict future moves
  - Override the model
- Emphasize **process over outcome**

**Tone:**

- Professional
- Matter-of-fact
- Written for serious operators, not tourists

**Length:**

- 3–5 sentences
- Concise but meaningful

---

## Style Constraints

- No emojis
- No hype words ("explosive," "massive," "guaranteed")
- No first-person trading anecdotes
- No claims of certainty
- **No markdown formatting** - no headers, no bold, no bullet points, just plain prose
- Do NOT include a title, date header, or any preamble - start directly with the content
- Prefer language like:
  - "pressure," "confirmation," "divergence," "alignment," "transition," "structure"

---

## Final Objective

The reader should feel:

- The market is being **measured, not guessed**
- The system is **steady even when price is not**
- The value lies in **consistent exposure management over time**

Generate today's output following all rules above."""


# ============================================
# DATA FORMATTING FUNCTIONS
# ============================================

def scale_regime_strength(raw_strength: float, threshold: float = 0.25,
                          bearish_min: float = -3.5, bullish_max: float = 3.5) -> float:
    """Scale raw regime strength to -10 to +10 scale."""
    if raw_strength >= threshold:
        range_size = bullish_max - threshold
        distance = raw_strength - threshold
        scaled = (distance / range_size) * 10
    else:
        range_size = threshold - bearish_min
        distance = threshold - raw_strength
        scaled = -(distance / range_size) * 10
    return max(-10, min(10, scaled))


def get_ohlcv_data(ticker: str, days: int = 10) -> pd.DataFrame:
    """Fetch recent OHLCV data for a ticker."""
    from stocks_simple import Stocks

    stocks = Stocks()
    today = datetime.now().strftime('%Y-%m-%d')

    df = stocks.ohlc(ticker, end=today)

    # Ensure we have the right columns
    df = df[['date', 'open', 'high', 'low', 'close', 'volume']].copy()
    df = df.sort_values('date', ascending=False).head(days)
    df = df.sort_values('date', ascending=True)

    return df


def format_ohlcv_for_prompt(df: pd.DataFrame) -> str:
    """Format OHLCV DataFrame as CSV-like string for the prompt."""
    lines = []
    for _, row in df.iterrows():
        date_str = row['date'].strftime('%Y-%m-%d') if hasattr(row['date'], 'strftime') else str(row['date'])[:10]
        lines.append(
            f"{date_str}, {row['open']:.2f}, {row['high']:.2f}, "
            f"{row['low']:.2f}, {row['close']:.2f}, {int(row['volume'])}"
        )
    return "\n".join(lines)


def format_regime_strength_for_prompt(z_spread_smoothed: pd.Series, days: int = 10) -> str:
    """Format regime strength values (scaled -10 to +10) for the prompt."""
    # Get last N days
    recent = z_spread_smoothed.sort_index().tail(days)

    lines = []
    for date, raw_value in recent.items():
        date_str = date.strftime('%Y-%m-%d') if hasattr(date, 'strftime') else str(date)[:10]
        scaled = scale_regime_strength(raw_value)
        lines.append(f"{date_str}, {scaled:+.2f}")

    return "\n".join(lines)


# ============================================
# CLAUDE API INTEGRATION
# ============================================

def generate_blurb(tqqq_ohlcv: str, gld_ohlcv: str, regime_strength: str) -> str:
    """Generate daily blurb using Claude API."""
    import anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set")

    client = anthropic.Anthropic(api_key=api_key)

    # Fill in the prompt template
    filled_prompt = SYSTEM_PROMPT.format(
        tqqq_ohlcv=tqqq_ohlcv,
        gld_ohlcv=gld_ohlcv,
        regime_strength=regime_strength
    )

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[
            {"role": "user", "content": filled_prompt}
        ]
    )

    blurb = message.content[0].text.strip()

    # Clean up any markdown that slipped through
    import re
    # Remove markdown headers
    blurb = re.sub(r'^#{1,6}\s+.*\n*', '', blurb)
    # Remove bold/italic markers
    blurb = re.sub(r'\*\*([^*]+)\*\*', r'\1', blurb)
    blurb = re.sub(r'\*([^*]+)\*', r'\1', blurb)
    # Remove any remaining leading whitespace/newlines
    blurb = blurb.strip()

    return blurb


# ============================================
# SUPABASE STORAGE
# ============================================

def insert_daily_update(date: str, regime: str, content: str) -> None:
    """Insert or update daily blurb in Supabase."""
    supabase = get_supabase_client()

    data = {
        "date": date,
        "regime": regime.lower(),
        "content": content,
        "published": True,
    }

    # Upsert to handle duplicates (update if date exists)
    supabase.table("daily_updates").upsert(data, on_conflict="date").execute()

    print(f"Stored daily update for {date}")


# ============================================
# MAIN ENTRY POINT
# ============================================

def generate_and_store_daily_blurb(regime_s: pd.Series, z_spread_smoothed: pd.Series) -> str:
    """
    Generate and store the daily blurb.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values

    Returns:
        The generated blurb text
    """
    print("Generating daily blurb...")

    # Get today's date and regime
    today = regime_s.index.max()
    today_str = today.strftime('%Y-%m-%d')
    current_regime = regime_s.loc[today]
    regime_str = "bullish" if str(current_regime).lower().startswith("bull") else "bearish"

    # Fetch OHLCV data
    print("  Fetching TQQQ data...")
    tqqq_df = get_ohlcv_data("TQQQ", days=10)
    tqqq_ohlcv = format_ohlcv_for_prompt(tqqq_df)

    print("  Fetching GLD data...")
    gld_df = get_ohlcv_data("GLD", days=10)
    gld_ohlcv = format_ohlcv_for_prompt(gld_df)

    # Format regime strength
    print("  Formatting regime strength...")
    regime_strength = format_regime_strength_for_prompt(z_spread_smoothed, days=10)

    # Generate blurb via Claude
    print("  Calling Claude API...")
    blurb = generate_blurb(tqqq_ohlcv, gld_ohlcv, regime_strength)

    # Store in Supabase
    print("  Storing in Supabase...")
    insert_daily_update(today_str, regime_str, blurb)

    print(f"Done! Generated blurb for {today_str}:")
    print("-" * 40)
    print(blurb)
    print("-" * 40)

    return blurb


# ============================================
# TEST MODE
# ============================================

def test_blurb_generation():
    """Test blurb generation with sample data."""
    import numpy as np

    print("=" * 50)
    print("Testing blurb generation")
    print("=" * 50)

    # Create sample regime data
    dates = pd.date_range(end=datetime.now(), periods=30, freq='B')
    z_spread = pd.Series(
        np.linspace(-0.5, 0.1, 30) + np.random.normal(0, 0.1, 30),
        index=dates
    )
    z_spread_smoothed = z_spread.ewm(span=20, adjust=False).mean()

    regime_s = pd.Series(index=z_spread_smoothed.index, dtype=object)
    regime_s[z_spread_smoothed > 0.25] = 'Bullish'
    regime_s[z_spread_smoothed <= 0.25] = 'Bearish'

    # Generate and store
    blurb = generate_and_store_daily_blurb(regime_s, z_spread_smoothed)

    return blurb


def run_manual():
    """Run blurb generation manually with real regime data."""
    print("=" * 50)
    print("Manual Blurb Generation")
    print("=" * 50)

    # Import stocks module and calculate regime
    from stocks_simple import Stocks
    import numpy as np

    stocks = Stocks()
    today = datetime.now().strftime('%Y-%m-%d')

    RISK_ON_TICKERS = ["XLK", "XLY", "XLI", "SMH", "IWM"]
    RISK_OFF_TICKERS = ["XLU", "XLP", "XLV", "GLD", "TLT"]
    BENCHMARK = ["SPY"]
    WINDOW_LENGTH = 45
    EMA_SMOOTHING = 20
    BULLISH_THRESHOLD = 0.25

    def fetch_closes(tickers):
        all_series = {}
        for ticker in tickers:
            temp = stocks.ohlc(ticker, end=today)
            all_series[ticker] = (
                temp[['date', 'close']]
                .set_index('date')
                .to_dict()['close']
            )
        df = pd.DataFrame(all_series).sort_index()
        return df

    print("Fetching market data...")
    benchmark = fetch_closes(BENCHMARK)
    risk_on_df = fetch_closes(RISK_ON_TICKERS)
    risk_off_df = fetch_closes(RISK_OFF_TICKERS)
    df = pd.concat([risk_on_df, risk_off_df, benchmark], axis=1).dropna()

    # Relative strength vs benchmark
    risk_on_rs = df[RISK_ON_TICKERS].div(df['SPY'], axis=0)
    risk_off_rs = df[RISK_OFF_TICKERS].div(df['SPY'], axis=0)

    # Averages
    risk_on_avg = risk_on_rs.mean(axis=1)
    risk_off_avg = risk_off_rs.mean(axis=1)

    # Rolling mean/std -> z-scores
    ro_mean = risk_on_avg.rolling(WINDOW_LENGTH).mean()
    ro_std = risk_on_avg.rolling(WINDOW_LENGTH).std()
    rf_mean = risk_off_avg.rolling(WINDOW_LENGTH).mean()
    rf_std = risk_off_avg.rolling(WINDOW_LENGTH).std()

    risk_on_z = (risk_on_avg - ro_mean) / ro_std
    risk_off_z = (risk_off_avg - rf_mean) / rf_std

    z_spread = risk_on_z - risk_off_z
    z_spread_smoothed = z_spread.ewm(span=EMA_SMOOTHING, adjust=False).mean()

    # Regime classification
    regime_s = pd.Series(index=z_spread_smoothed.index, dtype=object)
    regime_s[z_spread_smoothed > BULLISH_THRESHOLD] = 'Bullish'
    regime_s[z_spread_smoothed <= BULLISH_THRESHOLD] = 'Bearish'

    # Generate and store
    blurb = generate_and_store_daily_blurb(regime_s, z_spread_smoothed)

    return blurb


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate daily market blurbs")
    parser.add_argument("--test", action="store_true", help="Run in test mode with sample data")
    parser.add_argument("--manual", action="store_true", help="Run manually with real market data")
    args = parser.parse_args()

    if args.test:
        test_blurb_generation()
    elif args.manual:
        run_manual()
    else:
        print("Usage:")
        print("  python generate_blurb.py --manual   # Generate with real market data")
        print("  python generate_blurb.py --test     # Generate with sample data")
