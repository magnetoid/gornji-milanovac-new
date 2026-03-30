// @ts-nocheck
import { createDirectus, rest, readItems, readItem, createItem, aggregate } from '@directus/sdk';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent: number | null;
  wp_id: number | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  wp_id: number | null;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  featured_image: string | null;
  author: string | null;
  published_at: string | null;
  category: number | Category | null;
  tags: Array<{ tags_id: Tag }>;
  source_url: string | null;
  source_name: string | null;
  wp_id: number | null;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  status: 'published' | 'draft';
}

export interface ListingCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Listing {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  price: number | null;
  category: number | ListingCategory | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  status: 'active' | 'inactive' | 'sold';
  images: Array<{ directus_files_id: string }>;
  expires_at: string | null;
}

// ===== MARKETPLACE TYPES =====

export type VendorCategory = 'farma' | 'zanatstvo' | 'usluge' | 'trgovina' | 'turizam' | 'ostalo';
export type ProductCategory = 'hrana' | 'pice' | 'meso' | 'voce_povrce' | 'mlecni' | 'med' | 'preradjevine' | 'zanatski' | 'ostalo';
export type ServiceCategory = 'popravke' | 'gradjevina' | 'lepota' | 'zdravlje' | 'edukacija' | 'prevoz' | 'ugostitelstvo' | 'ostalo';

export interface Vendor {
  id: string;
  date_created: string | null;
  status: 'published' | 'draft' | 'pending';
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  cover_image: string | null;
  category: VendorCategory | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  working_hours: string | null;
  featured: boolean;
  products?: Product[];
  services?: Service[];
}

export interface Product {
  id: string;
  date_created: string | null;
  status: 'published' | 'draft';
  vendor_id: string | Vendor | null;
  title: string;
  slug: string;
  description: string | null;
  price: number | null;
  price_unit: string | null;
  images: Array<{ directus_files_id: string }>;
  category: ProductCategory | null;
  available: boolean;
  contact_phone: string | null;
  contact_email: string | null;
  featured: boolean;
}

export interface Service {
  id: string;
  date_created: string | null;
  status: 'published' | 'draft';
  vendor_id: string | Vendor | null;
  title: string;
  slug: string;
  description: string | null;
  price_from: number | null;
  price_label: string | null;
  images: Array<{ directus_files_id: string }>;
  category: ServiceCategory | null;
  duration_minutes: number | null;
  booking_enabled: boolean;
  available_days: string | null;
  contact_phone: string | null;
  contact_email: string | null;
}

export interface Booking {
  id: string;
  date_created: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  service_id: string | Service | null;
  vendor_id: string | Vendor | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  requested_date: string;
  requested_time: string | null;
  message: string | null;
  notes: string | null;
}

export interface BookingInput {
  service_id: string;
  vendor_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  requested_date: string;
  requested_time?: string;
  message?: string;
}

interface Schema {
  categories: Category[];
  tags: Tag[];
  posts: Post[];
  pages: Page[];
  listings_categories: ListingCategory[];
  listings: Listing[];
  vendors: Vendor[];
  products: Product[];
  services: Service[];
  bookings: Booking[];
}

const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
const directusToken = process.env.DIRECTUS_TOKEN;

export const directus = createDirectus<Schema>(directusUrl).with(rest());

export async function getPosts(options?: {
  limit?: number;
  page?: number;
  category?: string;
  status?: string;
}) {
  const { limit = 12, page = 1, category, status = 'published' } = options || {};

  const filter: Record<string, unknown> = { status: { _eq: status } };

  if (category) {
    filter.category = { slug: { _eq: category } };
  }

  const posts = await directus.request(
    readItems('posts', {
      fields: ['*', { category: ['id', 'name', 'slug'] }] as any,
      filter,
      sort: ['-published_at'],
      limit,
      page,
    })
  );

  return posts;
}

export async function getPost(slug: string) {
  const posts = await directus.request(
    readItems('posts', {
      fields: ['*', { category: ['id', 'name', 'slug'] }] as any,
      filter: { slug: { _eq: slug } },
      limit: 1,
    })
  );

  return posts[0] || null;
}

export async function getCategories() {
  const categories = await directus.request(
    readItems('categories', {
      fields: ['*'],
      sort: ['name'],
    })
  );

  return categories;
}

export async function getListings(options?: {
  limit?: number;
  page?: number;
  category?: string;
  status?: string;
}) {
  const { limit = 12, page = 1, category, status = 'active' } = options || {};

  const filter: Record<string, unknown> = { status: { _eq: status } };

  if (category) {
    filter.category = { slug: { _eq: category } };
  }

  const listings = await directus.request(
    readItems('listings', {
      fields: [
        '*',
        { category: ['id', 'name', 'slug'] },
        { images: ['directus_files_id'] },
      ],
      filter,
      sort: ['-id'],
      limit,
      page,
    })
  );

  return listings;
}

export async function getListing(slug: string) {
  const listings = await directus.request(
    readItems('listings', {
      fields: [
        '*',
        { category: ['id', 'name', 'slug'] },
        { images: ['directus_files_id'] },
      ],
      filter: { slug: { _eq: slug } },
      limit: 1,
    })
  );

  return listings[0] || null;
}

export async function getListingCategories() {
  const categories = await directus.request(
    readItems('listings_categories', {
      fields: ['*'],
      sort: ['name'],
    })
  );

  return categories;
}

export function getAssetUrl(fileId: string | null, options?: { width?: number; height?: number; quality?: number }) {
  if (!fileId) return null;

  const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
  let url = `${publicUrl}/assets/${fileId}`;

  const params = new URLSearchParams();
  if (options?.width) params.set('width', options.width.toString());
  if (options?.height) params.set('height', options.height.toString());
  if (options?.quality) params.set('quality', options.quality.toString());

  const paramString = params.toString();
  if (paramString) url += `?${paramString}`;

  return url;
}

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

// ===== MARKETPLACE FUNCTIONS =====

export async function getVendors(options?: {
  category?: VendorCategory;
  featured?: boolean;
  limit?: number;
  page?: number;
}) {
  const { category, featured, limit = 12, page = 1 } = options || {};

  const filter: Record<string, unknown> = { status: { _eq: 'published' } };

  if (category) {
    filter.category = { _eq: category };
  }

  if (featured !== undefined) {
    filter.featured = { _eq: featured };
  }

  const vendors = await directus.request(
    readItems('vendors', {
      fields: ['*'],
      filter,
      sort: ['-featured', '-date_created'],
      limit,
      page,
    })
  );

  return vendors as Vendor[];
}

export async function getVendorBySlug(slug: string) {
  const vendors = await directus.request(
    readItems('vendors', {
      fields: ['*'],
      filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
      limit: 1,
    })
  );

  return (vendors[0] as Vendor) || null;
}

export async function getProducts(options?: {
  vendorId?: string;
  category?: ProductCategory;
  featured?: boolean;
  limit?: number;
  page?: number;
}) {
  const { vendorId, category, featured, limit = 12, page = 1 } = options || {};

  const filter: Record<string, unknown> = {
    status: { _eq: 'published' },
    available: { _eq: true },
  };

  if (vendorId) {
    filter.vendor_id = { _eq: vendorId };
  }

  if (category) {
    filter.category = { _eq: category };
  }

  if (featured !== undefined) {
    filter.featured = { _eq: featured };
  }

  const products = await directus.request(
    readItems('products', {
      fields: [
        '*',
        { vendor_id: ['id', 'name', 'slug', 'logo', 'location'] },
        { images: ['directus_files_id'] },
      ],
      filter,
      sort: ['-featured', '-date_created'],
      limit,
      page,
    })
  );

  return products as Product[];
}

export async function getProductBySlug(slug: string) {
  const products = await directus.request(
    readItems('products', {
      fields: [
        '*',
        { vendor_id: ['id', 'name', 'slug', 'logo', 'location', 'phone', 'email'] },
        { images: ['directus_files_id'] },
      ],
      filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
      limit: 1,
    })
  );

  return (products[0] as Product) || null;
}

export async function getServices(options?: {
  vendorId?: string;
  category?: ServiceCategory;
  bookingEnabled?: boolean;
  limit?: number;
  page?: number;
}) {
  const { vendorId, category, bookingEnabled, limit = 12, page = 1 } = options || {};

  const filter: Record<string, unknown> = { status: { _eq: 'published' } };

  if (vendorId) {
    filter.vendor_id = { _eq: vendorId };
  }

  if (category) {
    filter.category = { _eq: category };
  }

  if (bookingEnabled !== undefined) {
    filter.booking_enabled = { _eq: bookingEnabled };
  }

  const services = await directus.request(
    readItems('services', {
      fields: [
        '*',
        { vendor_id: ['id', 'name', 'slug', 'logo', 'location'] },
        { images: ['directus_files_id'] },
      ],
      filter,
      sort: ['-date_created'],
      limit,
      page,
    })
  );

  return services as Service[];
}

export async function getServiceBySlug(slug: string) {
  const services = await directus.request(
    readItems('services', {
      fields: [
        '*',
        { vendor_id: ['id', 'name', 'slug', 'logo', 'location', 'phone', 'email', 'working_hours'] },
        { images: ['directus_files_id'] },
      ],
      filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
      limit: 1,
    })
  );

  return (services[0] as Service) || null;
}

export async function createBooking(data: BookingInput) {
  const booking = await directus.request(
    createItem('bookings', {
      ...data,
      status: 'pending',
    })
  );

  return booking as Booking;
}

export async function getMarketplaceStats() {
  try {
    const [vendorsResult, productsResult, servicesResult] = await Promise.all([
      directus.request(
        aggregate('vendors', {
          aggregate: { count: '*' },
          query: { filter: { status: { _eq: 'published' } } },
        })
      ),
      directus.request(
        aggregate('products', {
          aggregate: { count: '*' },
          query: { filter: { status: { _eq: 'published' } } },
        })
      ),
      directus.request(
        aggregate('services', {
          aggregate: { count: '*' },
          query: { filter: { status: { _eq: 'published' } } },
        })
      ),
    ]);

    return {
      vendors: Number(vendorsResult[0]?.count ?? 0),
      products: Number(productsResult[0]?.count ?? 0),
      services: Number(servicesResult[0]?.count ?? 0),
    };
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    return { vendors: 0, products: 0, services: 0 };
  }
}

// Category labels for display
export const vendorCategoryLabels: Record<VendorCategory, string> = {
  farma: 'Farma',
  zanatstvo: 'Zanatstvo',
  usluge: 'Usluge',
  trgovina: 'Trgovina',
  turizam: 'Turizam',
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
