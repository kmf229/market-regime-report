#!/usr/bin/env python3
"""Check benchmark_prices table"""
import sys
sys.path.insert(0, '/home/kmf229/market-regime')

from update_regime_supabase import get_supabase_client

supabase = get_supabase_client()

# Get trade start date
regime = supabase.table('regime_status').select('current_trade_start').limit(1).single().execute()
trade_start = regime.data.get('current_trade_start') if regime.data else None

# Get recent SPY benchmark prices
result = supabase.table('benchmark_prices').select('*').eq('ticker', 'SPY').order('date', desc=True).limit(10).execute()

if result.data:
    print('Recent SPY benchmark_prices:')
    for row in result.data:
        marker = ' <- TRADE START' if row['date'] == trade_start else ''
        print(f'  {row["date"]}: ${row["close"]:.2f}{marker}')

    # Calculate return using benchmark_prices (OLD METHOD)
    if len(result.data) >= 2 and trade_start:
        # Find trade start price
        start_price = None
        for row in result.data:
            if row['date'] == trade_start:
                start_price = row['close']
                break

        if start_price:
            latest_price = result.data[0]['close']
            old_return = ((latest_price - start_price) / start_price) * 100
            print(f'\n  OLD METHOD (benchmark_prices): {old_return:.2f}%')
            print(f'    Start: ${start_price:.2f}, Latest: ${latest_price:.2f}')
else:
    print('No benchmark_prices data')
