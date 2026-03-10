"""
One-time migration script to load existing track record data into Supabase.

Run this once after creating the track_record table to populate it
with your current JSON files.

Usage:
    python migrate_track_record.py
"""

import os
import json
from pathlib import Path
from datetime import datetime, timezone

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase: pip install supabase")
    raise

try:
    from dotenv import load_dotenv
    # Try .env in same directory, then .env.local in parent
    env_file = Path(__file__).parent / ".env"
    env_local = Path(__file__).parent.parent / ".env.local"
    if env_file.exists():
        load_dotenv(env_file)
    elif env_local.exists():
        load_dotenv(env_local)
except ImportError:
    pass


def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        raise ValueError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables."
        )

    return create_client(url, key)


def migrate_track_record():
    """Migrate existing JSON data to Supabase."""
    print("=" * 50)
    print("Migrating Track Record to Supabase")
    print("=" * 50)

    # Paths to existing files
    base_dir = Path(__file__).parent.parent
    summary_path = base_dir / "public" / "track_record" / "summary.json"
    monthly_path = base_dir / "public" / "track_record" / "monthly_returns.json"

    if not summary_path.exists():
        print(f"Error: summary.json not found at {summary_path}")
        return

    # Load existing data
    with open(summary_path) as f:
        summary = json.load(f)
    print(f"Loaded summary.json: {summary['start_date']} to {summary['data_through']}")

    monthly_returns = {"columns": [], "rows": []}
    if monthly_path.exists():
        with open(monthly_path) as f:
            monthly_returns = json.load(f)
        print(f"Loaded monthly_returns.json: {len(monthly_returns['rows'])} years")

    # Build update data
    data = {
        "start_date": summary["start_date"],
        "data_through": summary["data_through"],
        "strategy_length_days": summary["strategy_length_days"],
        "strategy_length_years": summary["strategy_length_years"],
        "cumulative_return": summary["cumulative_return"],
        "cagr": summary["cagr"],
        "max_drawdown": summary["max_drawdown"],
        "sharpe_ratio": summary.get("sharpe_ratio"),
        "avg_monthly_return": summary.get("avg_monthly_return"),
        "best_month_return": summary.get("best_month_return"),
        "best_month_label": summary.get("best_month_label"),
        "worst_month_return": summary.get("worst_month_return"),
        "worst_month_label": summary.get("worst_month_label"),
        "up_months_pct": summary.get("up_months_pct"),
        "monthly_returns": monthly_returns,
        "daily_history": [],  # Will be populated on first Pi update
        "equity_curve_url": None,  # Will be set on first Pi update
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }

    supabase = get_supabase_client()

    # Check if row exists
    existing = supabase.table("track_record").select("id").limit(1).execute()

    if existing.data:
        result = supabase.table("track_record").update(data).eq("id", existing.data[0]["id"]).execute()
        print("Updated existing track_record row")
    else:
        result = supabase.table("track_record").insert(data).execute()
        print("Inserted new track_record row")

    print("=" * 50)
    print("Migration complete!")
    print(f"Cumulative return: {summary['cumulative_return']*100:.2f}%")
    print(f"CAGR: {summary['cagr']*100:.2f}%")
    print("=" * 50)


if __name__ == "__main__":
    migrate_track_record()
