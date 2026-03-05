import yfinance as yf
import pandas as pd

class Stocks:
    def ohlc(self, ticker, end=None, start=None, period="1y"):
        """Fetch OHLCV data for a ticker."""
        stock = yf.Ticker(ticker)
        df = stock.history(period=period, end=end)
        df = df.reset_index()
        df.columns = [c.lower() for c in df.columns]
        df = df.rename(columns={'date': 'date'})
        df['date'] = pd.to_datetime(df['date']).dt.tz_localize(None)
        return df[['date', 'open', 'high', 'low', 'close', 'volume']]
