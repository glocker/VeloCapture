-- Enable pgcrypto for UUID generation (safe unique ids)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table: stores unique Strava users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),         -- internal user id
  strava_id BIGINT UNIQUE NOT NULL,                      -- Strava athlete id
  display_name TEXT,                                     -- user's name (from Strava)
  color TEXT NOT NULL DEFAULT '#4F46E5',                 -- unique color for territory visualization
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()          -- when user was created
);

-- Activities table: stores imported Strava activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),         -- internal activity id
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strava_activity_id BIGINT NOT NULL,                    -- Strava activity id
  distance_m INTEGER,
  moving_time_s INTEGER,
  polyline TEXT NOT NULL,                                -- compressed Google polyline
  start_date TIMESTAMPTZ,
  UNIQUE(user_id, strava_activity_id)                    -- avoid duplicates on re-import
);
CREATE INDEX IF NOT EXISTS activities_user_idx ON activities(user_id);

-- Cells table: stores visited map grid cells per user
CREATE TABLE IF NOT EXISTS cells (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cell_id TEXT NOT NULL,                                 -- grid cell key like "z/x/y"
  first_captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),  -- when user first captured this cell
  PRIMARY KEY (user_id, cell_id)
);
CREATE INDEX IF NOT EXISTS cells_user_idx ON cells(user_id);

-- User stats table: aggregated stats for faster leaderboard
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  cells_count INTEGER NOT NULL DEFAULT 0,                -- number of unique cells captured
  area_km2 NUMERIC(10,4) NOT NULL DEFAULT 0,             -- covered area in km²
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optionally we can create a MATERIALIZED VIEW for leaderboard later
-- CREATE MATERIALIZED VIEW leaderboard AS
-- SELECT user_id, COUNT(*)::INT AS cells_count FROM cells GROUP BY user_id;
