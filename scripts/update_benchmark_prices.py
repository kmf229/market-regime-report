"""
Update benchmark prices in Supabase.
Fetches daily OHLC data for TQQQ, SPY, QQQ, GLD from Polygon.io.

Requirements:
    pip install supabase python-dotenv

Environment variables needed:
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key
    POLYGON_API_KEY=your-polygon-api-key (only if stocks_simple.py uses env var)

Usage:
    python update_benchmark_prices.py
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase: pip install supabase")
    raise

# Add current directory to path for stocks_simple import
sys.path.insert(0, str(Path(__file__).parent))

try:
    from stocks_simple import Stocks
except ImportError:
    print("Error: Could not import stocks_simple.py")
    raise

# Load environment variables if .env file exists
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


def update_benchmark_prices(days_back: int = 5):
    """
    Fetch and update benchmark prices for TQQQ, SPY, QQQ, GLD.

    Args:
        days_back: Number of days to fetch (default 5 to catch up on weekends/holidays)
    """
    print("=" * 60)
    print("Benchmark Prices Update")
    print(f"Started at: {datetime.now()}")
    print("=" * 60)

    supabase = get_supabase_client()
    stocks = Stocks()

    tickers = ["TQQQ", "SPY", "QQQ", "GLD"]

    # Calculate date range
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")

    print(f"\nFetching prices from {start_date} to {end_date}...")

    total_inserted = 0
    total_updated = 0

    for ticker in tickers:
        print(f"\n  {ticker}...")
        try:
            # Fetch OHLC data from Polygon
            df = stocks.ohlc(ticker, start=start_date, end=end_date)

            if df.empty:
                print(f"    Warning: No data returned for {ticker}")
                continue

            # Process each row
            for _, row in df.iterrows():
                date_str = row['date'].strftime("%Y-%m-%d")

                data = {
                    "ticker": ticker,
                    "date": date_str,
                    "open": float(row['open']),
                    "high": float(row['high']),
                    "low": float(row['low']),
                    "close": float(row['close']),
                    "volume": int(row['volume']) if 'volume' in row else None,
                }

                try:
                    # Try to insert
                    supabase.table("benchmark_prices").insert(data).execute()
                    total_inserted += 1
                except Exception as e:
                    # If duplicate, update
                    if "duplicate" in str(e).lower() or "unique" in str(e).lower():
                        supabase.table("benchmark_prices").update({
                            "open": data["open"],
                            "high": data["high"],
                            "low": data["low"],
                            "close": data["close"],
                            "volume": data["volume"],
                        }).eq("ticker", ticker).eq("date", date_str).execute()
                        total_updated += 1
                    else:
                        print(f"    Error saving {date_str}: {e}")

            print(f"    ✓ Processed {len(df)} days")

        except Exception as e:
            print(f"    Error fetching {ticker}: {e}")
            continue

    print(f"\n{'=' * 60}")
    print(f"Summary: {total_inserted} inserted, {total_updated} updated")
    print("=" * 60)


if __name__ == "__main__":
    update_benchmark_prices()
