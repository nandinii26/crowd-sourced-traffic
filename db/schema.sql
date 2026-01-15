-- PostgreSQL + PostGIS schema (simplified)
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymized_id uuid NOT NULL,
  consented boolean NOT NULL DEFAULT false
);

CREATE TABLE raw_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymized_id uuid NOT NULL,
  geom geometry(Point,4326) NOT NULL,
  speed numeric,
  heading numeric,
  recorded_at timestamptz NOT NULL
);

CREATE TABLE road_segments (
  segment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geom geometry(LineString,4326) NOT NULL,
  length_m numeric
);

CREATE TABLE aggregated_segment_state (
  state_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id uuid REFERENCES road_segments(segment_id),
  avg_speed numeric,
  sample_count integer,
  density_level varchar(16),
  updated_at timestamptz DEFAULT now()
);
