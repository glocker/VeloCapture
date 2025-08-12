-- users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strava_id BIGINT UNIQUE NOT NULL,
  display_name TEXT,
  color TEXT NOT NULL DEFAULT '#4F46E5',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- activities (save polyline compressed)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strava_activity_id BIGINT NOT NULL,
  distance_m INTEGER,
  moving_time_s INTEGER,
  polyline TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  UNIQUE(user_id, strava_activity_id)
);
CREATE INDEX activities_user_idx ON activities(user_id);

-- cells: unique user cells
CREATE TABLE cells (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cell_id TEXT NOT NULL,               -- cell key (for example, qk: z/x/y)
  first_captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, cell_id)
);
CREATE INDEX cells_user_idx ON cells(user_id);

-- aggregates for speed
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  cells_count INTEGER NOT NULL DEFAULT 0,
  area_km2 NUMERIC(10,4) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- simple materialized view for leaderboard
-- CREATE MATERIALIZED VIEW leaderboard AS
-- SELECT user_id, COUNT(*)::INT AS cells_count
-- FROM cells GROUP BY user_id;