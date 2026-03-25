"""
Send regime change alert emails via Resend.

Usage:
    # Normal mode (only sends if regime changed)
    python send_alerts.py

    # Force send (manual trigger, sends regardless of change)
    python send_alerts.py --force

    # Test mode (prints email content, doesn't send)
    python send_alerts.py --test

Environment variables needed:
    RESEND_API_KEY=re_xxxxxxxxx
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key
"""

import os
import sys
import argparse
from datetime import datetime
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
    from supabase import create_client, Client
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install resend supabase")
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


def get_opted_in_users(supabase: Client, alert_type: str) -> list[dict]:
    """Get users who opted in for a specific alert type."""
    result = supabase.table("profiles").select("id, email").eq(alert_type, True).execute()
    return result.data or []


def update_previous_regime(supabase: Client, regime: str) -> None:
    """Update the previous_regime field for tomorrow's comparison."""
    existing = supabase.table("regime_status").select("id").limit(1).execute()
    if existing.data:
        supabase.table("regime_status").update({
            "previous_regime": regime
        }).eq("id", existing.data[0]["id"]).execute()


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


def build_regime_change_email(regime: str, strength: float) -> tuple[str, str]:
    """Build email subject and HTML body for regime change alert."""
    is_bullish = regime == "bullish"
    ticker = "TQQQ" if is_bullish else "GLD"
    regime_display = "BULLISH" if is_bullish else "BEARISH"
    emoji = "🟢" if is_bullish else "🔴"

    scaled_strength = scale_strength(strength)
    strength_label = get_strength_label(scaled_strength)
    strength_display = f"{'+' if scaled_strength >= 0 else ''}{scaled_strength:.1f}"

    subject = f"{emoji} Regime Change Alert: Now {regime_display}"

    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="border-bottom: 2px solid #e5e5e5; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px; color: #111;">The Market Regime Report</h1>
    </div>

    <div style="background-color: {'#ecfdf5' if is_bullish else '#fef2f2'}; border-left: 4px solid {'#10b981' if is_bullish else '#ef4444'}; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; font-size: 20px; color: {'#065f46' if is_bullish else '#991b1b'};">
            {emoji} Regime Changed to {regime_display}
        </h2>
        <p style="margin: 0; font-size: 16px; color: #555;">
            As of 3:30 PM ET on {datetime.now().strftime('%B %d, %Y')}
        </p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
                <strong>Suggested Position</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right; font-size: 18px; font-weight: bold; color: {'#10b981' if is_bullish else '#ef4444'};">
                {ticker}
            </td>
        </tr>
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
                <strong>Regime Strength</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
                {strength_label} ({strength_display})
            </td>
        </tr>
    </table>

    <div style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>⚠️ Note:</strong> There are 30 minutes until market close. The regime could still change.
            Check the Current Regime page for real-time updates before trading.
        </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://marketregimes.com/current-regime"
           style="display: inline-block; background-color: #111; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
            View Current Regime →
        </a>
    </div>

    <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 20px; font-size: 12px; color: #666;">
        <p>
            You're receiving this because you opted in for regime change alerts.
            You can manage your preferences on the <a href="https://marketregimes.com/current-regime" style="color: #666;">Current Regime</a> page.
        </p>
        <p style="margin-top: 10px;">
            This is not investment advice. Past performance does not guarantee future results.
        </p>
    </div>
</body>
</html>
"""

    return subject, html


def send_regime_change_alerts(force: bool = False, test: bool = False) -> None:
    """
    Check for regime change and send alerts if needed.

    Compares signal_regime (today's intraday signal) with previous_regime (yesterday's close).
    This alerts users 30 min before close that a regime flip is imminent.

    Args:
        force: If True, send alerts regardless of regime change
        test: If True, print email content instead of sending
    """
    # Initialize
    resend.api_key = os.environ.get("RESEND_API_KEY")
    if not resend.api_key:
        raise ValueError("Missing RESEND_API_KEY environment variable")

    supabase = get_supabase_client()

    # Get current regime status
    status = get_regime_status(supabase)
    # Use signal_regime (intraday) to detect potential change vs yesterday's close
    signal_regime = status.get("signal_regime") or status["current_regime"]
    previous_regime = status.get("previous_regime")
    regime_strength = status["regime_strength"]

    print(f"Signal regime (intraday): {signal_regime}")
    print(f"Previous regime (yesterday): {previous_regime}")

    # Check if regime is changing (signal differs from yesterday's close)
    regime_changed = previous_regime is not None and signal_regime != previous_regime

    if not regime_changed and not force:
        print("No regime change detected. No alerts to send.")
        return

    if force:
        print("Force mode: sending alerts regardless of change.")
    else:
        print(f"Regime changing from {previous_regime} to {signal_regime}!")

    # Get opted-in users
    users = get_opted_in_users(supabase, "regime_change_alerts")
    print(f"Found {len(users)} users opted in for regime change alerts.")

    if not users:
        print("No users to notify.")
        return

    # Build email (use signal_regime for the new regime)
    subject, html = build_regime_change_email(signal_regime, regime_strength)

    if test:
        print("\n--- TEST MODE ---")
        print(f"Subject: {subject}")
        print(f"Would send to: {[u['email'] for u in users]}")
        print("HTML content generated successfully.")
        return

    # Send emails
    sent_count = 0
    for user in users:
        email = user.get("email")
        if not email:
            continue

        try:
            resend.Emails.send({
                "from": "Market Regime Report <alerts@marketregimes.com>",
                "to": email,
                "subject": subject,
                "html": html,
            })
            sent_count += 1
            print(f"Sent to: {email}")
        except Exception as e:
            print(f"Failed to send to {email}: {e}")

    print(f"\nSent {sent_count}/{len(users)} emails successfully.")


def store_closing_regime() -> None:
    """Store today's closing regime as previous_regime for tomorrow."""
    supabase = get_supabase_client()
    status = get_regime_status(supabase)
    current_regime = status["current_regime"]

    update_previous_regime(supabase, current_regime)
    print(f"Stored closing regime: {current_regime}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send regime change alerts")
    parser.add_argument("--force", action="store_true", help="Force send alerts regardless of regime change")
    parser.add_argument("--test", action="store_true", help="Test mode: print email content without sending")
    parser.add_argument("--store-closing", action="store_true", help="Store current regime as closing regime")

    args = parser.parse_args()

    if args.store_closing:
        store_closing_regime()
    else:
        send_regime_change_alerts(force=args.force, test=args.test)
