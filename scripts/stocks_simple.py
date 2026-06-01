from datetime import datetime
import requests
import json
import pandas as pd
import numpy as np
from trading_days import trading_days

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
        """Fetch OHLC data for futures using v1 futures endpoint.

        Args:
            ticker: Futures contract symbol (e.g., 'NQH26' for NQ March 2026)
            start: Start date (YYYY-MM-DD format)
            end: End date (YYYY-MM-DD format)

        Returns:
            DataFrame with columns: ticker, date, open, high, low, close, volume
        """
        if start == '':
            start = '2018-01-01'
        if end == '':
            end = self.last_trading_day

        # Use Polygon.io v1 futures aggregates endpoint
        url = f"https://api.polygon.io/futures/v1/aggs/{ticker}?resolution=1session&window_start.gte={start}&window_start.lte={end}&limit=50000&apiKey={self.api_key}"

        req = requests.get(url).text
        data = json.loads(req)

        if 'results' not in data or not data['results']:
            raise ValueError(f"No data returned for futures {ticker}")

        # Convert results to DataFrame
        results = []
        for bar in data['results']:
            # window_start is the date in milliseconds
            date_str = datetime.fromtimestamp(bar['window_start']/1000.0).strftime("%Y-%m-%d")
            results.append({
                'date': date_str,
                'open': bar['o'],
                'high': bar['h'],
                'low': bar['l'],
                'close': bar['c'],
                'volume': bar.get('v', 0)  # Some futures may not have volume
            })

        df = pd.DataFrame(results)
        df.insert(0, 'ticker', ticker)
        df['date'] = pd.to_datetime(df['date'])
        return df

    def get_front_month_contract(self, base_symbol):
        """Get the front month futures contract symbol for NQ or GC.

        Args:
            base_symbol: 'NQ' or 'GC'

        Returns:
            String with contract symbol like 'NQH26'
        """
        # Futures month codes: H=Mar, M=Jun, U=Sep, Z=Dec
        # For simplicity, use quarterly contracts (H, M, U, Z)
        month_codes = {3: 'H', 6: 'M', 9: 'U', 12: 'Z'}

        today = datetime.today()
        year = today.year
        month = today.month

        # Find next quarterly month
        for contract_month in [3, 6, 9, 12]:
            if contract_month >= month:
                next_month = contract_month
                next_year = year
                break
        else:
            # If past December, roll to next March
            next_month = 3
            next_year = year + 1

        # Get month code and year suffix (e.g., '26' for 2026)
        code = month_codes[next_month]
        year_suffix = str(next_year)[-2:]

        return f"{base_symbol}{code}{year_suffix}"