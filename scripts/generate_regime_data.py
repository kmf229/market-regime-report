"""
Add this to your daily dashboard script to generate regime-data.json
for the website's Current Regime page.

Usage: Call `save_regime_data(regime_s, z_spread_smoothed)` after your existing
regime calculations.
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd
import numpy as np

BULLISH_THRESHOLD = 0.25


def calculate_regime_periods(regime_s: pd.Series) -> list[dict]:
    """
    Convert a regime Series into a list of regime periods.
    Returns most recent periods first.
    """
    regime_s = regime_s.dropna().sort_index()

    periods = []
    current_regime = None
    period_start = None

    for date, regime in regime_s.items():
        regime_str = "bullish" if str(regime).lower().startswith("bull") else "bearish"

        if regime_str != current_regime:
            # Close previous period
            if current_regime is not None:
                periods.append({
                    "regime": current_regime,
                    "startDate": period_start.strftime("%Y-%m-%d"),
                    "endDate": (date - timedelta(days=1)).strftime("%Y-%m-%d"),
                    "durationDays": (date - period_start).days,
                })
            # Start new period
            current_regime = regime_str
            period_start = date

    # Add current (open) period
    if current_regime is not None:
        today = regime_s.index.max()
        periods.append({
            "regime": current_regime,
            "startDate": period_start.strftime("%Y-%m-%d"),
            "endDate": None,  # Current period is open
            "durationDays": (today - period_start).days + 1,
        })

    # Return most recent first, limit to last 12 months (~10 periods)
    return periods[-10:][::-1]


def calculate_regime_stats(regime_s: pd.Series, regime_history: list[dict]) -> dict:
    """Calculate regime statistics."""
    # Days in current regime
    days_in_current = regime_history[0]["durationDays"] if regime_history else 0

    # Regime changes this year
    current_year = datetime.now().year
    changes_this_year = sum(
        1 for p in regime_history
        if datetime.strptime(p["startDate"], "%Y-%m-%d").year == current_year
    )

    # Average duration
    completed_periods = [p for p in regime_history if p["endDate"] is not None]
    avg_duration = int(np.mean([p["durationDays"] for p in completed_periods])) if completed_periods else 0

    return {
        "daysInCurrentRegime": days_in_current,
        "regimeChangesThisYear": changes_this_year,
        "avgRegimeDurationDays": avg_duration,
    }


def save_regime_data(
    regime_s: pd.Series,
    z_spread_smoothed: pd.Series,
    output_path: str = "website/public/data/regime-data.json"
):
    """
    Generate regime-data.json for the website.

    Args:
        regime_s: Series with 'Bullish'/'Bearish' values indexed by date
        z_spread_smoothed: Series with smoothed z-spread values
        output_path: Path to save the JSON file
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

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

    # Calculate regime periods
    regime_history = calculate_regime_periods(regime_s)

    # Calculate stats
    stats = calculate_regime_stats(regime_s, regime_history)

    # Build output data
    data = {
        "currentRegime": current_regime_str,
        "regimeStrength": round(z_today, 3),
        "strengthChange": round(z_change, 3),
        "lastUpdated": today.strftime("%Y-%m-%d"),
        **stats,
        "regimeHistory": regime_history,
    }

    # Save to file
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Saved regime data to {output_path}")
    return data


# Example usage (add to your existing script):
# save_regime_data(regime_s, z_spread_smoothed)
