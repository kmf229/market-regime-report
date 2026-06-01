from datetime import datetime, timedelta
import requests
import json
import pandas as pd
import numpy as np
from trading_days import trading_days

# Optional: yfinance for futures data
try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False

class Stocks:

    def __init__(self):
        self.days = trading_days(2018) + trading_days(2019) + trading_days(2020) + trading_days(2021) + trading_days(2022) + trading_days(2023) + trading_days(2024) + trading_days(2025) + trading_days(2026)
        self.today = datetime(datetime.today().year, datetime.today().month, datetime.today().day)
        self.last_trading_day = [i for i in self.days if i < self.today][-1].strftime('%Y-%m-%d')
        self.api_key = "uWqL84ecp3A5CAgQiAJnNx4iKBfWRdNu"

    def ohlc(self, ticker, start='', end='', timeframe='day'):
        """Fetch OHLC data for stocks/ETFs using v2 stocks endpoint."""
        if start == '':
            start = '2018-01-01'
        if end == '':
            end = self.last_trading_day
        url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/{timeframe}/{start}/{end}?apiKey={self.api_key}&limit=50000"
        req = requests.get(url).text
        data = json.loads(req)

        if 'results' not in data or not data['results']:
            raise ValueError(f"No data returned for {ticker}")

        for i in data['results']:
            if timeframe == 'day':
                i['date'] = datetime.fromtimestamp(i['t']/1000.0).strftime("%Y-%m-%d")
            else:
                i['date'] = datetime.fromtimestamp(i['t']/1000.0).strftime("%Y-%m-%d %H:%M")
        df = pd.DataFrame(data['results'])
        df = df.rename(columns={'v': 'volume', 'o': 'open', 'c': 'close', 'h': 'high', 'l': 'low'})
        df = df[['date', 'open', 'high', 'low', 'close', 'volume']]
        df.insert(0, 'ticker', ticker)
        df['date'] = pd.to_datetime(df['date'])
        return df

    def ohlc_futures(self, ticker, start='', end=''):
        """Fetch OHLC data for futures using yfinance.

        Args:
            ticker: Base futures symbol ('NQ' or 'GC')
                   Will be converted to continuous contract (NQ=F, GC=F)
            start: Start date (YYYY-MM-DD format)
            end: End date (YYYY-MM-DD format)

        Returns:
            DataFrame with columns: ticker, date, open, high, low, close, volume
        """
        if not YFINANCE_AVAILABLE:
            raise ImportError("yfinance is required for futures data. Install with: pip install yfinance")

        if start == '':
            start = '2018-01-01'
        if end == '':
            end = self.last_trading_day

        # Map base symbols to Yahoo Finance continuous contract tickers
        ticker_map = {
            'NQ': 'NQ=F',   # E-mini Nasdaq 100 futures
            'GC': 'GC=F',   # Gold futures
            'ES': 'ES=F',   # E-mini S&P 500 futures
            'CL': 'CL=F',   # Crude oil futures
        }

        # Get the Yahoo Finance ticker
        yahoo_ticker = ticker_map.get(ticker.upper(), ticker)

        # If ticker already has =F suffix, use it as-is
        if ticker.endswith('=F'):
            yahoo_ticker = ticker

        # Fetch data from yfinance
        try:
            yf_ticker = yf.Ticker(yahoo_ticker)
            df = yf_ticker.history(start=start, end=end, auto_adjust=False)

            if df.empty:
                raise ValueError(f"No data returned for {yahoo_ticker}")

            # Reset index to get date as column
            df = df.reset_index()

            # Rename columns to match our format
            df = df.rename(columns={
                'Date': 'date',
                'Open': 'open',
                'High': 'high',
                'Low': 'low',
                'Close': 'close',
                'Volume': 'volume'
            })

            # Select only the columns we need
            df = df[['date', 'open', 'high', 'low', 'close', 'volume']].copy()

            # Add ticker column
            df.insert(0, 'ticker', ticker)

            # Ensure date is datetime and remove timezone if present
            df['date'] = pd.to_datetime(df['date']).dt.tz_localize(None)

            return df

        except Exception as e:
            raise ValueError(f"Error fetching futures data for {ticker} ({yahoo_ticker}): {e}")

    def get_front_month_contract(self, base_symbol):
        """Get the continuous futures contract symbol for NQ or GC.

        Args:
            base_symbol: 'NQ' or 'GC'

        Returns:
            String with continuous contract symbol like 'NQ' (for yfinance this becomes NQ=F)

        Note: When using yfinance, we use continuous contracts (NQ=F, GC=F)
              instead of specific month contracts. The ohlc_futures() method
              handles the conversion.
        """
        # For yfinance, we just return the base symbol
        # The ohlc_futures method will convert to NQ=F, GC=F
        return base_symbol.upper()