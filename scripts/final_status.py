#!/usr/bin/env python3
import sys
sys.path.insert(0, '/home/kmf229/market-regime')
from update_regime_supabase import get_supabase_client

supabase = get_supabase_client()

regime = supabase.table('regime_status').select('*').limit(1).single().execute().data
spy_today = supabase.table('benchmark_prices').select('*').eq('ticker', 'SPY').eq('date', '2026-06-11').execute().data

print('=' * 60)
print('CURRENT STATUS')
print('=' * 60)
print('\nREAL-TIME DATA (regime_status - updates every 10 min):')
print(f'  SPY Current: ${regime.get("spy_current_price") or "NULL"}')
print(f'  SPY Start: ${regime.get("spy_trade_start_price") or "NULL"}')
if regime.get("spy_current_price") and regime.get("spy_trade_start_price"):
    spy_rt = ((regime["spy_current_price"] - regime["spy_trade_start_price"]) / regime["spy_trade_start_price"]) * 100
    print(f'  SPY Return (REAL-TIME): {spy_rt:.2f}%')

print('\nDAILY CLOSE DATA (benchmark_prices - updated at 8:05am):')
if spy_today:
    print(f'  SPY Close: ${spy_today[0]["close"]:.2f}')
    trade_start = regime.get("spy_trade_start_price") or 686.10
    spy_daily = ((spy_today[0]["close"] - trade_start) / trade_start) * 100
    print(f'  SPY Return (DAILY): {spy_daily:.2f}%')

print('\nSTRATEGY:')
print(f'  NQ Return: {regime.get("current_trade_return")}%')
print(f'  Entry: ${regime.get("current_trade_entry_price"):,.2f}')

print('\n' + '=' * 60)
print('The frontend should show the REAL-TIME SPY return')
print('once Vercel deployment completes.')
print('=' * 60)
