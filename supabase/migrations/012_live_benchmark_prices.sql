-- Add live benchmark price tracking to regime_status table
-- This allows real-time updates of SPY prices for the benchmark comparison section

ALTER TABLE regime_status ADD COLUMN IF NOT EXISTS spy_current_price DECIMAL;
ALTER TABLE regime_status ADD COLUMN IF NOT EXISTS spy_trade_start_price DECIMAL;

COMMENT ON COLUMN regime_status.spy_current_price IS 'Latest SPY price (updated every 10 min during market hours)';
COMMENT ON COLUMN regime_status.spy_trade_start_price IS 'SPY price when current trade started (for return calculation)';
