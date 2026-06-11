#!/usr/bin/env python3
"""Check current database values"""
import sys
sys.path.insert(0, '/home/kmf229/market-regime')

from update_regime_supabase import get_supabase_client

supabase = get_supabase_client()

# Get current regime_status
result = supabase.table('regime_status').select('*').limit(1).single().execute()

if result.data:
    data = result.data
    print('Current regime_status in database:')
    print(f'  current_regime: {data.get("current_regime")}')
    print(f'  regime_strength: {data.get("regime_strength")}')
    print(f'  current_trade_return: {data.get("current_trade_return")}%')
    print(f'  current_trade_entry_price: ${data.get("current_trade_entry_price"):,.2f}')

    spy_current = data.get("spy_current_price")
    spy_start = data.get("spy_trade_start_price")

    if spy_current is not None:
        print(f'  spy_current_price: ${spy_current:.2f}')
    else:
        print(f'  spy_current_price: NULL (column exists but no value)')

    if spy_start is not None:
        print(f'  spy_trade_start_price: ${spy_start:.2f}')
    else:
        print(f'  spy_trade_start_price: NULL (column exists but no value)')

    print(f'  last_updated: {data.get("last_updated")}')

    # Calculate SPY return if available
    if spy_current and spy_start:
        spy_return = ((spy_current - spy_start) / spy_start) * 100
        print(f'\n  SPY return (calculated): {spy_return:.2f}%')

else:
    print('No regime_status data found')
