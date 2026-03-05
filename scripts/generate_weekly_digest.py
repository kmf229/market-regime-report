"""
Generate and send weekly digest emails via Resend.

Runs every Sunday at 5pm ET.

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
    env_file = Path(__file__).parent / ".env"
    env_local = Path(__file__).parent.parent / ".env.local"
    if env_file.exists():
        load_dotenv(env_file)
    elif env_local.exists():
        load_dotenv(env_local)
except ImportError:
    pass

try:
    import resend
    import anthropic
    import pandas as pd
    from supabase import create_client, Client
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install resend anthropic pandas supabase")
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


def get_price_data() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Fetch TQQQ and GLD price data."""
    from stocks_simple import Stocks
    stocks = Stocks()

    tqqq_df = stocks.ohlc("TQQQ")
    gld_df = stocks.ohlc("GLD")
    spy_df = stocks.ohlc("SPY")

    return tqqq_df, gld_df, spy_df


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


def calculate_ytd_returns(tqqq_df: pd.DataFrame, gld_df: pd.DataFrame, spy_df: pd.DataFrame, regime_history: list) -> dict:
    """Calculate YTD returns for strategy and SPY."""
    today = datetime.now().date()
    year_start = datetime(today.year, 1, 1).date()

    # SPY YTD
    spy_df = spy_df.copy()
    spy_df['date'] = pd.to_datetime(spy_df['date']).dt.date
    spy_df = spy_df.sort_values('date')

    spy_start = spy_df[spy_df['date'] >= year_start].iloc[0]['close']
    spy_end = spy_df.iloc[-1]['close']
    spy_ytd = ((spy_end - spy_start) / spy_start) * 100

    # Strategy YTD - sum up returns from regime history for this year
    strategy_ytd = 0.0
    for period in regime_history:
        start_date = datetime.strptime(period['startDate'], '%Y-%m-%d').date()
        if start_date.year == today.year and period.get('returnPct') is not None:
            strategy_ytd += period['returnPct']

    return {
        'strategy_ytd': strategy_ytd,
        'spy_ytd': spy_ytd,
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


def generate_pep_talk(current_trade_return: float) -> str:
    """Generate pep talk based on current trade performance."""
    if current_trade_return is None:
        return "Stay focused on the system. Consistent execution over time is what generates returns."

    if current_trade_return > 15:
        return (
            "The current trade is performing exceptionally well. But remember: no trend lasts forever. "
            "This is not the time to increase position size or get overconfident. Stay disciplined and "
            "let the system tell you when to exit - not emotions or profit targets. The best traders "
            "know that big winners can reverse quickly."
        )
    elif current_trade_return > 5:
        return (
            "The current trade is in solid profit territory. Stay the course and trust the process. "
            "Resist the urge to take profits early - the system will signal when it's time to switch. "
            "Letting winners run is how systematic strategies outperform over time."
        )
    elif current_trade_return > -5:
        return (
            "The current trade is roughly flat - and that's perfectly normal. Markets don't move in "
            "straight lines. Patience is part of the process. The system is working as designed, "
            "waiting for a clear directional move. Stay ready."
        )
    elif current_trade_return > -15:
        return (
            "The current trade is underwater, and that's never comfortable. But this is exactly when "
            "discipline matters most. Drawdowns are a normal part of any strategy - they're the price "
            "of admission for long-term returns. The worst thing you can do is abandon the system "
            "right before it turns around."
        )
    else:
        return (
            "The current trade has experienced a significant drawdown. This is uncomfortable, but it's "
            "also when most people make emotional decisions they regret. The system has weathered "
            "drawdowns before and recovered. Every systematic strategy goes through difficult periods - "
            "what separates successful investors is the discipline to stick with it. Trust the process."
        )


def generate_market_context(price_action: dict, current_regime: str) -> str:
    """Use Claude to generate market context paragraph."""
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    tqqq_data = price_action.get('tqqq_ohlc', [])
    gld_data = price_action.get('gld_ohlc', [])

    tqqq_str = "\n".join([f"{d['date']}: O={d['open']:.2f} H={d['high']:.2f} L={d['low']:.2f} C={d['close']:.2f}" for d in tqqq_data])
    gld_str = "\n".join([f"{d['date']}: O={d['open']:.2f} H={d['high']:.2f} L={d['low']:.2f} C={d['close']:.2f}" for d in gld_data])

    prompt = f"""Based on the following week's price action, write 2-3 sentences describing how TQQQ and GLD traded this week.

IMPORTANT RULES:
- Only describe the price action (up, down, volatile, steady, etc.)
- Do NOT attribute moves to any specific news, events, or reasons
- Do NOT speculate about why prices moved
- Keep it factual and observational
- No emojis

Current regime: {current_regime}

TQQQ Daily OHLC:
{tqqq_str}

GLD Daily OHLC:
{gld_str}

Write the market context paragraph:"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text.strip()


def build_weekly_digest_email(
    regime_status: dict,
    weekly_returns: dict,
    ytd_returns: dict,
    price_action: dict,
    pep_talk: str,
    market_context: str,
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
    current_trade_return = regime_status.get('current_trade_return')
    current_trade_start = regime_status.get('current_trade_start')
    days_in_regime = regime_status.get('days_in_current_regime', 0)

    trade_return_str = f"{'+' if current_trade_return >= 0 else ''}{current_trade_return:.1f}%" if current_trade_return is not None else "N/A"
    trade_start_str = ""
    if current_trade_start:
        start_date = datetime.strptime(current_trade_start, '%Y-%m-%d')
        trade_start_str = start_date.strftime('%b %d')

    # Format returns
    def fmt_return(val):
        return f"{'+' if val >= 0 else ''}{val:.1f}%"

    # Regime strength direction (simplified - would need historical data for accurate change)
    strength_direction = "Stable"
    if abs(scaled_strength) < 3:
        strength_direction = "Near threshold - monitor closely"
    elif abs(scaled_strength) > 7:
        strength_direction = "Firmly in current regime"
    else:
        strength_direction = "Moderate conviction"

    subject = f"Market Regime Weekly Digest: {regime_display}, {fmt_return(strategy_weekly)} This Week"

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
            <p style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: {'#059669' if current_trade_return and current_trade_return >= 0 else '#dc2626'};">
                {trade_return_str} <span style="font-size: 14px; font-weight: 400; color: #6b7280;">since {trade_start_str}</span>
            </p>
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.7;">
                {pep_talk}
            </p>
        </div>

        <!-- Regime Strength -->
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Regime Strength</h2>
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: {'#059669' if is_bullish else '#dc2626'};">
                {strength_label} ({strength_display})
            </p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">{strength_direction}</p>
        </div>

        <!-- Market Context -->
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Market Context</h2>
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.7;">
                {market_context}
            </p>
        </div>

        <!-- YTD Performance -->
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">YTD Performance</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #374151;">Strategy</td>
                    <td style="padding: 8px 0; font-size: 16px; font-weight: 700; text-align: right; color: {'#059669' if ytd_returns['strategy_ytd'] >= 0 else '#dc2626'};">{fmt_return(ytd_returns['strategy_ytd'])}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #374151;">SPY (Benchmark)</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right; color: {'#059669' if ytd_returns['spy_ytd'] >= 0 else '#dc2626'};">{fmt_return(ytd_returns['spy_ytd'])}</td>
                </tr>
            </table>
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

    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise ValueError("Missing ANTHROPIC_API_KEY")

    supabase = get_supabase_client()

    print("Gathering data...")

    # Get all required data
    regime_status = get_regime_status(supabase)
    tqqq_df, gld_df, spy_df = get_price_data()

    weekly_returns = calculate_weekly_returns(tqqq_df, gld_df, spy_df)
    ytd_returns = calculate_ytd_returns(tqqq_df, gld_df, spy_df, regime_status.get('regime_history', []))
    price_action = get_weekly_price_action(tqqq_df, gld_df)

    print("Generating pep talk...")
    pep_talk = generate_pep_talk(regime_status.get('current_trade_return'))

    print("Generating market context...")
    market_context = generate_market_context(price_action, regime_status['current_regime'])

    print("Building email...")
    subject, html = build_weekly_digest_email(
        regime_status=regime_status,
        weekly_returns=weekly_returns,
        ytd_returns=ytd_returns,
        price_action=price_action,
        pep_talk=pep_talk,
        market_context=market_context,
    )

    if test and not test_email:
        print("\n--- TEST MODE ---")
        print(f"Subject: {subject}")
        print(f"\nWould send to opted-in users")
        print(f"\nWeekly returns: TQQQ {weekly_returns['tqqq_weekly']:.1f}%, GLD {weekly_returns['gld_weekly']:.1f}%")
        print(f"YTD: Strategy {ytd_returns['strategy_ytd']:.1f}%, SPY {ytd_returns['spy_ytd']:.1f}%")
        print(f"\nPep talk: {pep_talk[:100]}...")
        print(f"\nMarket context: {market_context}")
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
