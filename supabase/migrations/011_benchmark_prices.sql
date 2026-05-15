-- Benchmark prices table for daily OHLC data
-- Stores TQQQ, SPY, QQQ, GLD prices for benchmark comparison charts

CREATE TABLE IF NOT EXISTS benchmark_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL CHECK (ticker IN ('TQQQ', 'SPY', 'QQQ', 'GLD')),
  date DATE NOT NULL,
  open DECIMAL NOT NULL,
  high DECIMAL NOT NULL,
  low DECIMAL NOT NULL,
  close DECIMAL NOT NULL,
  volume BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ticker, date)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_benchmark_ticker_date ON benchmark_prices(ticker, date DESC);
CREATE INDEX IF NOT EXISTS idx_benchmark_date ON benchmark_prices(date DESC);

-- RLS policies
ALTER TABLE benchmark_prices ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for the website)
CREATE POLICY "Allow public read access" ON benchmark_prices
  FOR SELECT USING (true);

-- Only service role can insert/update (from Pi/notebook)
CREATE POLICY "Allow service role to insert" ON benchmark_prices
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update" ON benchmark_prices
  FOR UPDATE USING (auth.role() = 'service_role');

COMMENT ON TABLE benchmark_prices IS 'Daily OHLC data for benchmark tickers (TQQQ, SPY, QQQ, GLD)';
COMMENT ON COLUMN benchmark_prices.ticker IS 'Stock ticker symbol';
COMMENT ON COLUMN benchmark_prices.date IS 'Trading day date';
COMMENT ON COLUMN benchmark_prices.close IS 'Closing price (primary field for returns calculation)';
