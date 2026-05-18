"""
Backfill regime strength history from Jan 1, 2026 onwards.

Uses the same calculation logic as pi_scheduler.py to calculate historical
regime strength values and upload them to Supabase.

Requirements:
    pip install supabase python-dotenv pandas numpy

Environment variables needed:
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key

Usage:
    python backfill_2026_strength.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from datetime import datetime
import pandas as pd
import numpy as np

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase: pip install supabase")
    raise

try:
    from stocks_simple import Stocks
except ImportError:
    print("Error: Could not import stocks_simple.py")
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


def calculate_regime_history(start_date: str = "2026-01-01"):
    """
    Calculate regime history using the same logic as pi_scheduler.py

    Args:
        start_date: Start date for backfill

    Returns:
        DataFrame with columns: date, regime_strength, regime
    """
    print(f"Fetching market data from Polygon.io...")

    stocks = Stocks()

    RISK_ON_TICKERS = ["XLK", "XLY", "XLI", "SMH", "IWM"]
    RISK_OFF_TICKERS = ["XLU", "XLP", "XLV", "GLD", "TLT"]
    BENCHMARK = ["SPY"]
    WINDOW_LENGTH = 45
    EMA_SMOOTHING = 20
    BULLISH_THRESHOLD = 0.25

    today = datetime.now().strftime('%Y-%m-%d')

    def fetch_closes(tickers):
        all_series = {}
        for ticker in tickers:
            print(f"  Fetching {ticker}...")
            # Fetch from October to ensure enough data for rolling windows in January
            temp = stocks.ohlc(ticker, start="2025-10-01", end=today)
            all_series[ticker] = (
                temp[['date', 'close']]
                .set_index('date')
                .to_dict()['close']
            )
        df = pd.DataFrame(all_series).sort_index()
        return df

    # Fetch data
    print("Fetching benchmark...")
    benchmark = fetch_closes(BENCHMARK)
    print("Fetching risk-on tickers...")
    risk_on_df = fetch_closes(RISK_ON_TICKERS)
    print("Fetching risk-off tickers...")
    risk_off_df = fetch_closes(RISK_OFF_TICKERS)

    df = pd.concat([risk_on_df, risk_off_df, benchmark], axis=1).dropna()

    print(f"\nCalculating regime strength for {len(df)} days...")

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

    # Filter to start_date onwards
    start_ts = pd.Timestamp(start_date)
    z_spread_filtered = z_spread_smoothed[z_spread_smoothed.index >= start_ts]
    regime_filtered = regime_s[regime_s.index >= start_ts]

    # Build result dataframe
    result = pd.DataFrame({
        'date': z_spread_filtered.index,
        'regime_strength': z_spread_filtered.values,
        'regime': regime_filtered.values
    })

    # Convert regime to lowercase
    result['regime'] = result['regime'].str.lower()

    # Remove any NaN values (from rolling window at start)
    result = result.dropna()

    return result


def backfill_from_calculation(start_date: str = "2026-01-01"):
    """
    Calculate and backfill regime strength history.

    Args:
        start_date: Start date for backfill (default: 2026-01-01)
    """
    print("=" * 60)
    print("Regime Strength History Backfill (2026 onwards)")
    print("=" * 60)

    # Calculate regime history
    df = calculate_regime_history(start_date)

    print(f"\nFound {len(df)} days from {start_date} onwards")

    if df.empty:
        print("No data to upload!")
        return

    # Get Supabase client
    supabase = get_supabase_client()

    # Upload each row
    inserted = 0
    updated = 0
    skipped = 0

    print("\nUploading to Supabase...")
    for _, row in df.iterrows():
        date_str = row['date'].strftime("%Y-%m-%d")

        data = {
            "date": date_str,
            "regime_strength": round(float(row['regime_strength']), 4),
            "regime": row['regime'],
        }

        try:
            # Try to insert
            supabase.table("regime_strength_history").insert(data).execute()
            inserted += 1
            if inserted % 10 == 0:
                print(f"  Inserted {inserted}/{len(df)} days...")
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
    # Backfill from Jan 1, 2026 onwards
    backfill_from_calculation(start_date="2026-01-01")
    print("\n✓ Backfill complete!")
