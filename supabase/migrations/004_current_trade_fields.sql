-- Add current trade tracking fields to regime_status
-- Run this in Supabase SQL Editor

ALTER TABLE regime_status
ADD COLUMN IF NOT EXISTS current_trade_return DECIMAL,
ADD COLUMN IF NOT EXISTS current_trade_start DATE;

COMMENT ON COLUMN regime_status.current_trade_return IS 'Return percentage of current trade (since last regime change)';
COMMENT ON COLUMN regime_status.current_trade_start IS 'Start date of current regime/trade';
