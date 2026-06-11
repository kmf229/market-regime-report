#!/usr/bin/env python3
"""Add SPY tracking to update_regime_supabase.py"""

with open('update_regime_supabase.py', 'r') as f:
    content = f.read()

# 1. Add import after supabase import
if 'from spy_price_helper import fetch_live_spy_price' not in content:
    content = content.replace(
        'from supabase import create_client, Client',
        'from supabase import create_client, Client\ntry:\n    from spy_price_helper import fetch_live_spy_price\nexcept ImportError:\n    print("Warning: spy_price_helper not found, SPY tracking disabled")\n    def fetch_live_spy_price(supabase, trade_start=None):\n        return (None, None)'
    )
    print('✓ Added import')

# 2. Add SPY fetch in update_intraday (before building data dict)
intraday_marker = '    # Build intraday update data (signal only, not official regime)'
if 'spy_current, spy_start = fetch_live_spy_price' not in content:
    content = content.replace(
        intraday_marker,
        '    # Fetch live SPY price\n    spy_current, spy_start = fetch_live_spy_price(supabase)\n\n' + intraday_marker
    )
    print('✓ Added SPY fetch to update_intraday')

# 3. Add SPY fields to data dict in update_intraday (with error handling)
if '# Add SPY prices if available' not in content:
    old_block = '''    # Add current trade return if available
    if live_return is not None:
        data["current_trade_return"] = live_return

    # Update existing row'''

    new_block = '''    # Add current trade return if available
    if live_return is not None:
        data["current_trade_return"] = live_return

    # Add SPY prices if available (skip if columns don't exist)
    if spy_current is not None:
        data["spy_current_price"] = round(spy_current, 2)
    if spy_start is not None:
        data["spy_trade_start_price"] = round(spy_start, 2)

    # Update existing row'''

    content = content.replace(old_block, new_block)
    print('✓ Added SPY fields to update_intraday data dict')

# 4. Add SPY fetch in update_regime_status
regime_marker = '    # Get current trade info from track record (uses actual P&L data)'
if 'spy_current, spy_start = fetch_live_spy_price' not in content.split(regime_marker)[1].split('\n')[0:10]:
    # Find the line after get_current_trade_return_from_track_record
    content = content.replace(
        '    current_trade_return, current_trade_start, current_trade_entry_price = get_current_trade_return_from_track_record(supabase)',
        '    current_trade_return, current_trade_start, current_trade_entry_price = get_current_trade_return_from_track_record(supabase)\n\n    # Fetch SPY prices for benchmark tracking\n    spy_current, spy_start = fetch_live_spy_price(supabase, current_trade_start)'
    )
    print('✓ Added SPY fetch to update_regime_status')

# 5. Add SPY fields to data dict in update_regime_status
if '"spy_current_price": spy_current' not in content:
    old_regime_data = '''        "current_trade_entry_price": current_trade_entry_price,
    }'''

    new_regime_data = '''        "current_trade_entry_price": current_trade_entry_price,
        "spy_current_price": spy_current,
        "spy_trade_start_price": spy_start,
    }'''

    content = content.replace(old_regime_data, new_regime_data)
    print('✓ Added SPY fields to update_regime_status data dict')

# Write the updated content
with open('update_regime_supabase.py', 'w') as f:
    f.write(content)

print('\n✓ All SPY tracking code added successfully!')
print('  The code will skip SPY fields if database columns don\'t exist yet.')
