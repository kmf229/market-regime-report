"""
Backfill recent regime strength history from Jupyter notebook.

This script is meant to be run from your Jupyter notebook after you've
calculated regime_s and z_spread_smoothed with your latest data.

Usage (in Jupyter notebook):
    import os
    os.environ["SUPABASE_URL"] = "https://your-project.supabase.co"
    os.environ["SUPABASE_SERVICE_KEY"] = "your-service-key"

    import sys
    sys.path.insert(0, 'website/scripts')
    from backfill_recent_strength import backfill_recent

    # After calculating regime_s and z_spread_smoothed:
    backfill_recent(regime_s, z_spread_smoothed, start_date='2026-01-01')
"""

from __future__ import annotations

import pandas as pd
from update_regime_supabase import save_daily_strength_history, get_supabase_client


def backfill_recent(
    regime_s: pd.Series,
    z_spread_smoothed: pd.Series,
    start_date: str = '2026-01-01'
):
    """
    Backfill regime strength history from a specific date onwards.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values
        start_date: Start date for backfill (default: 2026-01-01)
    """
    print("=" * 60)
    print("Regime Strength History Backfill (Recent Data)")
    print("=" * 60)

    # Ensure datetime index
    if not isinstance(regime_s.index, pd.DatetimeIndex):
        regime_s.index = pd.to_datetime(regime_s.index)
    if not isinstance(z_spread_smoothed.index, pd.DatetimeIndex):
        z_spread_smoothed.index = pd.to_datetime(z_spread_smoothed.index)

    regime_s = regime_s.sort_index()
    z_spread_smoothed = z_spread_smoothed.sort_index()

    # Filter to start_date onwards
    start_ts = pd.Timestamp(start_date)
    dates = regime_s.index[regime_s.index >= start_ts]

    print(f"\nBackfilling {len(dates)} days from {start_date} onwards...")

    if len(dates) == 0:
        print("No data to backfill!")
        return

    # Get Supabase client
    supabase = get_supabase_client()

    # Process each date
    inserted = 0
    updated = 0
    skipped = 0

    for date in dates:
        try:
            # Get data up to this date
            regime_to_date = regime_s[:date]
            z_spread_to_date = z_spread_smoothed[:date]

            # Save this day's strength
            date_str = date.strftime("%Y-%m-%d")
            z_today = float(z_spread_to_date.loc[date])
            regime_today = regime_to_date.loc[date]
            regime_str = "bullish" if str(regime_today).lower().startswith("bull") else "bearish"

            data = {
                "date": date_str,
                "regime_strength": round(z_today, 4),
                "regime": regime_str,
            }

            try:
                supabase.table("regime_strength_history").insert(data).execute()
                inserted += 1
                if inserted % 10 == 0:
                    print(f"  Inserted {inserted}/{len(dates)} days...")
            except Exception as e:
                if "duplicate" in str(e).lower() or "unique" in str(e).lower():
                    supabase.table("regime_strength_history").update({
                        "regime_strength": data["regime_strength"],
                        "regime": data["regime"]
                    }).eq("date", date_str).execute()
                    updated += 1
                else:
                    print(f"  Error on {date_str}: {e}")
                    skipped += 1

        except Exception as e:
            print(f"  Error processing {date}: {e}")
            skipped += 1
            continue

    print(f"\n{'=' * 60}")
    print(f"Summary:")
    print(f"  Inserted: {inserted}")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Total: {len(dates)}")
    print("=" * 60)


if __name__ == "__main__":
    print("This script should be run from your Jupyter notebook.")
    print("See the docstring for usage instructions.")
