-- Run this in your Supabase project → SQL Editor → New query

CREATE TABLE IF NOT EXISTS basket_rooms (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow all reads and writes (password check happens in the app)
ALTER TABLE basket_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON basket_rooms FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE basket_rooms;
