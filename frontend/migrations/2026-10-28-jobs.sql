-- State of the scheduled jobs in src/lib/jobs.ts for an existing database
-- (init.sql has the same table for fresh installs). Applied automatically at
-- startup by src/lib/migrate.ts.

CREATE TABLE IF NOT EXISTS jobs (
    name VARCHAR(100) PRIMARY KEY,
    last_started_at TIMESTAMPTZ,
    last_finished_at TIMESTAMPTZ,
    last_status VARCHAR(20),                 -- running, ok, error
    last_message TEXT,
    last_duration_ms INTEGER
);
