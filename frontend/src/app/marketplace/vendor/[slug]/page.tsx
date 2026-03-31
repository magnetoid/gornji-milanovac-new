import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getVendorBySlug,
  getProducts,
  getServices,
  getAssetUrl,
  vendorCategoryLabels,
  VendorCategory,
} from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ServiceCard from '@/components/ServiceCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Ensure no static caching
function ensureNoCache() { try { noStore(); } catch {} }

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);

  if (!vendor) {
    return { title: 'Prodavac nije pronađen' };
  }

  return {
    title: `${vendor.name} - Marketplace Gornji Milanovac`,
    description: vendor.description?.replace(/<[^>]*>/g, '').slice(0, 160) || `${vendor.name} na Gornji Milanovac marketplace-u.`,
    openGraph: {
      title: vendor.name,
      description: vendor.description?.replace(/<[^>]*>/g, '').slice(0, 160) || undefined,
      images: vendor.cover_url ? [getAssetUrl(vendor.cover_url) || ''] : [],
    },
  };
}

export default async function VendorPage({ params }: PageProps) {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  const [products, services] = await Promise.all([
    getProducts({ vendorId: vendor.id, limit: 12 }),
    getServices({ vendorId: vendor.id, limit: 12 }),
  ]);

  const logoUrl = getAssetUrl(vendor.logo_url);
  const coverUrl = getAssetUrl(vendor.cover_url);
  const categoryLabel = vendor.category ? vendorCategoryLabels[vendor.category as VendorCategory] : null;

  return (
    <>
      {/* Cover Section */}
      <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-br from-primary/20 to-secondary/20">
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={vendor.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
      </div>

      <div className="container">
        {/* Vendor Header */}
        <div className="relative -mt-16 md:-mt-20 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white shadow-lg overflow-hidden border-4 border-white flex-shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={vendor.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">
                    {vendor.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pb-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-text">
                    {vendor.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-muted">
                    {categoryLabel && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {categoryLabel}
                      </span>
                    )}
                    {vendor.location && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {vendor.location}
                      </span>
                    )}
                    {vendor.working_hours && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {vendor.working_hours}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            {vendor.description && (
              <div className="bg-white border border-border rounded-lg p-6 mb-8">
                <h2 className="text-lg font-bold text-text mb-4">O nama</h2>
                <div
                  className="prose prose-sm max-w-none text-text-muted"
                  dangerouslySetInnerHTML={{ __html: vendor.description }}
                />
              </div>
            )}

            {/* Products */}
            {products.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-6">Proizvodi ({products.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Services */}
            {services.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-6">Usluge ({services.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {products.length === 0 && services.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-text-muted">
                  Ovaj prodavac trenutno nema aktivnih proizvoda ili usluga.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Contact Info */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-border rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-text mb-4">Kontakt</h3>

              <div className="space-y-4">
                {vendor.phone && (
                  <a
                    href={`tel:${vendor.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center gap-3 p-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium">{vendor.phone}</span>
                  </a>
                )}

                {vendor.email && (
                  <a
                    href={`mailto:${vendor.email}`}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{vendor.email}</span>
                  </a>
                )}

                {vendor.website && (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="truncate">Web sajt</span>
                  </a>
                )}
              </div>

              {/* Social Links */}
              {(vendor.facebook || vendor.instagram) && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-sm font-medium text-text-muted mb-3">Društvene mreže</h4>
                  <div className="flex gap-3">
                    {vendor.facebook && (
                      <a
                        href={vendor.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877f2] text-white hover:opacity-90 transition-opacity"
                        aria-label="Facebook"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                        </svg>
                      </a>
                    )}
                    {vendor.instagram && (
                      <a
                        href={vendor.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:opacity-90 transition-opacity"
                        aria-label="Instagram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
