-- Add equity curve URL columns for each funding level

ALTER TABLE track_record
ADD COLUMN IF NOT EXISTS equity_curve_url_50 TEXT,
ADD COLUMN IF NOT EXISTS equity_curve_url_75 TEXT,
ADD COLUMN IF NOT EXISTS equity_curve_url_100 TEXT;

COMMENT ON COLUMN track_record.equity_curve_url IS 'Equity curve image URL for 33% funding (default)';
COMMENT ON COLUMN track_record.equity_curve_url_50 IS 'Equity curve image URL for 50% funding';
COMMENT ON COLUMN track_record.equity_curve_url_75 IS 'Equity curve image URL for 75% funding';
COMMENT ON COLUMN track_record.equity_curve_url_100 IS 'Equity curve image URL for 100% funding';
