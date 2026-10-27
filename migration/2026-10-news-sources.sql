-- RSS aggregator sources for an existing database (init.sql has the same
-- table for fresh installs). Run once:
--   psql "$DATABASE_URL" -f migration/2026-10-news-sources.sql

CREATE TABLE IF NOT EXISTS news_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,              -- shown as the post's source_name
    feed_url VARCHAR(1000) UNIQUE NOT NULL,
    keywords VARCHAR(500),                   -- e.g. "gornj* milanov*"; empty = import everything
    category_id UUID REFERENCES categories(id),
    enabled BOOLEAN DEFAULT true NOT NULL,
    last_fetched_at TIMESTAMPTZ,
    last_imported INTEGER DEFAULT 0,
    last_error TEXT
);

-- The importer skips items whose link is already a post
CREATE INDEX IF NOT EXISTS idx_posts_source_url ON posts(source_url);
