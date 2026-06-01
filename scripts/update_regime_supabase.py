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


def calculate_regime_periods(regime_s: pd.Series, nq_prices: pd.Series = None, gc_prices: pd.Series = None) -> list[dict]:
    """Convert a regime Series into a list of regime periods with returns.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        nq_prices: Series of NQ futures close prices indexed by date (optional)
        gc_prices: Series of GC futures close prices indexed by date (optional)

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
                if nq_prices is not None and gc_prices is not None:
                    period["returnPct"] = _calculate_period_return(
                        current_regime, period_start, end_date, nq_prices, gc_prices
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
        if nq_prices is not None and gc_prices is not None:
            period["returnPct"] = _calculate_period_return(
                current_regime, period_start, today, nq_prices, gc_prices
            )
        periods.append(period)

    return periods[-30:][::-1]  # Last 30, most recent first (enough to cover 12+ months)


def _calculate_period_return(regime: str, start_date, end_date, nq_prices: pd.Series, gc_prices: pd.Series) -> float:
    """Calculate the return for a regime period.

    Logic:
    - Bullish: holding NQ futures, return = (end_price - start_price) / start_price
    - Bearish: holding GC futures, return = (end_price - start_price) / start_price

    The start_date is the day we entered the position (buy at close).
    The end_date is the day we exited the position (sell at close).
    """
    prices = nq_prices if regime == "bullish" else gc_prices

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


def calculate_live_trade_return(supabase: Client, nq_prices: pd.Series = None, gc_prices: pd.Series = None) -> tuple[float, str, float] | tuple[None, None, None]:
    """
    Calculate current trade return using live futures prices.

    This is for intraday updates where we need real-time P&L.
    Uses the same logic as get_current_trade_return_from_track_record() but with live prices.

    Args:
        supabase: Supabase client
        nq_prices: Optional Series of NQ futures close prices (will fetch if not provided)
        gc_prices: Optional Series of GC futures close prices (will fetch if not provided)

    Returns:
        Tuple of (return_pct, date_in, entry_price) or (None, None, None) if not available
    """
    try:
        # Get current regime and trade info
        regime_result = supabase.table("regime_status").select("current_regime, current_trade_start, current_trade_entry_price").limit(1).single().execute()

        if not regime_result.data:
            print("Warning: No regime_status data")
            return (None, None, None)

        current_regime = regime_result.data.get("current_regime")
        date_in = regime_result.data.get("current_trade_start")
        entry_price = regime_result.data.get("current_trade_entry_price")

        if not all([current_regime, date_in, entry_price]):
            print("Warning: Missing trade info in regime_status")
            return (None, None, None)

        # Get starting equity from track record daily_history
        track_result = supabase.table("track_record").select("daily_history").limit(1).single().execute()

        if not track_result.data or not track_result.data.get("daily_history"):
            print("Warning: No daily_history in track_record")
            return (None, None, None)

        daily_history = track_result.data["daily_history"]

        # Find starting equity (day before entry or start_equity on entry day)
        equity_by_date = {row["date"]: row for row in daily_history}
        entry_date = pd.to_datetime(date_in)
        prev_date = (entry_date - pd.Timedelta(days=1)).strftime("%Y-%m-%d")

        if prev_date in equity_by_date:
            starting_equity = equity_by_date[prev_date]["end_equity"]
        elif date_in in equity_by_date:
            starting_equity = equity_by_date[date_in]["start_equity"]
        else:
            print(f"Warning: Could not find starting equity for {date_in}")
            return (None, None, None)

        # Fetch current futures prices if not provided
        if nq_prices is None or gc_prices is None:
            try:
                from stocks_simple import Stocks
                stocks = Stocks()
                nq_contract = stocks.get_front_month_contract("NQ")
                gc_contract = stocks.get_front_month_contract("GC")
                nq_df = stocks.ohlc_futures(nq_contract)
                gc_df = stocks.ohlc_futures(gc_contract)
                nq_prices = nq_df.set_index('date')['close']
                gc_prices = gc_df.set_index('date')['close']
            except Exception as e:
                print(f"Warning: Could not fetch futures prices: {e}")
                return (None, None, None)

        # Get current price
        prices = nq_prices if current_regime == "bullish" else gc_prices
        today = prices.index.max()
        current_price = float(prices.loc[today])

        # Calculate unrealized P&L
        # For micro futures: MNQ multiplier = 2, MGC multiplier = 10
        # Assuming 1 contract (real account size, not 10x scaled)
        multiplier = 2.0 if current_regime == "bullish" else 1.0  # MNQ=2, 1OZ=1

        point_change = current_price - entry_price
        unrealized_pnl = point_change * multiplier  # 1 contract

        # Calculate return
        return_pct = (unrealized_pnl / starting_equity) * 100

        print(f"Live trade return: {return_pct:.2f}% (current: ${current_price:,.2f}, entry: ${entry_price:,.2f}, unrealized P&L: ${unrealized_pnl:,.2f}, equity: ${starting_equity:,.2f})")

        return (round(return_pct, 2), date_in, entry_price)

    except Exception as e:
        print(f"Warning: Could not calculate live trade return: {e}")
        import traceback
        traceback.print_exc()
        return (None, None, None)


def update_intraday(
    regime_s: pd.Series,
    z_spread_smoothed: pd.Series,
    supabase: Client = None,
    nq_prices: pd.Series = None,
    gc_prices: pd.Series = None
) -> dict:
    """
    Update intraday regime signal data in Supabase.

    Updates signal_regime, regime_strength, strength_change, current_trade_return, and last_updated.
    Does NOT update current_regime, trade stats, or regime_history (those only change at close).

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values
        supabase: Optional Supabase client
        nq_prices: Optional Series of NQ futures close prices (will fetch if not provided)
        gc_prices: Optional Series of GC futures close prices (will fetch if not provided)

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

    # Calculate live trade return (intraday)
    live_return, _, _ = calculate_live_trade_return(supabase, nq_prices, gc_prices)

    # Build intraday update data (signal only, not official regime)
    data = {
        "signal_regime": signal_regime_str,
        "regime_strength": round(z_today, 4),
        "strength_change": round(z_change, 4),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }

    # Add current trade return if available
    if live_return is not None:
        data["current_trade_return"] = live_return

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


def get_current_trade_return_from_track_record(supabase: Client = None) -> tuple[float, str, float] | tuple[None, None, None]:
    """
    Get the current trade return from the track record database.

    Uses actual account equity and unrealized P&L to calculate the return.
    This accounts for deposits/withdrawals and interest, not just trading P&L.

    Args:
        supabase: Optional Supabase client

    Returns:
        Tuple of (return_pct, date_in, entry_price) or (None, None, None) if not available
    """
    if supabase is None:
        supabase = get_supabase_client()

    try:
        # Fetch trades_history and daily_history from track_record table
        result = supabase.table("track_record").select("trades_history, daily_history").limit(1).single().execute()

        if not result.data:
            print("Warning: No data found in track_record")
            return (None, None, None)

        trades = result.data.get("trades_history", [])
        daily_history = result.data.get("daily_history", [])

        if not trades:
            print("Warning: trades_history is empty")
            return (None, None, None)

        # Last trade should be the current open trade
        pending = trades[-1]

        # Get unrealized P&L
        unrealized_pnl = pending.get("unrealized_pnl")

        if unrealized_pnl is None:
            print("Warning: No unrealized_pnl in current trade")
            return (None, None, None)

        # Get the date when current trade started
        date_in = pending.get("date_in")

        if not date_in:
            print("Warning: No date_in for current trade")
            return (None, None, None)

        # Find the equity from the day before the trade started
        # (or the start_equity on the trade entry day)
        if daily_history:
            # Convert daily_history to a dict keyed by date for easy lookup
            equity_by_date = {row["date"]: row for row in daily_history}

            # Get the day before entry, or the start_equity on entry day
            entry_date = pd.to_datetime(date_in)
            prev_date = (entry_date - pd.Timedelta(days=1)).strftime("%Y-%m-%d")

            # Try to find equity from the day before
            if prev_date in equity_by_date:
                starting_equity = equity_by_date[prev_date]["end_equity"]
            elif date_in in equity_by_date:
                # Use start_equity on entry day
                starting_equity = equity_by_date[date_in]["start_equity"]
            else:
                print(f"Warning: Could not find equity for date {date_in} in daily_history")
                starting_equity = None
        else:
            print("Warning: No daily_history found")
            starting_equity = None

        # Fallback: use equity from trades if daily_history unavailable
        if starting_equity is None:
            print("Warning: Falling back to trades-based equity (may not account for deposits/withdrawals)")
            if len(trades) >= 2:
                # Equity after previous trade (scaled 10x, so divide by 10)
                starting_equity = trades[-2].get("equity", 250000) / 10
            else:
                starting_equity = 25000  # Initial real capital

        # Account for 10x scaling in trades data
        # The unrealized_pnl is already scaled (from trades_history)
        # But daily_history equity is the real account equity (not scaled)
        # So we need to divide unrealized_pnl by 10 to match
        unrealized_pnl_real = unrealized_pnl / 10

        # Calculate return as percentage
        return_pct = (unrealized_pnl_real / starting_equity) * 100

        # Get trade metadata
        entry_price = pending.get("entry_price")

        print(f"Track record return: {return_pct:.2f}% (unrealized P&L: ${unrealized_pnl_real:,.2f}, starting equity: ${starting_equity:,.2f})")

        return (round(return_pct, 2), date_in, entry_price)

    except Exception as e:
        print(f"Warning: Could not fetch current trade return from track record: {e}")
        import traceback
        traceback.print_exc()
        return (None, None, None)


def update_regime_status(
    regime_s: pd.Series,
    z_spread_smoothed: pd.Series,
    supabase: Client = None,
    nq_prices: pd.Series = None,
    gc_prices: pd.Series = None
) -> dict:
    """
    Update full regime status in Supabase (for market close updates).

    Updates both signal_regime AND current_regime, plus trade stats and history.
    Call this at market close (4pm ET) to officially flip regimes.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values
        supabase: Optional Supabase client (will create one if not provided)
        nq_prices: Optional Series of NQ futures close prices (will fetch if not provided)
        gc_prices: Optional Series of GC futures close prices (will fetch if not provided)

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
    if nq_prices is None or gc_prices is None:
        try:
            from stocks_simple import Stocks
            stocks = Stocks()
            # Get front month contract symbols for NQ and GC
            nq_contract = stocks.get_front_month_contract("NQ")
            gc_contract = stocks.get_front_month_contract("GC")
            # Fetch futures data
            nq_df = stocks.ohlc_futures(nq_contract)
            gc_df = stocks.ohlc_futures(gc_contract)
            nq_prices = nq_df.set_index('date')['close']
            gc_prices = gc_df.set_index('date')['close']
        except Exception as e:
            print(f"Warning: Could not fetch futures prices: {e}")
            nq_prices = None
            gc_prices = None

    # Calculate regime periods and stats
    regime_history = calculate_regime_periods(regime_s, nq_prices, gc_prices)
    stats = calculate_regime_stats(regime_history)

    # Get current trade info from track record (uses actual P&L data)
    current_trade_return, current_trade_start, current_trade_entry_price = get_current_trade_return_from_track_record(supabase)

    # Fallback to price-based calculation if track record not available
    if current_trade_return is None and regime_history and "returnPct" in regime_history[0]:
        print("Warning: Using fallback price-based calculation for current trade return")
        current_trade_return = regime_history[0]["returnPct"]
        current_trade_start = regime_history[0]["startDate"]

        # Get entry price for live calculations
        if nq_prices is not None and gc_prices is not None:
            prices = nq_prices if current_regime_str == "bullish" else gc_prices
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


def save_daily_strength_history(
    regime_s: pd.Series,
    z_spread_smoothed: pd.Series,
    supabase: Client = None
) -> None:
    """
    Save today's regime strength to the regime_strength_history table.

    This should be called once per day at market close to build the historical
    dataset for the Regime Strength History Chart.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values
        supabase: Optional Supabase client
    """
    if supabase is None:
        supabase = get_supabase_client()

    # Get today's date and values
    today = regime_s.index.max()
    z_today = float(z_spread_smoothed.loc[today])
    regime_today = regime_s.loc[today]
    regime_str = "bullish" if str(regime_today).lower().startswith("bull") else "bearish"

    # Insert or update today's strength value
    data = {
        "date": today.strftime("%Y-%m-%d"),
        "regime_strength": round(z_today, 4),
        "regime": regime_str,
    }

    try:
        # Try to insert (will fail if date already exists due to UNIQUE constraint)
        supabase.table("regime_strength_history").insert(data).execute()
        print(f"Saved regime strength history for {today.strftime('%Y-%m-%d')}: {z_today:.3f}")
    except Exception as e:
        # If date exists, update it
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            supabase.table("regime_strength_history").update({
                "regime_strength": data["regime_strength"],
                "regime": data["regime"]
            }).eq("date", data["date"]).execute()
            print(f"Updated regime strength history for {today.strftime('%Y-%m-%d')}: {z_today:.3f}")
        else:
            print(f"Warning: Could not save regime strength history: {e}")


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

    # Save daily regime strength to history table
    save_daily_strength_history(regime_s, z_spread_smoothed, supabase)

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
