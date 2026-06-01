#!/usr/bin/env python3
"""
Test script to verify the current trade return calculation from track record.
"""

import os
import sys
from pathlib import Path

# Load environment variables first
from dotenv import load_dotenv
env_local = Path(__file__).parent.parent / ".env.local"
if env_local.exists():
    load_dotenv(env_local)
    print(f"Loaded environment from: {env_local}")

# Add parent directory to path to import update_regime_supabase
sys.path.insert(0, str(Path(__file__).parent))

from update_regime_supabase import get_current_trade_return_from_track_record, get_supabase_client

def main():
    print("Testing current trade return calculation from track record...")
    print("-" * 60)

    try:
        # Get Supabase client
        supabase = get_supabase_client()
        print("✓ Connected to Supabase")

        # Fetch current trade return
        return_pct, date_in, entry_price = get_current_trade_return_from_track_record(supabase)

        if return_pct is not None:
            print(f"\n✓ Successfully fetched current trade return:")
            print(f"  Return: {return_pct:.2f}%")
            print(f"  Date In: {date_in}")
            print(f"  Entry Price: {entry_price}")
        else:
            print("\n✗ Failed to fetch current trade return")
            print("  Check that track_record table has trades_history data")

        # Also fetch the raw data to inspect
        print("\n" + "-" * 60)
        print("Raw trades_history data:")
        result = supabase.table("track_record").select("trades_history").limit(1).single().execute()

        if result.data and "trades_history" in result.data:
            trades = result.data["trades_history"]
            print(f"\nTotal trades: {len(trades)}")

            if trades:
                # Show last 2 trades
                print("\nLast closed trade:")
                if len(trades) >= 2:
                    prev_trade = trades[-2]
                    print(f"  Date Out: {prev_trade.get('date_out')}")
                    print(f"  Realized P&L: ${prev_trade.get('realized_pnl', 0):,.2f}")
                    print(f"  Equity: ${prev_trade.get('equity', 0):,.2f}")

                print("\nCurrent open trade:")
                current_trade = trades[-1]
                print(f"  Date In: {current_trade.get('date_in')}")
                print(f"  Entry Price: {current_trade.get('entry_price')}")
                print(f"  Unrealized P&L: ${current_trade.get('unrealized_pnl', 0):,.2f}")

                # Calculate return manually to verify
                unrealized_pnl = current_trade.get('unrealized_pnl', 0)
                starting_equity = trades[-2].get('equity', 250000) if len(trades) >= 2 else 250000
                manual_return = (unrealized_pnl / starting_equity) * 100

                print(f"\nManual calculation:")
                print(f"  Unrealized P&L: ${unrealized_pnl:,.2f}")
                print(f"  Starting Equity: ${starting_equity:,.2f}")
                print(f"  Return: {manual_return:.2f}%")
        else:
            print("No trades_history data found")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
