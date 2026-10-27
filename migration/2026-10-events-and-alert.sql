-- Adds the events calendar and the homepage notice bar settings to an
-- existing database (init.sql already includes both for fresh installs).
-- Run once: psql "$DATABASE_URL" -f migration/2026-10-events-and-alert.sql

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'published' NOT NULL, -- draft, published, cancelled
    title VARCHAR(500) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    description TEXT,
    url VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);

INSERT INTO settings (key, value, type, label, group_name) VALUES
('site_alert', '', 'string', 'Obaveštenje na naslovnoj (prazno = skriveno)', 'general'),
('site_alert_link', '', 'string', 'Link obaveštenja', 'general')
ON CONFLICT (key) DO NOTHING;
