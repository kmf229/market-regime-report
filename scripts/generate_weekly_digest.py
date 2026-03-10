from __future__ import annotations
"""
Generate and send weekly digest emails via Resend.

Runs every Sunday at 8am ET.

Usage:
    # Normal mode (sends to opted-in users)
    python generate_weekly_digest.py

    # Test mode (prints email content, doesn't send)
    python generate_weekly_digest.py --test

    # Force send to specific email (for testing)
    python generate_weekly_digest.py --test-email you@example.com

Environment variables needed:
    RESEND_API_KEY=re_xxxxxxxxx
    ANTHROPIC_API_KEY=sk-ant-xxxxxxxxx
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key
"""

import os
import sys
import argparse
from datetime import datetime, timedelta
from pathlib import Path

# Load environment variables
try:
    from dotenv import load_dotenv
    script_dir = Path(__file__).resolve().parent
    env_file = script_dir / ".env"
    env_local = script_dir.parent / ".env.local"

    # Load .env.local from website dir (primary for local dev)
    if env_local.exists():
        load_dotenv(env_local)
    # Also load .env from scripts dir (for Pi)
    if env_file.exists():
        load_dotenv(env_file, override=False)
except ImportError:
    pass

try:
    import resend
    import anthropic
    import pandas as pd
    import requests
    from supabase import create_client, Client
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install resend anthropic pandas supabase requests")
    sys.exit(1)


def get_supabase_client() -> Client:
    """Get Supabase client."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    return create_client(url, key)


def get_regime_status(supabase: Client) -> dict:
    """Get current regime status from Supabase."""
    result = supabase.table("regime_status").select("*").limit(1).single().execute()
    return result.data


def get_opted_in_users(supabase: Client) -> list[dict]:
    """Get users who opted in for weekly digest."""
    result = supabase.table("profiles").select("id, email").eq("weekly_digest", True).execute()
    return result.data or []


def get_daily_updates_this_week(supabase: Client) -> list[dict]:
    """Get daily updates from this past week for context."""
    week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    result = supabase.table("daily_updates").select("*").gte("date", week_ago).order("date", desc=True).execute()
    return result.data or []


def get_price_data() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Fetch TQQQ, GLD, and SPY price data."""
    from stocks_simple import Stocks
    stocks = Stocks()

    tqqq_df = stocks.ohlc("TQQQ")
    gld_df = stocks.ohlc("GLD")
    spy_df = stocks.ohlc("SPY")

    return tqqq_df, gld_df, spy_df


def get_live_price(ticker: str) -> float | None:
    """Fetch live/latest price from Polygon API (same as website uses)."""
    api_key = os.environ.get("POLYGON_API_KEY")
    if not api_key:
        print(f"Warning: POLYGON_API_KEY not set, cannot get live price for {ticker}")
        return None

    today = datetime.now().strftime("%Y-%m-%d")

    try:
        # Try to get today's latest minute bar
        url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/minute/{today}/{today}?apiKey={api_key}&limit=1&sort=desc"
        response = requests.get(url, timeout=10)

        if response.ok:
            data = response.json()
            if data.get("results") and len(data["results"]) > 0:
                return data["results"][0]["c"]

        # Fall back to previous close
        prev_url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/prev?apiKey={api_key}"
        prev_response = requests.get(prev_url, timeout=10)

        if prev_response.ok:
            prev_data = prev_response.json()
            if prev_data.get("results") and len(prev_data["results"]) > 0:
                return prev_data["results"][0]["c"]

    except Exception as e:
        print(f"Error fetching live price for {ticker}: {e}")

    return None


def calculate_current_trade_return(
    regime_status: dict,
    tqqq_df: pd.DataFrame,
    gld_df: pd.DataFrame
) -> float:
    """Calculate current trade return using live prices (same as website)."""
    current_regime = regime_status['current_regime']
    entry_price = regime_status.get('current_trade_entry_price')

    if not entry_price:
        return regime_status.get('current_trade_return', 0)

    ticker = "TQQQ" if current_regime == 'bullish' else "GLD"

    # Try to get live price first (matches website behavior)
    latest_price = get_live_price(ticker)

    # Fall back to historical data if live price unavailable
    if latest_price is None:
        df = tqqq_df.copy() if current_regime == 'bullish' else gld_df.copy()
        df['date'] = pd.to_datetime(df['date']).dt.date
        df = df.sort_values('date')
        latest_price = df.iloc[-1]['close']

    # Calculate return
    return_pct = ((latest_price - entry_price) / entry_price) * 100
    return return_pct


def calculate_weekly_returns(tqqq_df: pd.DataFrame, gld_df: pd.DataFrame, spy_df: pd.DataFrame) -> dict:
    """Calculate this week's returns for TQQQ, GLD, and SPY."""
    today = datetime.now().date()
    week_ago = today - timedelta(days=7)

    def get_return(df, start_date, end_date):
        df = df.copy()
        df['date'] = pd.to_datetime(df['date']).dt.date
        df = df[df['date'] <= end_date].sort_values('date')

        # Get closest dates
        end_row = df[df['date'] <= end_date].iloc[-1]
        start_rows = df[df['date'] <= start_date]
        if len(start_rows) == 0:
            start_row = df.iloc[0]
        else:
            start_row = start_rows.iloc[-1]

        return ((end_row['close'] - start_row['close']) / start_row['close']) * 100

    return {
        'tqqq_weekly': get_return(tqqq_df, week_ago, today),
        'gld_weekly': get_return(gld_df, week_ago, today),
        'spy_weekly': get_return(spy_df, week_ago, today),
    }


def get_weekly_price_action(tqqq_df: pd.DataFrame, gld_df: pd.DataFrame) -> dict:
    """Get price action details for the week."""
    today = datetime.now().date()
    week_ago = today - timedelta(days=7)

    def get_week_data(df):
        df = df.copy()
        df['date'] = pd.to_datetime(df['date']).dt.date
        week_data = df[(df['date'] > week_ago) & (df['date'] <= today)].sort_values('date')
        return week_data

    tqqq_week = get_week_data(tqqq_df)
    gld_week = get_week_data(gld_df)

    return {
        'tqqq_high': tqqq_week['high'].max() if len(tqqq_week) > 0 else 0,
        'tqqq_low': tqqq_week['low'].min() if len(tqqq_week) > 0 else 0,
        'gld_high': gld_week['high'].max() if len(gld_week) > 0 else 0,
        'gld_low': gld_week['low'].min() if len(gld_week) > 0 else 0,
        'tqqq_ohlc': tqqq_week[['date', 'open', 'high', 'low', 'close']].to_dict('records') if len(tqqq_week) > 0 else [],
        'gld_ohlc': gld_week[['date', 'open', 'high', 'low', 'close']].to_dict('records') if len(gld_week) > 0 else [],
    }


def scale_strength(raw_strength: float) -> float:
    """Scale raw z-spread to -10 to +10 scale."""
    THRESHOLD = 0.25
    BEARISH_MIN = -3.5
    BULLISH_MAX = 3.5

    if raw_strength >= THRESHOLD:
        range_val = BULLISH_MAX - THRESHOLD
        distance = raw_strength - THRESHOLD
        scaled = (distance / range_val) * 10
    else:
        range_val = THRESHOLD - BEARISH_MIN
        distance = THRESHOLD - raw_strength
        scaled = -(distance / range_val) * 10

    return max(-10, min(10, scaled))


def get_strength_label(scaled: float) -> str:
    """Get human-readable strength label."""
    abs_val = abs(scaled)
    direction = "Bullish" if scaled >= 0 else "Bearish"

    if abs_val >= 6.66:
        return f"Strong {direction}"
    elif abs_val >= 3.33:
        return f"Moderate {direction}"
    else:
        return f"Weak {direction}"


def generate_current_trade_blurb(
    regime_status: dict,
    price_action: dict,
    current_trade_return: float,
    weekly_returns: dict,
    daily_updates: list[dict]
) -> str:
    """Generate contextual blurb about the current trade using Claude."""
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    current_regime = regime_status['current_regime']
    is_bullish = current_regime == 'bullish'
    ticker = "TQQQ" if is_bullish else "GLD"
    days_in_regime = regime_status.get('days_in_current_regime', 0)
    trade_start = regime_status.get('current_trade_start', 'unknown')

    # Get OHLC data for the held asset
    ohlc_data = price_action.get('tqqq_ohlc' if is_bullish else 'gld_ohlc', [])
    ohlc_str = "\n".join([
        f"{d['date']}: O={d['open']:.2f} H={d['high']:.2f} L={d['low']:.2f} C={d['close']:.2f}"
        for d in ohlc_data
    ])

    # Calculate intra-week volatility
    if ohlc_data:
        week_high = max(d['high'] for d in ohlc_data)
        week_low = min(d['low'] for d in ohlc_data)
        week_range_pct = ((week_high - week_low) / week_low) * 100
    else:
        week_range_pct = 0

    weekly_return = weekly_returns['tqqq_weekly'] if is_bullish else weekly_returns['gld_weekly']

    # Get summaries from daily updates for context
    daily_summaries = ""
    if daily_updates:
        for update in daily_updates[:5]:  # Last 5 days
            daily_summaries += f"- {update.get('date', 'N/A')}: {update.get('content', '')[:150]}...\n"

    prompt = f"""Write a 3-4 sentence paragraph about the current trade for a weekly digest email. Be specific about what happened THIS WEEK.

CONTEXT:
- Current regime: {current_regime.upper()}
- Holding: {ticker}
- Trade started: {trade_start} ({days_in_regime} days ago)
- Current trade return (total since entry): {current_trade_return:+.1f}%
- This week's {ticker} return: {weekly_return:+.1f}%
- This week's price range: {week_range_pct:.1f}% (high to low swing)

THIS WEEK'S DAILY PRICE ACTION for {ticker}:
{ohlc_str}

DAILY UPDATE SUMMARIES FROM THIS WEEK:
{daily_summaries if daily_summaries else "No daily updates available"}

REQUIREMENTS:
1. Start by stating the current trade's total return and how this week contributed (added or subtracted)
2. Describe the week's price action specifically - was it choppy, trending, volatile, calm?
3. If there were significant swings (>5% range), mention the whipsaw/volatile nature
4. End with a forward-looking but non-predictive statement about discipline and the system
5. Do NOT use emojis
6. Do NOT make predictions about future price movement
7. Do NOT attribute moves to any news or events
8. Do NOT use "your" or "you" - write in third person about "the position" or "the trade"
9. Do NOT mention specific dollar prices - only use percentages
10. Keep it factual but engaging

Write the paragraph:"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text.strip()


def generate_strength_change_blurb(
    regime_status: dict,
    daily_updates: list[dict]
) -> str:
    """Generate 1-2 sentence blurb about regime strength change over the week."""
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    current_strength = regime_status.get('regime_strength', 0)
    scaled_strength = scale_strength(current_strength)
    current_regime = regime_status['current_regime']

    # Get strength label
    strength_label = get_strength_label(scaled_strength)

    # Build context from daily updates about strength direction
    strength_context = []
    if daily_updates:
        for update in daily_updates[:5]:
            content = update.get('content', '').lower()
            date = update.get('date', '')
            # Look for directional language
            if any(word in content for word in ['strengthen', 'stronger', 'intensif', 'increas', 'accelerat']):
                strength_context.append(f"{date}: signal strengthening")
            elif any(word in content for word in ['weaken', 'soften', 'decreas', 'fad', 'diminish']):
                strength_context.append(f"{date}: signal weakening")
            elif any(word in content for word in ['stable', 'steady', 'unchanged', 'flat']):
                strength_context.append(f"{date}: stable")

    weekly_direction = "unknown"
    if len(strength_context) >= 2:
        strengthening_count = sum(1 for c in strength_context if 'strengthening' in c)
        weakening_count = sum(1 for c in strength_context if 'weakening' in c)
        if strengthening_count > weakening_count:
            weekly_direction = "strengthening"
        elif weakening_count > strengthening_count:
            weekly_direction = "weakening"
        else:
            weekly_direction = "mixed/stable"

    prompt = f"""Write 1-2 sentences describing the change in regime strength over the past week.

CONTEXT:
- Current regime: {current_regime.upper()}
- Current regime strength: {scaled_strength:+.1f} on a scale of -10 to +10
  (where -10 is strong bearish, 0 is the threshold, +10 is strong bullish)
- Strength label: {strength_label}
- Weekly trend based on daily updates: {weekly_direction}

DAILY STRENGTH OBSERVATIONS:
{chr(10).join(strength_context) if strength_context else "No specific observations available"}

REQUIREMENTS:
1. Describe whether the {current_regime} signal strengthened, weakened, or stayed stable this week
2. Reference the current strength level ({scaled_strength:+.1f}) as context
3. ONLY use the -10 to +10 scale when mentioning numbers - never use raw values
4. Put this in context - is the conviction increasing or decreasing?
5. Do NOT make predictions about future direction
6. Do NOT use emojis
7. Keep it to 1-2 sentences maximum

Write the strength change blurb:"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=100,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text.strip()


def build_weekly_digest_email(
    regime_status: dict,
    weekly_returns: dict,
    current_trade_return: float,
    current_trade_blurb: str,
    strength_change_blurb: str,
) -> tuple[str, str]:
    """Build email subject and HTML body for weekly digest."""

    current_regime = regime_status['current_regime']
    is_bullish = current_regime == 'bullish'
    ticker = "TQQQ" if is_bullish else "GLD"
    regime_display = "Bullish" if is_bullish else "Bearish"

    # Calculate strategy weekly return (based on what we held)
    strategy_weekly = weekly_returns['tqqq_weekly'] if is_bullish else weekly_returns['gld_weekly']

    # Scaled strength
    scaled_strength = scale_strength(regime_status['regime_strength'])
    strength_label = get_strength_label(scaled_strength)
    strength_display = f"{'+' if scaled_strength >= 0 else ''}{scaled_strength:.1f}"

    # Current trade info
    current_trade_start = regime_status.get('current_trade_start')
    days_in_regime = regime_status.get('days_in_current_regime', 0)

    trade_return_str = f"{'+' if current_trade_return >= 0 else ''}{current_trade_return:.1f}%"
    trade_start_str = ""
    if current_trade_start:
        start_date = datetime.strptime(current_trade_start, '%Y-%m-%d')
        trade_start_str = start_date.strftime('%b %d')

    # Format returns
    def fmt_return(val):
        return f"{'+' if val >= 0 else ''}{val:.1f}%"

    # Only show threshold warning if strength is between -1 and +1
    threshold_warning = ""
    if -1 <= scaled_strength <= 1:
        threshold_warning = '<p style="margin: 8px 0 0 0; font-size: 14px; color: #dc2626; font-weight: 500;">Near threshold - monitor closely for potential regime change</p>'

    subject = f"Weekly Digest: {regime_display}, {fmt_return(strategy_weekly)} This Week"

    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

    <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background-color: #111; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 600;">The Market Regime Report</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af;">Weekly Digest - {datetime.now().strftime('%B %d, %Y')}</p>
        </div>

        <!-- Current Position -->
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Current Position</h2>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="display: inline-block; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 14px; background-color: {'#ecfdf5' if is_bullish else '#fef2f2'}; color: {'#065f46' if is_bullish else '#991b1b'};">
                    {regime_display}
                </span>
                <span style="font-size: 16px; color: #374151;">Holding <strong>{ticker}</strong></span>
            </div>
            <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280;">Day {days_in_regime} of current regime</p>
        </div>

        <!-- This Week -->
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">This Week</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #374151;">TQQQ</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right; color: {'#059669' if weekly_returns['tqqq_weekly'] >= 0 else '#dc2626'};">{fmt_return(weekly_returns['tqqq_weekly'])}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #374151;">GLD</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right; color: {'#059669' if weekly_returns['gld_weekly'] >= 0 else '#dc2626'};">{fmt_return(weekly_returns['gld_weekly'])}</td>
                </tr>
                <tr style="border-top: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0 0 0; font-size: 14px; font-weight: 600; color: #111;">Strategy Return</td>
                    <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 700; text-align: right; color: {'#059669' if strategy_weekly >= 0 else '#dc2626'};">{fmt_return(strategy_weekly)}</td>
                </tr>
            </table>
        </div>

        <!-- Current Trade -->
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb;">
            <h2 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Current Trade</h2>
            <p style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: {'#059669' if current_trade_return >= 0 else '#dc2626'};">
                {trade_return_str} <span style="font-size: 14px; font-weight: 400; color: #6b7280;">since {trade_start_str}</span>
            </p>
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.7;">
                {current_trade_blurb}
            </p>
        </div>

        <!-- Regime Strength -->
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Regime Strength</h2>
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: {'#059669' if is_bullish else '#dc2626'};">
                {strength_label} ({strength_display})
            </p>
            <p style="margin: 12px 0 0 0; font-size: 14px; color: #374151; line-height: 1.6;">
                {strength_change_blurb}
            </p>
            {threshold_warning}
        </div>

        <!-- CTA -->
        <div style="padding: 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <a href="https://marketregimes.com/current-regime"
               style="display: inline-block; background-color: #111; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 14px;">
                View Current Regime
            </a>
        </div>

        <!-- Strategy Reminder -->
        <div style="padding: 24px; background-color: #f9fafb;">
            <h2 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">How This Works</h2>
            <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.7;">
                The Market Regime strategy switches between TQQQ (bullish) and GLD (bearish) based on relative strength signals.
                No predictions, no emotions - just systematic execution. When the model detects risk-on conditions, we hold TQQQ.
                When it detects risk-off conditions, we rotate to GLD. The goal is to participate in upside while avoiding major drawdowns.
            </p>
        </div>

    </div>

    <!-- Footer -->
    <div style="padding: 24px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            You're receiving this because you opted in for the weekly digest.
            <br>
            Manage your preferences on the <a href="https://marketregimes.com/current-regime" style="color: #6b7280;">Current Regime</a> page.
        </p>
        <p style="margin: 16px 0 0 0; font-size: 11px; color: #9ca3af;">
            This is not investment advice. Past performance does not guarantee future results.
        </p>
    </div>

</body>
</html>
"""

    return subject, html


def send_weekly_digest(test: bool = False, test_email: str = None) -> None:
    """Generate and send weekly digest emails."""

    # Initialize APIs
    resend.api_key = os.environ.get("RESEND_API_KEY")
    if not resend.api_key:
        raise ValueError("Missing RESEND_API_KEY")

    supabase = get_supabase_client()

    print("Gathering data...")

    # Get all required data
    regime_status = get_regime_status(supabase)
    tqqq_df, gld_df, spy_df = get_price_data()
    daily_updates = get_daily_updates_this_week(supabase)

    weekly_returns = calculate_weekly_returns(tqqq_df, gld_df, spy_df)
    price_action = get_weekly_price_action(tqqq_df, gld_df)

    # Calculate current trade return fresh (not from cached Supabase value)
    current_trade_return = calculate_current_trade_return(regime_status, tqqq_df, gld_df)
    print(f"Current trade return (fresh calc): {current_trade_return:.2f}%")

    print("Generating current trade blurb...")
    current_trade_blurb = generate_current_trade_blurb(
        regime_status=regime_status,
        price_action=price_action,
        current_trade_return=current_trade_return,
        weekly_returns=weekly_returns,
        daily_updates=daily_updates
    )

    print("Generating strength change blurb...")
    strength_change_blurb = generate_strength_change_blurb(
        regime_status=regime_status,
        daily_updates=daily_updates
    )

    print("Building email...")
    subject, html = build_weekly_digest_email(
        regime_status=regime_status,
        weekly_returns=weekly_returns,
        current_trade_return=current_trade_return,
        current_trade_blurb=current_trade_blurb,
        strength_change_blurb=strength_change_blurb,
    )

    if test and not test_email:
        print("\n--- TEST MODE ---")
        print(f"Subject: {subject}")
        print(f"\nWeekly returns: TQQQ {weekly_returns['tqqq_weekly']:.1f}%, GLD {weekly_returns['gld_weekly']:.1f}%")
        print(f"Current trade return: {current_trade_return:.1f}%")
        print(f"\nCurrent trade blurb:\n{current_trade_blurb}")
        print(f"\nStrength change blurb:\n{strength_change_blurb}")
        print(f"\nWould send to opted-in users")
        return

    # Get recipients
    if test_email:
        users = [{"email": test_email}]
        print(f"Test mode: sending to {test_email}")
    else:
        users = get_opted_in_users(supabase)
        print(f"Found {len(users)} users opted in for weekly digest")

    if not users:
        print("No users to send to.")
        return

    # Send emails
    sent_count = 0
    for user in users:
        email = user.get("email")
        if not email:
            continue

        try:
            resend.Emails.send({
                "from": "Market Regime Report <digest@marketregimes.com>",
                "to": email,
                "subject": subject,
                "html": html,
            })
            sent_count += 1
            print(f"Sent to: {email}")
        except Exception as e:
            print(f"Failed to send to {email}: {e}")

    print(f"\nSent {sent_count}/{len(users)} emails successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate and send weekly digest")
    parser.add_argument("--test", action="store_true", help="Test mode: print content without sending")
    parser.add_argument("--test-email", type=str, help="Send test email to specific address")

    args = parser.parse_args()

    send_weekly_digest(test=args.test, test_email=args.test_email)
