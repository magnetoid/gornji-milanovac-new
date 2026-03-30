-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full text search

-- ────────────────────────────────────────────────────
-- USERS & AUTH
-- ────────────────────────────────────────────────────
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'editor' NOT NULL, -- admin, editor, author
    avatar VARCHAR(500),
    active BOOLEAN DEFAULT true
);

-- ────────────────────────────────────────────────────
-- CONTENT
-- ────────────────────────────────────────────────────
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    color VARCHAR(7), -- hex color for category badge
    icon VARCHAR(50),
    post_count INTEGER DEFAULT 0
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'draft' NOT NULL, -- draft, published, scheduled, archived
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image VARCHAR(500),
    author_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id),
    tags TEXT[], -- array of tag strings
    view_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    source_name VARCHAR(255), -- for imported news (GM Info, Telegraf etc)
    source_url VARCHAR(500),
    locale VARCHAR(5) DEFAULT 'sr' -- sr, en
);

CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'draft' NOT NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    template VARCHAR(100) DEFAULT 'default',
    sort_order INTEGER DEFAULT 0,
    parent_id UUID REFERENCES pages(id),
    meta_title VARCHAR(500),
    meta_description TEXT
);

CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    filename VARCHAR(500) NOT NULL,
    original_name VARCHAR(500),
    mime_type VARCHAR(100),
    size_bytes INTEGER,
    width INTEGER,
    height INTEGER,
    alt_text VARCHAR(500),
    caption TEXT,
    url VARCHAR(1000) NOT NULL,
    uploaded_by UUID REFERENCES users(id)
);

-- ────────────────────────────────────────────────────
-- LISTINGS (Oglasi)
-- ────────────────────────────────────────────────────
CREATE TABLE listing_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(50)
);

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active' NOT NULL, -- active, expired, pending, deleted
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    price_type VARCHAR(20) DEFAULT 'fixed', -- fixed, negotiable, free
    images TEXT[], -- array of URLs
    category_id UUID REFERENCES listing_categories(id),
    location VARCHAR(255),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    views INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false
);

-- ────────────────────────────────────────────────────
-- MARKETPLACE
-- ────────────────────────────────────────────────────
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- pending, active, suspended
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    cover_url VARCHAR(500),
    category VARCHAR(50), -- farma, zanatstvo, usluge, trgovina, turizam, lepota, edukacija, ostalo
    location VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    facebook VARCHAR(500),
    instagram VARCHAR(500),
    working_hours TEXT,
    featured BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    price_unit VARCHAR(50), -- kom, kg, l, usluga
    price_negotiable BOOLEAN DEFAULT false,
    images TEXT[],
    category VARCHAR(50),
    available BOOLEAN DEFAULT true,
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0
);

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    price_from DECIMAL(12,2),
    price_label VARCHAR(255),
    images TEXT[],
    category VARCHAR(50),
    duration_minutes INTEGER,
    booking_enabled BOOLEAN DEFAULT true,
    available_days TEXT[], -- ["mon","tue","wed","thu","fri"]
    available_hours_start VARCHAR(5) DEFAULT '08:00',
    available_hours_end VARCHAR(5) DEFAULT '18:00',
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- pending, confirmed, cancelled, completed
    service_id UUID NOT NULL REFERENCES services(id),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    requested_date DATE NOT NULL,
    requested_time VARCHAR(5) NOT NULL,
    message TEXT,
    vendor_notes TEXT
);

-- ────────────────────────────────────────────────────
-- SETTINGS
-- ────────────────────────────────────────────────────
CREATE TABLE settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,
    type VARCHAR(20) DEFAULT 'string', -- string, json, boolean, number
    label VARCHAR(255),
    group_name VARCHAR(100) DEFAULT 'general'
);

-- ────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('simple', title || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, '')));
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_services_vendor ON services(vendor_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ────────────────────────────────────────────────────
-- SEED DATA
-- ────────────────────────────────────────────────────
-- Default admin user (password: GmPortal2026!)
-- bcrypt hash of 'GmPortal2026!' with 10 rounds
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@gornji-milanovac.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9Hu', 'Admin', 'admin');

-- Default categories
INSERT INTO categories (name, slug, color, icon) VALUES
('Vesti', 'vesti', '#1B5E20', 'newspaper'),
('Sport', 'sport', '#1565C0', 'trophy'),
('Kultura', 'kultura', '#6A1B9A', 'theater'),
('Ekonomija', 'ekonomija', '#E65100', 'trending-up'),
('Hronika', 'hronika', '#B71C1C', 'alert-circle'),
('Zdravlje', 'zdravlje', '#00695C', 'heart'),
('Obrazovanje', 'obrazovanje', '#1A237E', 'book'),
('Lokalno', 'lokalno', '#33691E', 'map-pin');

-- Listing categories
INSERT INTO listing_categories (name, slug, icon) VALUES
('Nekretnine', 'nekretnine', 'home'),
('Vozila', 'vozila', 'car'),
('Elektronika', 'elektronika', 'smartphone'),
('Nameštaj', 'namestaj', 'sofa'),
('Odeca i obuća', 'odeca', 'shirt'),
('Posao', 'posao', 'briefcase'),
('Usluge', 'usluge', 'tool'),
('Ostalo', 'ostalo', 'package');

-- Default settings
INSERT INTO settings (key, value, type, label, group_name) VALUES
('site_name', 'Gornji Milanovac', 'string', 'Naziv sajta', 'general'),
('site_tagline', 'Digitalni Portal Šumadije', 'string', 'Podnaslov', 'general'),
('site_description', 'Sve vesti, oglasi i informacije o Gornjem Milanovcu i okolini.', 'string', 'Opis sajta', 'general'),
('posts_per_page', '12', 'number', 'Postova po stranici', 'content'),
('facebook_url', 'https://facebook.com/gornjimilanovac', 'string', 'Facebook', 'social'),
('instagram_url', '', 'string', 'Instagram', 'social'),
('telegram_url', '', 'string', 'Telegram', 'social'),
('contact_email', 'redakcija@gornji-milanovac.com', 'string', 'Email redakcije', 'contact'),
('contact_phone', '032/712-600', 'string', 'Telefon', 'contact'),
('google_analytics', '', 'string', 'GA ID', 'seo'),
('marketplace_enabled', 'true', 'boolean', 'Marketplace aktivan', 'features');

-- Sample vendors
INSERT INTO vendors (status, name, slug, description, category, location, phone, email, working_hours, featured) VALUES
('active', 'Farma Simić', 'farma-simic', 'Porodična farma sa tradicijom od 3 generacije. Prodajemo domaće mlečne proizvode, med, voće i povrće bez pesticida.', 'farma', 'Rudnik', '060/1234-567', 'farma.simic@gmail.com', 'Pon-Sub 7:00-19:00', true),
('active', 'Auto-elektrika Petrović', 'auto-elektrika-petrovic', 'Specijalizovana radionica za auto-elektriku i dijagnostiku. 15 godina iskustva.', 'ostalo', 'Gornji Milanovac', '032/712-555', 'autoelektrika.petrovic@gmail.com', 'Pon-Pet 8:00-17:00, Sub 9:00-13:00', false),
('active', 'Kozmetički salon Jelena', 'kozmeticki-salon-jelena', 'Profesionalni kozmetički tretmani. Manikir, pedikir, masaža, epilacija.', 'lepota', 'Gornji Milanovac', '064/333-4444', 'salon.jelena@gmail.com', 'Pon-Sub 9:00-20:00', true);
