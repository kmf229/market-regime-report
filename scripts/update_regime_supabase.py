"""
Update regime data in Supabase.
Works from both Raspberry Pi (scheduled) and Jupyter notebook (manual backup).

Requirements:
    pip install supabase python-dotenv

Environment variables needed:
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key  # NOT the anon key

Usage:
    from update_regime_supabase import update_regime_status, upload_speedometer

    # Update regime data
    update_regime_status(
        regime_s=regime_s,
        z_spread_smoothed=z_spread_smoothed
    )

    # Upload speedometer image
    upload_speedometer("/path/to/speedometer.png")
"""

from __future__ import annotations  # Enables modern type hints on Python 3.8+

import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
import pandas as pd
import numpy as np

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase: pip install supabase")
    raise

# Load environment variables if .env file exists
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
    pass  # dotenv is optional


def get_supabase_client() -> Client:
    """Get Supabase client using environment variables."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        raise ValueError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables. "
            "Set them in your environment or in a .env file."
        )

    return create_client(url, key)


def calculate_regime_periods(regime_s: pd.Series, tqqq_prices: pd.Series = None, gld_prices: pd.Series = None) -> list[dict]:
    """Convert a regime Series into a list of regime periods with returns.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        tqqq_prices: Series of TQQQ close prices indexed by date (optional)
        gld_prices: Series of GLD close prices indexed by date (optional)

    Logic for regime transitions:
    - On the day the regime flips, we sell the old position at close AND buy the new position at close
    - So the flip date is the END date of the old regime (exit at close)
    - And the flip date is also the START date of the new regime (enter at close)
    """
    regime_s = regime_s.dropna().sort_index()

    periods = []
    current_regime = None
    period_start = None

    for date, regime in regime_s.items():
        regime_str = "bullish" if str(regime).lower().startswith("bull") else "bearish"

        if regime_str != current_regime:
            if current_regime is not None:
                # The flip date (today) is when we exit the old regime at close
                end_date = date
                duration = (date - period_start).days + 1  # Include both start and end dates
                period = {
                    "regime": current_regime,
                    "startDate": period_start.strftime("%Y-%m-%d"),
                    "endDate": end_date.strftime("%Y-%m-%d"),
                    "durationDays": duration,
                }
                # Calculate return if price data available
                if tqqq_prices is not None and gld_prices is not None:
                    period["returnPct"] = _calculate_period_return(
                        current_regime, period_start, end_date, tqqq_prices, gld_prices
                    )
                periods.append(period)
            current_regime = regime_str
            period_start = date  # New regime starts on flip date (buy at close)

    # Add current (open) period
    if current_regime is not None:
        today = regime_s.index.max()
        period = {
            "regime": current_regime,
            "startDate": period_start.strftime("%Y-%m-%d"),
            "endDate": None,
            "durationDays": (today - period_start).days,  # 0 on entry day
        }
        # Calculate return for current period (start to today)
        if tqqq_prices is not None and gld_prices is not None:
            period["returnPct"] = _calculate_period_return(
                current_regime, period_start, today, tqqq_prices, gld_prices
            )
        periods.append(period)

    return periods[-10:][::-1]  # Last 10, most recent first


def _calculate_period_return(regime: str, start_date, end_date, tqqq_prices: pd.Series, gld_prices: pd.Series) -> float:
    """Calculate the return for a regime period.

    Logic:
    - Bullish: holding TQQQ, return = (end_price - start_price) / start_price
    - Bearish: holding GLD, return = (end_price - start_price) / start_price

    The start_date is the day we entered the position (buy at close).
    The end_date is the day we exited the position (sell at close).
    """
    prices = tqqq_prices if regime == "bullish" else gld_prices

    # Get entry price (close on start_date)
    try:
        entry_price = prices.loc[start_date]
    except KeyError:
        # Find nearest date
        idx = prices.index.get_indexer([start_date], method='nearest')[0]
        entry_price = prices.iloc[idx]

    # Get exit price (close on end_date)
    try:
        exit_price = prices.loc[end_date]
    except KeyError:
        # Find nearest date
        idx = prices.index.get_indexer([end_date], method='nearest')[0]
        exit_price = prices.iloc[idx]

    # Calculate return as percentage
    return_pct = ((exit_price - entry_price) / entry_price) * 100
    return round(return_pct, 2)


def calculate_regime_stats(regime_history: list[dict]) -> dict:
    """Calculate regime statistics."""
    current_year = datetime.now().year

    days_in_current = regime_history[0]["durationDays"] if regime_history else 0

    changes_this_year = sum(
        1 for p in regime_history
        if datetime.strptime(p["startDate"], "%Y-%m-%d").year == current_year
    )

    completed_periods = [p for p in regime_history if p["endDate"] is not None]
    avg_duration = int(np.mean([p["durationDays"] for p in completed_periods])) if completed_periods else 0

    return {
        "days_in_current_regime": days_in_current,
        "regime_changes_this_year": changes_this_year,
        "avg_regime_duration_days": avg_duration,
    }


def update_intraday(
    regime_s: pd.Series,
    z_spread_smoothed: pd.Series,
    supabase: Client = None
) -> dict:
    """
    Update intraday regime signal data in Supabase.

    Only updates signal_regime, regime_strength, strength_change, and last_updated.
    Does NOT update current_regime, trade stats, or regime_history (those only change at close).

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values
        supabase: Optional Supabase client

    Returns:
        The updated record
    """
    if supabase is None:
        supabase = get_supabase_client()

    # Ensure datetime index
    if not isinstance(regime_s.index, pd.DatetimeIndex):
        regime_s.index = pd.to_datetime(regime_s.index)
    if not isinstance(z_spread_smoothed.index, pd.DatetimeIndex):
        z_spread_smoothed.index = pd.to_datetime(z_spread_smoothed.index)

    regime_s = regime_s.sort_index()
    z_spread_smoothed = z_spread_smoothed.sort_index()

    today = regime_s.index.max()
    z_today = float(z_spread_smoothed.loc[today])

    # Yesterday's z-spread for change calculation
    yday_idx = z_spread_smoothed.index.get_loc(today) - 1
    z_yday = float(z_spread_smoothed.iloc[yday_idx])
    z_change = z_today - z_yday

    # Current signal (what z-spread says right now)
    signal_regime = regime_s.loc[today]
    signal_regime_str = "bullish" if str(signal_regime).lower().startswith("bull") else "bearish"

    # Build intraday update data (signal only, not official regime)
    data = {
        "signal_regime": signal_regime_str,
        "regime_strength": round(z_today, 4),
        "strength_change": round(z_change, 4),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }

    # Update existing row
    existing = supabase.table("regime_status").select("id").limit(1).execute()

    if existing.data:
        result = supabase.table("regime_status").update(data).eq("id", existing.data[0]["id"]).execute()
    else:
        # Insert new row (shouldn't happen in normal operation)
        data["current_regime"] = signal_regime_str  # Initialize both to same value
        result = supabase.table("regime_status").insert(data).execute()

    print(f"Updated intraday signal: {signal_regime_str}, strength: {z_today:.3f}")
    return result.data[0] if result.data else data


def update_regime_status(
    regime_s: pd.Series,
    z_spread_smoothed: pd.Series,
    supabase: Client = None,
    tqqq_prices: pd.Series = None,
    gld_prices: pd.Series = None
) -> dict:
    """
    Update full regime status in Supabase (for market close updates).

    Updates both signal_regime AND current_regime, plus trade stats and history.
    Call this at market close (4pm ET) to officially flip regimes.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values
        supabase: Optional Supabase client (will create one if not provided)
        tqqq_prices: Optional Series of TQQQ close prices (will fetch if not provided)
        gld_prices: Optional Series of GLD close prices (will fetch if not provided)

    Returns:
        The updated record
    """
    if supabase is None:
        supabase = get_supabase_client()

    # Ensure datetime index
    if not isinstance(regime_s.index, pd.DatetimeIndex):
        regime_s.index = pd.to_datetime(regime_s.index)
    if not isinstance(z_spread_smoothed.index, pd.DatetimeIndex):
        z_spread_smoothed.index = pd.to_datetime(z_spread_smoothed.index)

    regime_s = regime_s.sort_index()
    z_spread_smoothed = z_spread_smoothed.sort_index()

    today = regime_s.index.max()
    z_today = float(z_spread_smoothed.loc[today])

    # Yesterday's z-spread for change calculation
    yday_idx = z_spread_smoothed.index.get_loc(today) - 1
    z_yday = float(z_spread_smoothed.iloc[yday_idx])
    z_change = z_today - z_yday

    # Current regime
    current_regime = regime_s.loc[today]
    current_regime_str = "bullish" if str(current_regime).lower().startswith("bull") else "bearish"

    # Fetch price data for return calculations if not provided
    if tqqq_prices is None or gld_prices is None:
        try:
            from stocks_simple import Stocks
            stocks = Stocks()
            tqqq_df = stocks.ohlc("TQQQ")
            gld_df = stocks.ohlc("GLD")
            tqqq_prices = tqqq_df.set_index('date')['close']
            gld_prices = gld_df.set_index('date')['close']
        except Exception as e:
            print(f"Warning: Could not fetch price data for returns: {e}")
            tqqq_prices = None
            gld_prices = None

    # Calculate regime periods and stats
    regime_history = calculate_regime_periods(regime_s, tqqq_prices, gld_prices)
    stats = calculate_regime_stats(regime_history)

    # Get current trade info (first period is current/most recent)
    current_trade_return = None
    current_trade_start = None
    current_trade_entry_price = None
    if regime_history and "returnPct" in regime_history[0]:
        current_trade_return = regime_history[0]["returnPct"]
        current_trade_start = regime_history[0]["startDate"]

        # Get entry price for live calculations
        if tqqq_prices is not None and gld_prices is not None:
            prices = tqqq_prices if current_regime_str == "bullish" else gld_prices
            start_date = pd.to_datetime(current_trade_start)
            try:
                current_trade_entry_price = float(prices.loc[start_date])
            except KeyError:
                # Find nearest date
                idx = prices.index.get_indexer([start_date], method='nearest')[0]
                current_trade_entry_price = float(prices.iloc[idx])

    # Build update data (at close, signal and current regime are the same)
    data = {
        "current_regime": current_regime_str,
        "signal_regime": current_regime_str,  # At close, signal matches official
        "regime_strength": round(z_today, 4),
        "strength_change": round(z_change, 4),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "days_in_current_regime": stats["days_in_current_regime"],
        "regime_changes_this_year": stats["regime_changes_this_year"],
        "avg_regime_duration_days": stats["avg_regime_duration_days"],
        "regime_history": regime_history,
        "current_trade_return": current_trade_return,
        "current_trade_start": current_trade_start,
        "current_trade_entry_price": current_trade_entry_price,
    }

    # Check if row exists
    existing = supabase.table("regime_status").select("id").limit(1).execute()

    if existing.data:
        # Update existing row
        result = supabase.table("regime_status").update(data).eq("id", existing.data[0]["id"]).execute()
    else:
        # Insert new row
        result = supabase.table("regime_status").insert(data).execute()

    print(f"Updated regime status: {current_regime_str}, strength: {z_today:.3f}")
    return result.data[0] if result.data else data


def upload_speedometer(
    image_path: str,
    supabase: Client = None
) -> str:
    """
    Upload speedometer image to Supabase Storage.

    Args:
        image_path: Path to the PNG file
        supabase: Optional Supabase client

    Returns:
        Public URL of the uploaded image
    """
    if supabase is None:
        supabase = get_supabase_client()

    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    # Read image bytes
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    # Upload to storage (overwrite if exists)
    bucket_name = "regime-assets"
    file_name = "speedometer.png"

    # Try to upload (will create bucket if needed via Supabase dashboard)
    try:
        supabase.storage.from_(bucket_name).upload(
            file_name,
            image_bytes,
            file_options={"content-type": "image/png", "upsert": "true"}
        )
    except Exception as e:
        # If file exists, try to update
        if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
            supabase.storage.from_(bucket_name).update(
                file_name,
                image_bytes,
                file_options={"content-type": "image/png"}
            )
        else:
            raise

    # Get public URL
    public_url = supabase.storage.from_(bucket_name).get_public_url(file_name)

    # Update the regime_status table with the URL
    existing = supabase.table("regime_status").select("id").limit(1).execute()
    if existing.data:
        supabase.table("regime_status").update({
            "speedometer_url": public_url
        }).eq("id", existing.data[0]["id"]).execute()

    print(f"Uploaded speedometer to: {public_url}")
    return public_url


# Convenience function for notebooks / close updates
def update_all(regime_s, z_spread_smoothed, speedometer_path=None):
    """
    Update full regime status and speedometer (for market close).

    Updates both signal_regime and current_regime, plus trade stats and history.
    Call this at market close (4pm ET) to officially flip regimes.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values
        speedometer_path: Optional path to speedometer PNG
    """
    supabase = get_supabase_client()

    # Update regime data (full update including current_regime)
    update_regime_status(regime_s, z_spread_smoothed, supabase)

    # Upload speedometer if provided
    if speedometer_path:
        upload_speedometer(speedometer_path, supabase)

    print("Done! (close update)")


# Convenience function for intraday updates
def update_intraday_all(regime_s, z_spread_smoothed, speedometer_path=None):
    """
    Update intraday signal and speedometer only (for 10-min market hour updates).

    Only updates signal_regime, regime_strength, and speedometer.
    Does NOT update current_regime, trade stats, or regime_history.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values
        speedometer_path: Optional path to speedometer PNG
    """
    supabase = get_supabase_client()

    # Update intraday signal only
    update_intraday(regime_s, z_spread_smoothed, supabase)

    # Upload speedometer if provided
    if speedometer_path:
        upload_speedometer(speedometer_path, supabase)

    print("Done! (intraday update)")

    print("Done!")
