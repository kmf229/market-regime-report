-- Regime status table for real-time updates
CREATE TABLE IF NOT EXISTS regime_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_regime TEXT NOT NULL CHECK (current_regime IN ('bullish', 'bearish')),
  regime_strength DECIMAL NOT NULL,
  strength_change DECIMAL NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  days_in_current_regime INTEGER NOT NULL DEFAULT 0,
  regime_changes_this_year INTEGER NOT NULL DEFAULT 0,
  avg_regime_duration_days INTEGER NOT NULL DEFAULT 0,
  regime_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  speedometer_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- We only need one row, so add a constraint
CREATE UNIQUE INDEX IF NOT EXISTS regime_status_singleton ON regime_status ((true));

-- RLS policies
ALTER TABLE regime_status ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for the website)
CREATE POLICY "Allow public read access" ON regime_status
  FOR SELECT USING (true);

-- Only service role can update (from Pi/notebook)
CREATE POLICY "Allow service role to update" ON regime_status
  FOR ALL USING (auth.role() = 'service_role');

-- Insert initial row
INSERT INTO regime_status (
  current_regime,
  regime_strength,
  strength_change,
  days_in_current_regime,
  regime_changes_this_year,
  avg_regime_duration_days,
  regime_history
) VALUES (
  'bearish',
  -0.486,
  -0.034,
  44,
  2,
  40,
  '[]'::jsonb
) ON CONFLICT DO NOTHING;
