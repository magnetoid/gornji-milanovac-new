import { db, withCache, DbPost, DbCategory, DbPage, DbListing, DbListingCategory, DbVendor, DbProduct, DbService, DbBooking, DbSetting } from './db';

// ────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────

export type VendorCategory = 'farma' | 'zanatstvo' | 'usluge' | 'trgovina' | 'turizam' | 'lepota' | 'edukacija' | 'ostalo';
export type ProductCategory = 'hrana' | 'pice' | 'meso' | 'voce_povrce' | 'mlecni' | 'med' | 'preradjevine' | 'zanatski' | 'ostalo';
export type ServiceCategory = 'popravke' | 'gradjevina' | 'lepota' | 'zdravlje' | 'edukacija' | 'prevoz' | 'ugostitelstvo' | 'ostalo';

export interface Post extends Omit<DbPost, 'created_at' | 'updated_at' | 'published_at'> {
  created_at: string;
  updated_at: string;
  published_at: string | null;
  category?: Category;
  author?: { id: string; name: string };
}

export interface Category extends Omit<DbCategory, 'created_at'> {
  created_at: string;
}

export interface Page extends Omit<DbPage, 'created_at' | 'updated_at'> {
  created_at: string;
  updated_at: string;
}

export interface Listing extends Omit<DbListing, 'created_at' | 'updated_at' | 'expires_at'> {
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  category?: ListingCategory;
}

export interface ListingCategory extends DbListingCategory {}

export interface Vendor extends Omit<DbVendor, 'created_at' | 'updated_at'> {
  created_at: string;
  updated_at: string;
  products?: Product[];
  services?: Service[];
}

export interface Product extends Omit<DbProduct, 'created_at' | 'updated_at'> {
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
}

export interface Service extends Omit<DbService, 'created_at' | 'updated_at'> {
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
}

export interface Booking extends Omit<DbBooking, 'created_at' | 'updated_at' | 'requested_date'> {
  created_at: string;
  updated_at: string;
  requested_date: string;
  service?: Service;
  vendor?: Vendor;
}

export interface BookingInput {
  service_id: string;
  vendor_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  requested_date: string;
  requested_time: string;
  message?: string;
}

// ────────────────────────────────────────────────────
// POSTS
// ────────────────────────────────────────────────────

interface GetPostsOptions {
  limit?: number;
  page?: number;
  category?: string;
  status?: string;
  search?: string;
  featured?: boolean;
}

export async function getPosts(options: GetPostsOptions = {}): Promise<Post[]> {
  const { limit = 12, page = 1, category, status = 'published', search, featured } = options;
  const offset = (page - 1) * limit;
  const cacheKey = `posts:${JSON.stringify(options)}`;

  return withCache(cacheKey, 60, async () => {
    let query = `
      SELECT p.*,
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.color as cat_color,
             u.id as author_id, u.name as author_name
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.status = $1
    `;
    const params: any[] = [status];
    let paramIndex = 2;

    if (category) {
      query += ` AND c.slug = $${paramIndex++}`;
      params.push(category);
    }

    if (featured !== undefined) {
      query += ` AND p.featured = $${paramIndex++}`;
      params.push(featured);
    }

    if (search) {
      query += ` AND (p.title ILIKE $${paramIndex} OR p.excerpt ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      published_at: row.published_at?.toISOString() || null,
      status: row.status,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      featured_image: row.featured_image,
      author_id: row.author_id,
      category_id: row.category_id,
      tags: row.tags,
      view_count: row.view_count,
      featured: row.featured,
      source_name: row.source_name,
      source_url: row.source_url,
      locale: row.locale,
      category: row.cat_id ? {
        id: row.cat_id,
        name: row.cat_name,
        slug: row.cat_slug,
        color: row.cat_color,
      } : undefined,
      author: row.author_id ? {
        id: row.author_id,
        name: row.author_name,
      } : undefined,
    }));
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const cacheKey = `post:${slug}`;

  return withCache(cacheKey, 300, async () => {
    const result = await db.query(`
      SELECT p.*,
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.color as cat_color,
             u.id as author_id, u.name as author_name
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1
    `, [slug]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      published_at: row.published_at?.toISOString() || null,
      status: row.status,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      featured_image: row.featured_image,
      author_id: row.author_id,
      category_id: row.category_id,
      tags: row.tags,
      view_count: row.view_count,
      featured: row.featured,
      source_name: row.source_name,
      source_url: row.source_url,
      locale: row.locale,
      category: row.cat_id ? {
        id: row.cat_id,
        name: row.cat_name,
        slug: row.cat_slug,
        color: row.cat_color,
      } : undefined,
      author: row.author_id ? {
        id: row.author_id,
        name: row.author_name,
      } : undefined,
    };
  });
}

export async function getPostsCount(options: { status?: string; category?: string } = {}): Promise<number> {
  const { status = 'published', category } = options;

  let query = 'SELECT COUNT(*) FROM posts p';
  const params: any[] = [status];

  if (category) {
    query += ' LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = $1 AND c.slug = $2';
    params.push(category);
  } else {
    query += ' WHERE p.status = $1';
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count, 10);
}

// ────────────────────────────────────────────────────
// CATEGORIES
// ────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  return withCache('categories', 600, async () => {
    const result = await db.query<DbCategory>('SELECT * FROM categories ORDER BY name');
    return result.rows.map(row => ({
      ...row,
      created_at: row.created_at?.toISOString(),
    }));
  });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const result = await db.query<DbCategory>('SELECT * FROM categories WHERE slug = $1', [slug]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return { ...row, created_at: row.created_at?.toISOString() };
}

// ────────────────────────────────────────────────────
// PAGES
// ────────────────────────────────────────────────────

export async function getPages(status: string = 'published'): Promise<Page[]> {
  return withCache(`pages:${status}`, 600, async () => {
    const result = await db.query<DbPage>(
      'SELECT * FROM pages WHERE status = $1 ORDER BY sort_order, title',
      [status]
    );
    return result.rows.map(row => ({
      ...row,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    }));
  });
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const cacheKey = `page:${slug}`;

  return withCache(cacheKey, 300, async () => {
    const result = await db.query<DbPage>(
      'SELECT * FROM pages WHERE slug = $1 AND status = $2',
      [slug, 'published']
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...row,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    };
  });
}

// ────────────────────────────────────────────────────
// LISTINGS
// ────────────────────────────────────────────────────

interface GetListingsOptions {
  limit?: number;
  page?: number;
  category?: string;
  status?: string;
  featured?: boolean;
}

export async function getListings(options: GetListingsOptions = {}): Promise<Listing[]> {
  const { limit = 12, page = 1, category, status = 'active', featured } = options;
  const offset = (page - 1) * limit;
  const cacheKey = `listings:${JSON.stringify(options)}`;

  return withCache(cacheKey, 60, async () => {
    let query = `
      SELECT l.*,
             lc.id as cat_id, lc.name as cat_name, lc.slug as cat_slug, lc.icon as cat_icon
      FROM listings l
      LEFT JOIN listing_categories lc ON l.category_id = lc.id
      WHERE l.status = $1
    `;
    const params: any[] = [status];
    let paramIndex = 2;

    if (category) {
      query += ` AND lc.slug = $${paramIndex++}`;
      params.push(category);
    }

    if (featured !== undefined) {
      query += ` AND l.featured = $${paramIndex++}`;
      params.push(featured);
    }

    query += ` ORDER BY l.featured DESC, l.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      expires_at: row.expires_at?.toISOString() || null,
      status: row.status,
      title: row.title,
      slug: row.slug,
      description: row.description,
      price: row.price ? parseFloat(row.price) : null,
      price_type: row.price_type,
      images: row.images,
      category_id: row.category_id,
      location: row.location,
      contact_name: row.contact_name,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      views: row.views,
      featured: row.featured,
      category: row.cat_id ? {
        id: row.cat_id,
        name: row.cat_name,
        slug: row.cat_slug,
        icon: row.cat_icon,
      } : undefined,
    }));
  });
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const cacheKey = `listing:${slug}`;

  return withCache(cacheKey, 300, async () => {
    const result = await db.query(`
      SELECT l.*,
             lc.id as cat_id, lc.name as cat_name, lc.slug as cat_slug, lc.icon as cat_icon
      FROM listings l
      LEFT JOIN listing_categories lc ON l.category_id = lc.id
      WHERE l.slug = $1
    `, [slug]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      expires_at: row.expires_at?.toISOString() || null,
      status: row.status,
      title: row.title,
      slug: row.slug,
      description: row.description,
      price: row.price ? parseFloat(row.price) : null,
      price_type: row.price_type,
      images: row.images,
      category_id: row.category_id,
      location: row.location,
      contact_name: row.contact_name,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      views: row.views,
      featured: row.featured,
      category: row.cat_id ? {
        id: row.cat_id,
        name: row.cat_name,
        slug: row.cat_slug,
        icon: row.cat_icon,
      } : undefined,
    };
  });
}

export async function getListingCategories(): Promise<ListingCategory[]> {
  return withCache('listing_categories', 600, async () => {
    const result = await db.query<DbListingCategory>('SELECT * FROM listing_categories ORDER BY name');
    return result.rows;
  });
}

// ────────────────────────────────────────────────────
// VENDORS
// ────────────────────────────────────────────────────

interface GetVendorsOptions {
  limit?: number;
  page?: number;
  category?: VendorCategory;
  status?: string;
  featured?: boolean;
}

export async function getVendors(options: GetVendorsOptions = {}): Promise<Vendor[]> {
  const { limit = 12, page = 1, category, status = 'active', featured } = options;
  const offset = (page - 1) * limit;
  const cacheKey = `vendors:${JSON.stringify(options)}`;

  return withCache(cacheKey, 120, async () => {
    let query = `SELECT * FROM vendors WHERE status = $1`;
    const params: any[] = [status];
    let paramIndex = 2;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (featured !== undefined) {
      query += ` AND featured = $${paramIndex++}`;
      params.push(featured);
    }

    query += ` ORDER BY featured DESC, created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query<DbVendor>(query, params);

    return result.rows.map(row => ({
      ...row,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      rating: row.rating ? parseFloat(String(row.rating)) : 0,
    }));
  });
}

export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  const cacheKey = `vendor:${slug}`;

  return withCache(cacheKey, 300, async () => {
    const result = await db.query<DbVendor>(
      'SELECT * FROM vendors WHERE slug = $1 AND status = $2',
      [slug, 'active']
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      rating: row.rating ? parseFloat(String(row.rating)) : 0,
    };
  });
}

// ────────────────────────────────────────────────────
// PRODUCTS
// ────────────────────────────────────────────────────

interface GetProductsOptions {
  limit?: number;
  page?: number;
  vendorId?: string;
  category?: ProductCategory;
  featured?: boolean;
}

export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
  const { limit = 12, page = 1, vendorId, category, featured } = options;
  const offset = (page - 1) * limit;
  const cacheKey = `products:${JSON.stringify(options)}`;

  return withCache(cacheKey, 120, async () => {
    let query = `
      SELECT p.*,
             v.id as vendor_id, v.name as vendor_name, v.slug as vendor_slug,
             v.logo_url as vendor_logo, v.location as vendor_location
      FROM products p
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.status = 'active' AND p.available = true
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (vendorId) {
      query += ` AND p.vendor_id = $${paramIndex++}`;
      params.push(vendorId);
    }

    if (category) {
      query += ` AND p.category = $${paramIndex++}`;
      params.push(category);
    }

    if (featured !== undefined) {
      query += ` AND p.featured = $${paramIndex++}`;
      params.push(featured);
    }

    query += ` ORDER BY p.featured DESC, p.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      status: row.status,
      vendor_id: row.vendor_id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      price: row.price ? parseFloat(row.price) : null,
      price_unit: row.price_unit,
      price_negotiable: row.price_negotiable,
      images: row.images,
      category: row.category,
      available: row.available,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      featured: row.featured,
      view_count: row.view_count,
      vendor: row.vendor_id ? {
        id: row.vendor_id,
        name: row.vendor_name,
        slug: row.vendor_slug,
        logo_url: row.vendor_logo,
        location: row.vendor_location,
      } : undefined,
    }));
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const cacheKey = `product:${slug}`;

  return withCache(cacheKey, 300, async () => {
    const result = await db.query(`
      SELECT p.*,
             v.id as v_id, v.name as vendor_name, v.slug as vendor_slug,
             v.logo_url as vendor_logo, v.location as vendor_location,
             v.phone as vendor_phone, v.email as vendor_email
      FROM products p
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.slug = $1 AND p.status = 'active'
    `, [slug]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      status: row.status,
      vendor_id: row.vendor_id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      price: row.price ? parseFloat(row.price) : null,
      price_unit: row.price_unit,
      price_negotiable: row.price_negotiable,
      images: row.images,
      category: row.category,
      available: row.available,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      featured: row.featured,
      view_count: row.view_count,
      vendor: row.v_id ? {
        id: row.v_id,
        name: row.vendor_name,
        slug: row.vendor_slug,
        logo_url: row.vendor_logo,
        location: row.vendor_location,
        phone: row.vendor_phone,
        email: row.vendor_email,
      } : undefined,
    };
  });
}

// ────────────────────────────────────────────────────
// SERVICES
// ────────────────────────────────────────────────────

interface GetServicesOptions {
  limit?: number;
  page?: number;
  vendorId?: string;
  category?: ServiceCategory;
  bookingEnabled?: boolean;
}

export async function getServices(options: GetServicesOptions = {}): Promise<Service[]> {
  const { limit = 12, page = 1, vendorId, category, bookingEnabled } = options;
  const offset = (page - 1) * limit;
  const cacheKey = `services:${JSON.stringify(options)}`;

  return withCache(cacheKey, 120, async () => {
    let query = `
      SELECT s.*,
             v.id as v_id, v.name as vendor_name, v.slug as vendor_slug,
             v.logo_url as vendor_logo, v.location as vendor_location
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.status = 'active'
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (vendorId) {
      query += ` AND s.vendor_id = $${paramIndex++}`;
      params.push(vendorId);
    }

    if (category) {
      query += ` AND s.category = $${paramIndex++}`;
      params.push(category);
    }

    if (bookingEnabled !== undefined) {
      query += ` AND s.booking_enabled = $${paramIndex++}`;
      params.push(bookingEnabled);
    }

    query += ` ORDER BY s.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      status: row.status,
      vendor_id: row.vendor_id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      price_from: row.price_from ? parseFloat(row.price_from) : null,
      price_label: row.price_label,
      images: row.images,
      category: row.category,
      duration_minutes: row.duration_minutes,
      booking_enabled: row.booking_enabled,
      available_days: row.available_days,
      available_hours_start: row.available_hours_start,
      available_hours_end: row.available_hours_end,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      vendor: row.v_id ? {
        id: row.v_id,
        name: row.vendor_name,
        slug: row.vendor_slug,
        logo_url: row.vendor_logo,
        location: row.vendor_location,
      } : undefined,
    }));
  });
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const cacheKey = `service:${slug}`;

  return withCache(cacheKey, 300, async () => {
    const result = await db.query(`
      SELECT s.*,
             v.id as v_id, v.name as vendor_name, v.slug as vendor_slug,
             v.logo_url as vendor_logo, v.location as vendor_location,
             v.phone as vendor_phone, v.email as vendor_email, v.working_hours as vendor_hours
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.slug = $1 AND s.status = 'active'
    `, [slug]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      status: row.status,
      vendor_id: row.vendor_id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      price_from: row.price_from ? parseFloat(row.price_from) : null,
      price_label: row.price_label,
      images: row.images,
      category: row.category,
      duration_minutes: row.duration_minutes,
      booking_enabled: row.booking_enabled,
      available_days: row.available_days,
      available_hours_start: row.available_hours_start,
      available_hours_end: row.available_hours_end,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      vendor: row.v_id ? {
        id: row.v_id,
        name: row.vendor_name,
        slug: row.vendor_slug,
        logo_url: row.vendor_logo,
        location: row.vendor_location,
        phone: row.vendor_phone,
        email: row.vendor_email,
        working_hours: row.vendor_hours,
      } : undefined,
    };
  });
}

// ────────────────────────────────────────────────────
// BOOKINGS
// ────────────────────────────────────────────────────

export async function createBooking(data: BookingInput): Promise<Booking> {
  const result = await db.query<DbBooking>(`
    INSERT INTO bookings (service_id, vendor_id, customer_name, customer_email, customer_phone, requested_date, requested_time, message, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
    RETURNING *
  `, [
    data.service_id,
    data.vendor_id,
    data.customer_name,
    data.customer_email,
    data.customer_phone || null,
    data.requested_date,
    data.requested_time,
    data.message || null,
  ]);

  const row = result.rows[0];
  return {
    ...row,
    created_at: row.created_at?.toISOString(),
    updated_at: row.updated_at?.toISOString(),
    requested_date: row.requested_date?.toISOString?.() || String(row.requested_date),
  };
}

export async function getBookings(options: { vendorId?: string; status?: string; limit?: number } = {}): Promise<Booking[]> {
  const { vendorId, status, limit = 50 } = options;

  let query = `
    SELECT b.*,
           s.title as service_title, s.slug as service_slug,
           v.name as vendor_name, v.slug as vendor_slug
    FROM bookings b
    LEFT JOIN services s ON b.service_id = s.id
    LEFT JOIN vendors v ON b.vendor_id = v.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (vendorId) {
    query += ` AND b.vendor_id = $${paramIndex++}`;
    params.push(vendorId);
  }

  if (status) {
    query += ` AND b.status = $${paramIndex++}`;
    params.push(status);
  }

  query += ` ORDER BY b.requested_date DESC, b.requested_time DESC LIMIT $${paramIndex++}`;
  params.push(limit);

  const result = await db.query(query, params);

  return result.rows.map(row => ({
    id: row.id,
    created_at: row.created_at?.toISOString(),
    updated_at: row.updated_at?.toISOString(),
    status: row.status,
    service_id: row.service_id,
    vendor_id: row.vendor_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    requested_date: row.requested_date?.toISOString?.() || String(row.requested_date),
    requested_time: row.requested_time,
    message: row.message,
    vendor_notes: row.vendor_notes,
    service: {
      title: row.service_title,
      slug: row.service_slug,
    },
    vendor: {
      name: row.vendor_name,
      slug: row.vendor_slug,
    },
  }));
}

// ────────────────────────────────────────────────────
// SETTINGS
// ────────────────────────────────────────────────────

export async function getSettings(): Promise<Record<string, string>> {
  return withCache('settings', 3600, async () => {
    const result = await db.query<DbSetting>('SELECT key, value FROM settings');
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[row.key] = row.value || '';
    }
    return settings;
  });
}

export async function getSettingsByGroup(): Promise<Record<string, DbSetting[]>> {
  const result = await db.query<DbSetting>('SELECT * FROM settings ORDER BY group_name, key');
  const grouped: Record<string, DbSetting[]> = {};
  for (const row of result.rows) {
    if (!grouped[row.group_name]) {
      grouped[row.group_name] = [];
    }
    grouped[row.group_name].push(row);
  }
  return grouped;
}

// ────────────────────────────────────────────────────
// VIEW COUNTS (fire-and-forget)
// ────────────────────────────────────────────────────

export function incrementViews(table: 'posts' | 'listings' | 'products', id: string): void {
  const column = table === 'posts' ? 'view_count' : table === 'products' ? 'view_count' : 'views';
  db.query(`UPDATE ${table} SET ${column} = ${column} + 1 WHERE id = $1`, [id])
    .catch(err => console.error('Error incrementing views:', err));
}

// ────────────────────────────────────────────────────
// MARKETPLACE STATS
// ────────────────────────────────────────────────────

export async function getMarketplaceStats(): Promise<{ vendors: number; products: number; services: number }> {
  return withCache('marketplace_stats', 300, async () => {
    const [vendorsResult, productsResult, servicesResult] = await Promise.all([
      db.query('SELECT COUNT(*) FROM vendors WHERE status = $1', ['active']),
      db.query('SELECT COUNT(*) FROM products WHERE status = $1 AND available = true', ['active']),
      db.query('SELECT COUNT(*) FROM services WHERE status = $1', ['active']),
    ]);

    return {
      vendors: parseInt(vendorsResult.rows[0].count, 10),
      products: parseInt(productsResult.rows[0].count, 10),
      services: parseInt(servicesResult.rows[0].count, 10),
    };
  });
}

// ────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────

export function formatDate(dateString: string | null): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const months = [
    'januar', 'februar', 'mart', 'april', 'maj', 'jun',
    'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}. ${month} ${year}.`;
}

export function getAssetUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_URL || '/uploads';
  return `${baseUrl}/${url}`;
}

// Category labels
export const vendorCategoryLabels: Record<VendorCategory, string> = {
  farma: 'Farma',
  zanatstvo: 'Zanatstvo',
  usluge: 'Usluge',
  trgovina: 'Trgovina',
  turizam: 'Turizam',
  lepota: 'Lepota',
  edukacija: 'Edukacija',
  ostalo: 'Ostalo',
};

export const productCategoryLabels: Record<ProductCategory, string> = {
  hrana: 'Hrana',
  pice: 'Piće',
  meso: 'Meso',
  voce_povrce: 'Voće i povrće',
  mlecni: 'Mlečni proizvodi',
  med: 'Med',
  preradjevine: 'Prerađevine',
  zanatski: 'Zanatski proizvodi',
  ostalo: 'Ostalo',
};

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  popravke: 'Popravke',
  gradjevina: 'Građevina',
  lepota: 'Lepota',
  zdravlje: 'Zdravlje',
  edukacija: 'Edukacija',
  prevoz: 'Prevoz',
  ugostitelstvo: 'Ugostiteljstvo',
  ostalo: 'Ostalo',
};
