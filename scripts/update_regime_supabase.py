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
from datetime import datetime, timedelta
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


def calculate_regime_periods(regime_s: pd.Series) -> list[dict]:
    """Convert a regime Series into a list of regime periods."""
    regime_s = regime_s.dropna().sort_index()

    periods = []
    current_regime = None
    period_start = None

    for date, regime in regime_s.items():
        regime_str = "bullish" if str(regime).lower().startswith("bull") else "bearish"

        if regime_str != current_regime:
            if current_regime is not None:
                periods.append({
                    "regime": current_regime,
                    "startDate": period_start.strftime("%Y-%m-%d"),
                    "endDate": (date - timedelta(days=1)).strftime("%Y-%m-%d"),
                    "durationDays": (date - period_start).days,
                })
            current_regime = regime_str
            period_start = date

    # Add current (open) period
    if current_regime is not None:
        today = regime_s.index.max()
        periods.append({
            "regime": current_regime,
            "startDate": period_start.strftime("%Y-%m-%d"),
            "endDate": None,
            "durationDays": (today - period_start).days + 1,
        })

    return periods[-10:][::-1]  # Last 10, most recent first


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


def update_regime_status(
    regime_s: pd.Series,
    z_spread_smoothed: pd.Series,
    supabase: Client = None
) -> dict:
    """
    Update regime status in Supabase.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values
        supabase: Optional Supabase client (will create one if not provided)

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

    # Calculate regime periods and stats
    regime_history = calculate_regime_periods(regime_s)
    stats = calculate_regime_stats(regime_history)

    # Build update data
    data = {
        "current_regime": current_regime_str,
        "regime_strength": round(z_today, 4),
        "strength_change": round(z_change, 4),
        "last_updated": datetime.now().isoformat(),
        "days_in_current_regime": stats["days_in_current_regime"],
        "regime_changes_this_year": stats["regime_changes_this_year"],
        "avg_regime_duration_days": stats["avg_regime_duration_days"],
        "regime_history": regime_history,
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


# Convenience function for notebooks
def update_all(regime_s, z_spread_smoothed, speedometer_path=None):
    """
    Update both regime status and speedometer in one call.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values
        speedometer_path: Optional path to speedometer PNG
    """
    supabase = get_supabase_client()

    # Update regime data
    update_regime_status(regime_s, z_spread_smoothed, supabase)

    # Upload speedometer if provided
    if speedometer_path:
        upload_speedometer(speedometer_path, supabase)

    print("Done!")
