-- Add alert preference columns to profiles
-- Run this in Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS regime_change_alerts BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS weekly_digest BOOLEAN DEFAULT FALSE;

-- Add previous regime tracking to regime_status (for alert comparison)
ALTER TABLE regime_status
ADD COLUMN IF NOT EXISTS previous_regime TEXT;

COMMENT ON COLUMN profiles.regime_change_alerts IS 'User opted in for regime change email alerts';
COMMENT ON COLUMN profiles.weekly_digest IS 'User opted in for weekly digest emails';
COMMENT ON COLUMN regime_status.previous_regime IS 'Previous day closing regime for alert comparison';
