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
        if start == '':
            start = '2018-01-01'
        if end == '':
            end = self.last_trading_day
        url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/{timeframe}/{start}/{end}?apiKey={self.api_key}&limit=50000"
        req = requests.get(url).text
        data = json.loads(req)
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