import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getServiceBySlug,
  getServices,
  getAssetUrl,
  serviceCategoryLabels,
  Vendor,
  ServiceCategory,
} from '@/lib/api';
import ServiceCard from '@/components/ServiceCard';
import BookingForm from '@/components/BookingForm';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return { title: 'Usluga nije pronađena' };
  }

  const firstImage = service.images?.[0];

  return {
    title: `${service.title} - Marketplace Gornji Milanovac`,
    description: service.description?.replace(/<[^>]*>/g, '').slice(0, 160) || `${service.title} na Gornji Milanovac marketplace-u.`,
    openGraph: {
      title: service.title,
      description: service.description?.replace(/<[^>]*>/g, '').slice(0, 160) || undefined,
      images: firstImage ? [getAssetUrl(firstImage) || ''] : [],
    },
  };
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} minuta`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours} sat${hours > 1 ? 'a' : ''}`;
}

function parseAvailableDays(daysJson: string | null): string[] {
  if (!daysJson) return [];
  try {
    return JSON.parse(daysJson);
  } catch {
    return [];
  }
}

const dayLabels: Record<string, string> = {
  mon: 'Ponedeljak',
  tue: 'Utorak',
  wed: 'Sreda',
  thu: 'Četvrtak',
  fri: 'Petak',
  sat: 'Subota',
  sun: 'Nedelja',
};

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const vendor = service.vendor as Partial<Vendor> | undefined;
  const categoryLabel = service.category ? serviceCategoryLabels[service.category as ServiceCategory] : null;
  const availableDays = service.available_days || [];

  // Get related services
  const relatedServices = await getServices({
    category: service.category as ServiceCategory || undefined,
    limit: 4,
  }).then((services) => services.filter((s) => s.id !== service.id).slice(0, 3));

  const mainImage = service.images?.[0];
  const allImages = service.images || [];

  return (
    <div className="container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-text-muted">
          <li>
            <Link href="/marketplace" className="hover:text-primary transition-colors">
              Marketplace
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          {service.category && (
            <>
              <li>
                <Link href={`/marketplace/${service.category}`} className="hover:text-primary transition-colors">
                  {categoryLabel}
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
            </>
          )}
          <li className="text-text font-medium truncate max-w-[200px]">{service.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Gallery & Info - 2/3 */}
        <div className="lg:col-span-2">
          {/* Main Image */}
          <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-4">
            {mainImage ? (
              <Image
                src={getAssetUrl(mainImage) || ''}
                alt={service.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Category Badge */}
            {categoryLabel && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-sm font-medium rounded-full">
                {categoryLabel}
              </span>
            )}

            {/* Booking Badge */}
            {service.booking_enabled && (
              <span className="absolute top-4 right-4 px-3 py-1 bg-primary text-white text-sm font-medium rounded-full flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Online rezervacija
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-border"
                >
                  <Image
                    src={getAssetUrl(imageUrl) || ''}
                    alt={`${service.title} - slika ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Service Details */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {service.duration_minutes && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Trajanje</p>
                  <p className="font-medium text-text">{formatDuration(service.duration_minutes)}</p>
                </div>
              </div>
            )}

            {availableDays.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Dostupni dani</p>
                  <p className="font-medium text-text text-sm">
                    {availableDays.map((day) => dayLabels[day] || day).join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {service.description && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-text mb-4">Opis usluge</h2>
              <div
                className="prose prose-sm max-w-none text-text-muted"
                dangerouslySetInnerHTML={{ __html: service.description }}
              />
            </div>
          )}

          {/* How Booking Works */}
          {service.booking_enabled && (
            <div className="mt-8 p-6 bg-primary/5 rounded-xl">
              <h3 className="font-bold text-text mb-4">Kako funkcioniše rezervacija?</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
                  <p className="text-sm text-text-muted">Popunite formular za rezervaciju sa željenim datumom i vremenom.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
                  <p className="text-sm text-text-muted">Prodavac će pregledati vaš zahtev i kontaktirati vas radi potvrde.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
                  <p className="text-sm text-text-muted">Plaćanje se vrši direktno kod prodavca, ne kroz portal.</p>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Sidebar - Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl p-6 sticky top-24">
            <h1 className="text-2xl font-serif font-bold text-text mb-2">
              {service.title}
            </h1>

            <p className="text-3xl font-bold text-primary mb-6">
              {service.price_label || (service.price_from ? `od ${service.price_from} RSD` : 'Po dogovoru')}
            </p>

            {/* Vendor Info */}
            {vendor && (
              <Link
                href={`/marketplace/vendor/${vendor.slug}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-6"
              >
                {vendor.logo_url ? (
                  <Image
                    src={getAssetUrl(vendor.logo_url) || ''}
                    alt={vendor.name || ''}
                    width={40}
                    height={40}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{vendor.name?.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text truncate">{vendor.name}</p>
                  {vendor.location && (
                    <p className="text-xs text-text-muted truncate">{vendor.location}</p>
                  )}
                </div>
                <svg className="w-5 h-5 text-text-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            {/* Booking Form or Contact */}
            {service.booking_enabled && vendor?.id ? (
              <BookingForm
                serviceId={service.id}
                vendorId={vendor.id}
                serviceName={service.title}
                durationMinutes={service.duration_minutes}
              />
            ) : (
              <div className="space-y-3">
                {(service.contact_phone || vendor?.phone) && (
                  <a
                    href={`tel:${(service.contact_phone || vendor?.phone)?.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Pozovi {service.contact_phone || vendor?.phone}</span>
                  </a>
                )}

                {(service.contact_email || vendor?.email) && (
                  <a
                    href={`mailto:${service.contact_email || vendor?.email}`}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-border text-text font-medium rounded-lg hover:border-primary hover:text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Pošalji email</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <div className="section-header">
            <h2 className="section-title">Slične usluge</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedServices.map((relatedService) => (
              <ServiceCard key={relatedService.id} service={relatedService} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
