#!/usr/bin/env python3
"""Test script for SPY price tracking in intraday updates."""

import sys
sys.path.insert(0, '/home/kmf229/market-regime')

from update_regime_supabase import update_intraday, get_supabase_client
import pandas as pd
from datetime import datetime

# Create mock regime data for testing
dates = pd.date_range(end=datetime.now(), periods=50)
regime_s = pd.Series(['Bullish'] * 50, index=dates)
z_spread = pd.Series([0.5] * 50, index=dates)

print('Testing update_intraday with graceful SPY handling...')
supabase = get_supabase_client()

try:
    result = update_intraday(regime_s, z_spread, supabase)
    print('✓ Intraday update successful!')
    print(f'   Signal regime: {result.get("signal_regime")}')
    print(f'   Regime strength: {result.get("regime_strength")}')
    if 'spy_current_price' in result:
        print(f'   SPY current: ${result.get("spy_current_price"):.2f}')
        print(f'   SPY start: ${result.get("spy_trade_start_price"):.2f}')
    else:
        print('   SPY prices: Not stored (columns do not exist yet)')
except Exception as e:
    print(f'✗ Error during update: {e}')
    import traceback
    traceback.print_exc()
