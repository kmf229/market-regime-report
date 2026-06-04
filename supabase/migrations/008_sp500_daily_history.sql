-- Add sp500_daily_history column to track_record table
-- Stores daily S&P 500 equity values for drawing on canvas

ALTER TABLE track_record
ADD COLUMN IF NOT EXISTS sp500_daily_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN track_record.sp500_daily_history IS 'Array of {date: string, equity: number} for S&P 500 daily equity curve';
