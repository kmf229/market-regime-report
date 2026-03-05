-- Daily updates table for AI-generated blurbs
-- Run this in Supabase SQL Editor

CREATE TABLE daily_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  regime TEXT CHECK (regime IN ('bullish', 'bearish')) NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient date queries (most recent first)
CREATE INDEX daily_updates_date_idx ON daily_updates (date DESC);

-- Row Level Security
ALTER TABLE daily_updates ENABLE ROW LEVEL SECURITY;

-- Anyone can read published updates
CREATE POLICY "Allow public read" ON daily_updates
  FOR SELECT USING (true);

-- Only service role can write (Pi scheduler)
CREATE POLICY "Allow service write" ON daily_updates
  FOR ALL USING (auth.role() = 'service_role');
