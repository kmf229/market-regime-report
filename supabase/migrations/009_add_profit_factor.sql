-- Add profit_factor column to track_record table

ALTER TABLE track_record
ADD COLUMN IF NOT EXISTS profit_factor DECIMAL;

-- Add comment explaining the metric
COMMENT ON COLUMN track_record.profit_factor IS 'Gross profit divided by gross loss from all closed trades (dollar P&L)';
