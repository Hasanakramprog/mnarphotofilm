-- ============================================================
-- Mnar Photofilm Sessions — Supabase Schema
-- Run this in the Supabase SQL editor to initialize the database
-- ============================================================

-- Create status enum
CREATE TYPE session_status AS ENUM ('confirmed', 'pending', 'completed', 'cancelled');

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name   TEXT NOT NULL,
  client_phone  TEXT,
  date          DATE NOT NULL,
  location      TEXT NOT NULL DEFAULT '',
  time          TEXT,                        -- null = TBD
  session_type  TEXT NOT NULL DEFAULT '',
  price_text    TEXT,                        -- free-text price override
  price_numeric NUMERIC(10, 2),
  notes         TEXT,
  status        session_status NOT NULL DEFAULT 'confirmed',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for fast date-range queries
CREATE INDEX sessions_date_idx ON sessions (date);
CREATE INDEX sessions_status_idx ON sessions (status);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Public: can read all non-cancelled sessions
CREATE POLICY "Public can read non-cancelled sessions"
  ON sessions FOR SELECT
  TO anon
  USING (status != 'cancelled');

-- Authenticated admin: full access
CREATE POLICY "Authenticated users have full access"
  ON sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
