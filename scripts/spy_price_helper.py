"""
Helper module for fetching live SPY prices.
Used by update_regime_supabase.py to track benchmark prices in real-time.
"""

import pandas as pd
from datetime import datetime, timedelta


def fetch_live_spy_price(supabase_client, trade_start_date: str = None):
    """
    Fetch the latest SPY price and the SPY price at current trade start.

    Args:
        supabase_client: Supabase client instance
        trade_start_date: Optional trade start date (YYYY-MM-DD). If None, will fetch from regime_status.

    Returns:
        Tuple of (current_spy_price, spy_trade_start_price) or (None, None) if not available
    """
    try:
        from stocks_simple import Stocks
        stocks = Stocks()

        # Fetch SPY data (last 60 days to ensure we have enough history)
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=60)).strftime('%Y-%m-%d')

        spy_df = stocks.ohlc('SPY', start=start_date, end=end_date)

        if spy_df.empty:
            print("Warning: No SPY data available")
            return (None, None)

        # Get latest SPY price
        spy_df['date'] = pd.to_datetime(spy_df['date'])
        spy_df = spy_df.sort_values('date')
        current_spy_price = float(spy_df.iloc[-1]['close'])

        # Get trade start date if not provided
        if trade_start_date is None:
            try:
                regime_result = supabase_client.table("regime_status").select("current_trade_start, spy_trade_start_price").limit(1).single().execute()

                if not regime_result.data:
                    print("Warning: No regime_status data for SPY trade start price")
                    return (current_spy_price, None)

                trade_start_date = regime_result.data.get("current_trade_start")
                existing_spy_start = regime_result.data.get("spy_trade_start_price")

                # If we already have a spy_trade_start_price, use it
                if existing_spy_start is not None:
                    return (current_spy_price, float(existing_spy_start))
            except Exception as e:
                # Column might not exist yet - fetch just current_trade_start
                print(f"Note: spy_trade_start_price column not found ({e}), calculating from historical data")
                try:
                    regime_result = supabase_client.table("regime_status").select("current_trade_start").limit(1).single().execute()
                    if regime_result.data:
                        trade_start_date = regime_result.data.get("current_trade_start")
                except Exception as e2:
                    print(f"Warning: Could not fetch trade_start_date: {e2}")
                    return (current_spy_price, None)

        # Look up the SPY price on the trade start date
        if trade_start_date:
            trade_start_dt = pd.to_datetime(trade_start_date)

            # Find the SPY price on or nearest to trade start date
            spy_df_indexed = spy_df.set_index('date')

            try:
                spy_start_price = float(spy_df_indexed.loc[trade_start_dt]['close'])
            except KeyError:
                # Find nearest date
                idx = spy_df_indexed.index.get_indexer([trade_start_dt], method='nearest')[0]
                spy_start_price = float(spy_df_indexed.iloc[idx]['close'])

            print(f"SPY prices: current=${current_spy_price:.2f}, trade_start=${spy_start_price:.2f} (date: {trade_start_date})")
            return (current_spy_price, spy_start_price)

        return (current_spy_price, None)

    except Exception as e:
        print(f"Warning: Could not fetch SPY prices: {e}")
        import traceback
        traceback.print_exc()
        return (None, None)
