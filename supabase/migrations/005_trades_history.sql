-- Add trades_history column to track_record table
-- Stores the full trade-by-trade history with P&L and equity progression

ALTER TABLE track_record
ADD COLUMN IF NOT EXISTS trades_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN track_record.trades_history IS 'Array of regime trades with entry/exit dates, P&L, and running equity';
