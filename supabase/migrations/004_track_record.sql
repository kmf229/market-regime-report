-- Track Record table
-- Stores performance summary, monthly returns, daily P&L history, and equity curve URL
-- Updated weekly by Raspberry Pi (Mondays 8am ET)

CREATE TABLE IF NOT EXISTS track_record (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Summary metrics
  start_date DATE NOT NULL,
  data_through DATE NOT NULL,
  strategy_length_days INTEGER NOT NULL,
  strategy_length_years DECIMAL NOT NULL,

  cumulative_return DECIMAL NOT NULL,
  cagr DECIMAL NOT NULL,
  max_drawdown DECIMAL NOT NULL,
  sharpe_ratio DECIMAL,

  avg_monthly_return DECIMAL,
  best_month_return DECIMAL,
  best_month_label TEXT,
  worst_month_return DECIMAL,
  worst_month_label TEXT,
  up_months_pct DECIMAL,

  -- Monthly returns stored as JSONB (same format as monthly_returns.json)
  monthly_returns JSONB NOT NULL DEFAULT '{"columns": [], "rows": []}',

  -- Daily P&L history stored as JSONB array
  -- Each entry: {date, account, start_equity, flows, end_equity, twr}
  daily_history JSONB NOT NULL DEFAULT '[]',

  -- Equity curve image URL (from Supabase Storage)
  equity_curve_url TEXT,

  -- Timestamps
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_track_record_updated ON track_record(last_updated DESC);

-- Enable Row Level Security
ALTER TABLE track_record ENABLE ROW LEVEL SECURITY;

-- Public read access (track record is public on the site)
CREATE POLICY "Public read access for track_record"
  ON track_record
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Service role can do everything
CREATE POLICY "Service role full access for track_record"
  ON track_record
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert initial empty row (will be updated by Pi)
INSERT INTO track_record (
  start_date,
  data_through,
  strategy_length_days,
  strategy_length_years,
  cumulative_return,
  cagr,
  max_drawdown,
  monthly_returns,
  daily_history
) VALUES (
  '2025-11-14',
  '2025-11-14',
  0,
  0,
  0,
  0,
  0,
  '{"columns": [], "rows": []}',
  '[]'
);
