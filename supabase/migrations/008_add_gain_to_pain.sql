-- Add gain_to_pain_ratio column to track_record table

ALTER TABLE track_record
ADD COLUMN IF NOT EXISTS gain_to_pain_ratio DECIMAL;

-- Add comment explaining the metric
COMMENT ON COLUMN track_record.gain_to_pain_ratio IS 'Sum of positive monthly returns divided by absolute value of sum of negative monthly returns';
