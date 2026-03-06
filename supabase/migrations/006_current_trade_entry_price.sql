-- Add entry price for live return calculations
ALTER TABLE regime_status
ADD COLUMN IF NOT EXISTS current_trade_entry_price DECIMAL;

COMMENT ON COLUMN regime_status.current_trade_entry_price IS 'Entry price when current trade started (TQQQ or GLD depending on regime)';
