-- Add S&P 500 benchmark columns to track_record table
ALTER TABLE track_record
ADD COLUMN IF NOT EXISTS sp500_cumulative_return DECIMAL,
ADD COLUMN IF NOT EXISTS sp500_cagr DECIMAL,
ADD COLUMN IF NOT EXISTS sp500_max_drawdown DECIMAL,
ADD COLUMN IF NOT EXISTS alpha_vs_sp500 DECIMAL;

-- Add comments for documentation
COMMENT ON COLUMN track_record.sp500_cumulative_return IS 'S&P 500 (SPY) cumulative return for same period';
COMMENT ON COLUMN track_record.sp500_cagr IS 'S&P 500 (SPY) compound annual growth rate';
COMMENT ON COLUMN track_record.sp500_max_drawdown IS 'S&P 500 (SPY) maximum drawdown for same period';
COMMENT ON COLUMN track_record.alpha_vs_sp500 IS 'Strategy cumulative return minus S&P 500 cumulative return';
