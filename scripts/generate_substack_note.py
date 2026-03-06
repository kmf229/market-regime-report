"""
Generate Substack Notes content and email it for manual posting.

Runs at 4:15pm ET on trading days. Generates a short note about the current
regime status and emails it for copy/paste to Substack Notes.

Usage:
    python generate_substack_note.py          # Normal run (skips weekends)
    python generate_substack_note.py --test   # Test run (ignores day check)
"""

from __future__ import annotations

import os
import sys
import argparse
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
import pytz

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables
try:
    from dotenv import load_dotenv
    env_file = Path(__file__).parent / ".env"
    env_local = Path(__file__).parent.parent / ".env.local"
    if env_file.exists():
        load_dotenv(env_file)
    elif env_local.resolve().exists():
        load_dotenv(env_local.resolve())
except ImportError:
    pass

ET = pytz.timezone("America/New_York")

# The prompt template
PROMPT_TEMPLATE = """# MASTER CONTEXT

You are writing on behalf of a professional market signal service called "Market Regime Report."

This is NOT a trading education brand, influencer account, or personal diary.

BUSINESS OVERVIEW:
Market Regime Report is a rules-based market regime signal service designed to reduce decision-making, emotional trading, and overreaction. The service publishes a daily market regime status (Bullish or Bearish) based on the relative strength of risk-on vs risk-off assets.

When conditions are favorable, the model is Bullish (technology exposure via TQQQ).
When conditions deteriorate, the model is Bearish (defensive exposure via GLD).

There are no predictions, targets, forecasts, or discretionary overrides.
The value of the service is consistency, restraint, and clarity — not action or excitement.

CORE PHILOSOPHY:
- Markets change environments before they change direction
- Most losses come from acting between signals
- Boredom is a feature, not a bug
- Doing nothing is often the correct position
- The goal is to stay aligned with conditions, not to be early or clever

AUDIENCE:
- Busy professionals
- Capital-preservation minded investors
- People who want fewer decisions, not more information
- People who value discipline over excitement

TONE & STYLE:
- Calm
- Professional
- Minimalist
- Non-reactive
- No hype, no emotion, no bravado
- No emojis
- No slang
- No engagement bait

WHAT THIS IS NOT:
- Not day trading
- Not stock picking
- Not performance hype
- Not a personal journey
- Not a teaching service

LANGUAGE RULES:
- Short sentences
- Plain language
- Avoid repeated phrasing
- Avoid absolutes and guarantees
- Avoid explaining mechanics or indicators
- Avoid telling people what to buy or sell
- Avoid referencing profits, P&L, or account size

The goal of all output is to quietly demonstrate judgment, restraint, and consistency.

# SPECIFIC CONTEXT

Using the context above, generate Substack Notes content for Market Regime Report.

TQQQ OHLCV (last 2 months):
{tqqq_ohlcv}

GLD OHLCV (last 2 months):
{gld_ohlcv}

Regime Strength Line (last 2 months, scale: -10 to +10, threshold at 0):
{regime_strength}

Current Regime: {current_regime}
Days in Current Regime: {days_in_regime}

DAY_CONTEXT: {day_context}

POSTING FREQUENCY:
- Generate ONE Note per request
- Notes are published after market close on trading days

If DAY_CONTEXT = WEEKEND:
- Note should be philosophical or process-oriented
- Avoid references to specific market sessions

NOTE PURPOSE:
Substack Notes are NOT articles.
They are short, calm observations that reinforce how to think about market regimes.

Each Note should do ONE of the following:

1. State the current regime and frame why it matters
2. Explain why "nothing changed" matters (if regime unchanged)
3. Frame recent market movement without overreacting
4. Reinforce patience, discipline, or environment-based thinking
5. Clarify what this service is or is not

NOTE STRUCTURE:
- 40-120 words
- 1-3 short paragraphs
- No headlines
- No bullet points
- No emojis
- No hashtags
- No performance discussion
- No predictions
- ALWAYS end with a link to the current regime page (see format below)

CONTENT RULES:
- State the current regime clearly (Bullish or Bearish)
- If regime is unchanged, focus on restraint and consistency
- If regime strength is shifting, describe it as gradual and monitored
- If regime just changed, note it calmly without fanfare
- Avoid technical jargon
- Avoid explaining indicators
- Avoid emotional language
- Avoid telling readers what to do

STYLE EXAMPLES (DO NOT COPY):
- "A quiet market doesn't mean nothing is happening."
- "Consistency matters most when nothing feels urgent."
- "Day 45 in a Bullish regime. The model remains unchanged."

The goal of each Note is to quietly reinforce trust in the process while keeping readers informed.

OUTPUT FORMAT:
Return ONLY the Note text followed by the link.
Do not add commentary or explanations.

The Note MUST end with this exact line:
marketregimes.com/current-regime"""


def get_ohlcv_data(ticker: str, days: int = 60) -> pd.DataFrame:
    """Fetch OHLCV data for a ticker."""
    from stocks_simple import Stocks

    stocks = Stocks()
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=days + 10)).strftime('%Y-%m-%d')  # Extra buffer

    df = stocks.ohlc(ticker, start=start_date, end=end_date)
    return df.tail(days)


def format_ohlcv_for_prompt(df: pd.DataFrame) -> str:
    """Format OHLCV data as CSV-like string."""
    lines = ["date,open,high,low,close,volume"]
    for _, row in df.iterrows():
        date_str = row['date'].strftime('%Y-%m-%d') if hasattr(row['date'], 'strftime') else str(row['date'])[:10]
        lines.append(f"{date_str},{row['open']:.2f},{row['high']:.2f},{row['low']:.2f},{row['close']:.2f},{int(row['volume'])}")
    return "\n".join(lines)


def get_regime_data() -> tuple[str, int, pd.Series]:
    """Get current regime, days in regime, and regime strength history."""
    from stocks_simple import Stocks

    stocks = Stocks()

    RISK_ON_TICKERS = ["XLK", "XLY", "XLI", "SMH", "IWM"]
    RISK_OFF_TICKERS = ["XLU", "XLP", "XLV", "GLD", "TLT"]
    BENCHMARK = ["SPY"]
    WINDOW_LENGTH = 45
    EMA_SMOOTHING = 20
    BULLISH_THRESHOLD = 0.25

    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=120)).strftime('%Y-%m-%d')  # Extra history for calculations

    def fetch_closes(tickers):
        all_series = {}
        for ticker in tickers:
            temp = stocks.ohlc(ticker, start=start_date, end=end_date)
            all_series[ticker] = temp.set_index('date')['close'].to_dict()
        return pd.DataFrame(all_series).sort_index()

    # Fetch data
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

    # Current regime
    current_regime = regime_s.iloc[-1]

    # Days in current regime
    days_in_regime = 1
    for i in range(len(regime_s) - 2, -1, -1):
        if regime_s.iloc[i] == current_regime:
            days_in_regime += 1
        else:
            break

    # Scale z_spread to -10 to +10
    def scale_strength(raw: float) -> float:
        threshold = 0.25
        bearish_min = -3.5
        bullish_max = 3.5
        if raw >= threshold:
            scaled = ((raw - threshold) / (bullish_max - threshold)) * 10
        else:
            scaled = -((threshold - raw) / (threshold - bearish_min)) * 10
        return max(-10, min(10, scaled))

    scaled_strength = z_spread_smoothed.apply(scale_strength)

    return current_regime, days_in_regime, scaled_strength.tail(60)


def format_regime_strength_for_prompt(strength_series: pd.Series) -> str:
    """Format regime strength as CSV-like string."""
    lines = ["date,strength"]
    for date, strength in strength_series.items():
        date_str = date.strftime('%Y-%m-%d') if hasattr(date, 'strftime') else str(date)[:10]
        lines.append(f"{date_str},{strength:.2f}")
    return "\n".join(lines)


def generate_note(
    tqqq_ohlcv: str,
    gld_ohlcv: str,
    regime_strength: str,
    current_regime: str,
    days_in_regime: int,
    day_context: str = "TRADING_DAY"
) -> str:
    """Generate the Substack note using Claude API."""
    import anthropic

    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    prompt = PROMPT_TEMPLATE.format(
        tqqq_ohlcv=tqqq_ohlcv,
        gld_ohlcv=gld_ohlcv,
        regime_strength=regime_strength,
        current_regime=current_regime,
        days_in_regime=days_in_regime,
        day_context=day_context
    )

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text.strip()


def send_note_email(note: str, to_email: str = "kmf229@stern.nyu.edu") -> None:
    """Send the generated note via email."""
    import resend

    resend.api_key = os.environ.get("RESEND_API_KEY")

    today = datetime.now(ET).strftime("%B %d, %Y")

    html_content = f"""
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Substack Note Ready
        </h2>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
            {today} - Copy and paste to Substack Notes
        </p>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.7; white-space: pre-wrap; margin: 0;">{note}</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px;">
            This note was auto-generated. Review before posting.
        </p>
    </div>
    """

    resend.Emails.send({
        "from": "Market Regime Report <alerts@marketregimes.com>",
        "to": [to_email],
        "subject": f"Substack Note Ready - {today}",
        "html": html_content,
    })

    print(f"Note emailed to {to_email}")


def generate_and_send_note(test: bool = False) -> None:
    """Main function to generate and send the note."""
    now = datetime.now(ET)

    # Check if trading day (skip weekends unless testing)
    if not test and now.weekday() > 4:
        print(f"[{now}] Weekend, skipping note generation")
        return

    # Determine day context
    if now.weekday() > 4:
        day_context = "WEEKEND"
    else:
        day_context = "TRADING_DAY"

    print(f"[{now}] Fetching market data...")

    # Get OHLCV data (2 months)
    tqqq_df = get_ohlcv_data("TQQQ", days=60)
    gld_df = get_ohlcv_data("GLD", days=60)

    tqqq_ohlcv = format_ohlcv_for_prompt(tqqq_df)
    gld_ohlcv = format_ohlcv_for_prompt(gld_df)

    print(f"[{now}] Calculating regime data...")

    # Get regime data
    current_regime, days_in_regime, strength_series = get_regime_data()
    regime_strength = format_regime_strength_for_prompt(strength_series)

    print(f"[{now}] Current regime: {current_regime}, Day {days_in_regime}")
    print(f"[{now}] Generating note with Claude...")

    # Generate note
    note = generate_note(
        tqqq_ohlcv=tqqq_ohlcv,
        gld_ohlcv=gld_ohlcv,
        regime_strength=regime_strength,
        current_regime=current_regime,
        days_in_regime=days_in_regime,
        day_context=day_context
    )

    print(f"[{now}] Generated note:")
    print("-" * 40)
    print(note)
    print("-" * 40)

    # Send email
    print(f"[{now}] Sending email...")
    send_note_email(note)

    print(f"[{now}] Done!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Substack Notes")
    parser.add_argument("--test", action="store_true", help="Test mode (ignore day check)")
    args = parser.parse_args()

    generate_and_send_note(test=args.test)
