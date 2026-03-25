-- Add signal_regime column to track intraday signal separately from official current_regime
--
-- signal_regime: What the z-spread says RIGHT NOW (updates every 10 min during market hours)
-- current_regime: The official/confirmed regime (only changes at market close)
--
-- This allows the frontend to show:
-- - Speedometer/strength based on real-time signal
-- - Trade stats (days, return) based on official position
-- - "Potential regime change" alert when signal != official

ALTER TABLE regime_status
ADD COLUMN IF NOT EXISTS signal_regime TEXT DEFAULT 'bearish';

-- Initialize signal_regime to match current_regime
UPDATE regime_status SET signal_regime = current_regime WHERE signal_regime IS NULL OR signal_regime = '';

COMMENT ON COLUMN regime_status.signal_regime IS 'Real-time intraday regime signal (updated every 10 min)';
COMMENT ON COLUMN regime_status.current_regime IS 'Official confirmed regime (only changes at market close)';
