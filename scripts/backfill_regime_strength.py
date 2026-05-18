"""
Backfill regime strength history from market_regime_detail.csv

This script reads the historical market regime data CSV and populates
the regime_strength_history table in Supabase.

Requirements:
    pip install supabase python-dotenv pandas

Environment variables needed:
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key

Usage:
    python backfill_regime_strength.py
"""

from __future__ import annotations

import os
from pathlib import Path
import pandas as pd

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase: pip install supabase")
    raise

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


def get_supabase_client() -> Client:
    """Get Supabase client using environment variables."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        raise ValueError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables."
        )

    return create_client(url, key)


def backfill_from_csv(csv_path: str, start_date: str = "2025-11-14"):
    """
    Read market_regime_detail.csv and upload to Supabase.

    Args:
        csv_path: Path to the CSV file
        start_date: Only upload data from this date onwards (strategy start date)
    """
    print("=" * 60)
    print("Regime Strength History Backfill")
    print("=" * 60)

    # Read CSV
    print(f"\nReading CSV: {csv_path}")
    df = pd.read_csv(csv_path)

    # Convert date column
    df['Date'] = pd.to_datetime(df['Date'])

    # Filter to start_date onwards
    df = df[df['Date'] >= start_date].copy()

    print(f"Found {len(df)} days from {start_date} onwards")

    if df.empty:
        print("No data to upload!")
        return

    # Get Supabase client
    supabase = get_supabase_client()

    # Process each row
    inserted = 0
    updated = 0
    skipped = 0

    for _, row in df.iterrows():
        date_str = row['Date'].strftime("%Y-%m-%d")
        z_spread = float(row['Z Spread Smoothed'])
        regime = row['Regime'].lower()  # "Bullish" or "Bearish" -> lowercase

        data = {
            "date": date_str,
            "regime_strength": round(z_spread, 4),
            "regime": regime,
        }

        try:
            # Try to insert
            supabase.table("regime_strength_history").insert(data).execute()
            inserted += 1
            if inserted % 50 == 0:
                print(f"  Inserted {inserted} rows...")
        except Exception as e:
            # If duplicate, try to update
            if "duplicate" in str(e).lower() or "unique" in str(e).lower():
                try:
                    supabase.table("regime_strength_history").update({
                        "regime_strength": data["regime_strength"],
                        "regime": data["regime"]
                    }).eq("date", date_str).execute()
                    updated += 1
                except:
                    skipped += 1
            else:
                print(f"  Error on {date_str}: {e}")
                skipped += 1

    print(f"\n{'=' * 60}")
    print(f"Summary:")
    print(f"  Inserted: {inserted}")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Total: {len(df)}")
    print("=" * 60)


if __name__ == "__main__":
    # Default path to the CSV file
    csv_path = "/Users/kmf229/Documents/Trading/Substack/analysis/market_regime_detail.csv"

    # Check if file exists
    if not Path(csv_path).exists():
        print(f"Error: CSV file not found at {csv_path}")
        print("\nPlease provide the correct path to market_regime_detail.csv")
        import sys
        sys.exit(1)

    # Run backfill from strategy start date (Nov 14, 2025)
    backfill_from_csv(csv_path, start_date="2025-11-14")

    print("\n✓ Backfill complete!")
    print("\nNote: This CSV only goes through Dec 31, 2025.")
    print("For data from Jan 1, 2026 onwards, run this from your Jupyter notebook:")
    print()
    print("  from update_regime_supabase import save_daily_strength_history, get_supabase_client")
    print("  supabase = get_supabase_client()")
    print("  for date in regime_s.index:")
    print("      if date >= pd.Timestamp('2026-01-01'):")
    print("          save_daily_strength_history(regime_s[:date], z_spread_smoothed[:date], supabase)")
