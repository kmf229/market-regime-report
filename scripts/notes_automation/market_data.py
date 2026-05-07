"""
Market data module using Polygon.io API (Massive API).
"""

import os
from datetime import datetime, timedelta
from typing import Dict, Optional
import requests

# Load .env file if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

POLYGON_API_KEY = os.getenv("POLYGON_API_KEY", "")
BASE_URL = "https://api.polygon.io"


def get_previous_trading_day() -> str:
    """Get the most recent trading day (ignoring weekends)."""
    today = datetime.now()
    days_back = 1

    # Go back to Friday if today is Monday/Sunday/Saturday
    if today.weekday() == 0:  # Monday
        days_back = 3
    elif today.weekday() == 6:  # Sunday
        days_back = 2

    prev_day = today - timedelta(days=days_back)
    return prev_day.strftime("%Y-%m-%d")


def fetch_ticker_data(ticker: str, date: str) -> Optional[Dict]:
    """
    Fetch OHLCV data for a ticker on a specific date.

    Args:
        ticker: Stock symbol (e.g., 'SPY')
        date: Date in YYYY-MM-DD format

    Returns:
        Dict with open, high, low, close, volume, or None if failed
    """
    url = f"{BASE_URL}/v1/open-close/{ticker}/{date}"
    params = {"apiKey": POLYGON_API_KEY, "adjusted": "true"}

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get("status") == "OK":
            return {
                "ticker": ticker,
                "date": date,
                "open": data.get("open"),
                "high": data.get("high"),
                "low": data.get("low"),
                "close": data.get("close"),
                "volume": data.get("volume"),
            }
        else:
            print(f"⚠ No data for {ticker} on {date}")
            return None

    except Exception as e:
        print(f"✗ Error fetching {ticker} data: {e}")
        return None


def get_market_summary(tickers: list = None) -> Dict:
    """
    Get market data summary for the specified tickers.

    Args:
        tickers: List of ticker symbols (default: ['SPY', 'TQQQ', 'GLD'])

    Returns:
        Dict with ticker data and summary text
    """
    if tickers is None:
        tickers = ['SPY', 'TQQQ', 'GLD']

    date = get_previous_trading_day()
    data = {}

    for ticker in tickers:
        ticker_data = fetch_ticker_data(ticker, date)
        if ticker_data:
            data[ticker] = ticker_data

    # Generate summary text for prompt
    summary_lines = [f"Market data as of {date}:\n"]

    for ticker, info in data.items():
        if info:
            daily_change = ((info['close'] - info['open']) / info['open']) * 100
            summary_lines.append(
                f"{ticker}: Close ${info['close']:.2f} "
                f"(Open ${info['open']:.2f}, High ${info['high']:.2f}, Low ${info['low']:.2f}) "
                f"Daily change: {daily_change:+.2f}%"
            )

    summary_text = "\n".join(summary_lines)

    return {
        "date": date,
        "tickers": data,
        "summary": summary_text
    }


def get_session_context() -> str:
    """
    Get intraday/session context for reactive notes.

    For now, returns a simple context. Can be enhanced with intraday data.
    """
    now = datetime.now()
    hour = now.hour

    if hour < 12:
        session = "morning session"
    elif hour < 16:
        session = "afternoon session"
    else:
        session = "market close"

    return f"Current time: {now.strftime('%I:%M %p ET')} ({session})"


if __name__ == "__main__":
    # Test the market data fetching
    print("Testing market data fetching...\n")

    summary = get_market_summary()
    print(summary['summary'])
    print("\n" + get_session_context())
