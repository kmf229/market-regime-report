-- Add ytd_return column to track_record table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

ALTER TABLE track_record
ADD COLUMN IF NOT EXISTS ytd_return DECIMAL;

COMMENT ON COLUMN track_record.ytd_return IS 'Year-to-date return for current year';
