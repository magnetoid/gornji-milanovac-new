-- Marketplace Schema for Gornji Milanovac Portal
-- PostgreSQL migration for vendors, products, services, and bookings

-- =====================================================
-- VENDORS TABLE
-- Seller profiles for marketplace
-- =====================================================
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo UUID REFERENCES directus_files(id) ON DELETE SET NULL,
    cover_image UUID REFERENCES directus_files(id) ON DELETE SET NULL,
    category VARCHAR(50),
    location VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    facebook VARCHAR(500),
    instagram VARCHAR(500),
    working_hours TEXT,
    featured BOOLEAN DEFAULT false
);

-- Indexes for vendors
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_featured ON vendors(featured) WHERE featured = true;

-- =====================================================
-- PRODUCTS TABLE
-- Product listings (goods for sale/contact)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'draft' NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    price_unit VARCHAR(50),
    category VARCHAR(50),
    available BOOLEAN DEFAULT true,
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    featured BOOLEAN DEFAULT false
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available) WHERE available = true;

-- Products files junction table
CREATE TABLE IF NOT EXISTS products_files (
    id SERIAL PRIMARY KEY,
    products_id UUID REFERENCES products(id) ON DELETE CASCADE,
    directus_files_id UUID REFERENCES directus_files(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_files_product ON products_files(products_id);

-- =====================================================
-- SERVICES TABLE
-- Service listings with booking capability
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'draft' NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price_from DECIMAL(10, 2),
    price_label VARCHAR(100),
    category VARCHAR(50),
    duration_minutes INTEGER,
    booking_enabled BOOLEAN DEFAULT true,
    available_days TEXT, -- JSON array like ["mon","tue","wed","thu","fri"]
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255)
);

-- Indexes for services
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_vendor_id ON services(vendor_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_booking ON services(booking_enabled) WHERE booking_enabled = true;

-- Services files junction table
CREATE TABLE IF NOT EXISTS services_files (
    id SERIAL PRIMARY KEY,
    services_id UUID REFERENCES services(id) ON DELETE CASCADE,
    directus_files_id UUID REFERENCES directus_files(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_services_files_service ON services_files(services_id);

-- =====================================================
-- BOOKINGS TABLE
-- Booking requests for services
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    requested_date DATE NOT NULL,
    requested_time VARCHAR(10),
    message TEXT,
    notes TEXT
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_requested_date ON bookings(requested_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE vendors IS 'Prodavci na marketplace-u - farme, zanatlije, male firme';
COMMENT ON TABLE products IS 'Proizvodi za prodaju - hrana, piće, zanatski proizvodi';
COMMENT ON TABLE services IS 'Usluge sa mogućnošću rezervacije';
COMMENT ON TABLE bookings IS 'Zahtevi za rezervaciju usluga';

COMMENT ON COLUMN vendors.status IS 'pending = čeka odobrenje, published = aktivno, draft = neaktivno';
COMMENT ON COLUMN vendors.category IS 'farma, zanatstvo, usluge, trgovina, turizam, ostalo';
COMMENT ON COLUMN products.price IS 'NULL znači "Po dogovoru"';
COMMENT ON COLUMN products.price_unit IS 'kom, kg, l, usluga ili custom';
COMMENT ON COLUMN services.available_days IS 'JSON niz dana: ["mon","tue","wed","thu","fri"]';
COMMENT ON COLUMN bookings.status IS 'pending, confirmed, cancelled';
