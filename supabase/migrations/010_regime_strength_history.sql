-- Regime strength history table for daily regime strength values
-- This powers the Regime Strength History Chart on the Current Regime page

CREATE TABLE IF NOT EXISTS regime_strength_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  regime_strength DECIMAL NOT NULL,
  regime TEXT NOT NULL CHECK (regime IN ('bullish', 'bearish')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_regime_strength_date ON regime_strength_history(date DESC);

-- RLS policies
ALTER TABLE regime_strength_history ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for the website)
CREATE POLICY "Allow public read access" ON regime_strength_history
  FOR SELECT USING (true);

-- Only service role can insert/update (from Pi/notebook)
CREATE POLICY "Allow service role to insert" ON regime_strength_history
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update" ON regime_strength_history
  FOR UPDATE USING (auth.role() = 'service_role');

COMMENT ON TABLE regime_strength_history IS 'Daily regime strength values for historical chart visualization';
COMMENT ON COLUMN regime_strength_history.date IS 'Trading day date';
COMMENT ON COLUMN regime_strength_history.regime_strength IS 'Raw z-spread value (not scaled)';
COMMENT ON COLUMN regime_strength_history.regime IS 'Regime on this date (bullish or bearish)';
