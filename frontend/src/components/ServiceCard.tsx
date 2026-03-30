import Link from 'next/link';
import Image from 'next/image';
import { Service, Vendor, getAssetUrl, serviceCategoryLabels, ServiceCategory } from '@/lib/api';

interface ServiceCardProps {
  service: Service;
}

const categoryColors: Record<string, string> = {
  popravke: 'bg-orange-100 text-orange-800',
  gradjevina: 'bg-stone-100 text-stone-800',
  lepota: 'bg-pink-100 text-pink-800',
  zdravlje: 'bg-red-100 text-red-800',
  edukacija: 'bg-blue-100 text-blue-800',
  prevoz: 'bg-cyan-100 text-cyan-800',
  ugostitelstvo: 'bg-amber-100 text-amber-800',
  ostalo: 'bg-gray-100 text-gray-800',
};

function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const firstImage = service.images?.[0];
  const imageUrl = getAssetUrl(firstImage || null);
  const vendor = service.vendor as Partial<Vendor> | undefined;
  const categoryLabel = service.category ? serviceCategoryLabels[service.category as ServiceCategory] : null;
  const categoryColorClass = service.category ? categoryColors[service.category] : categoryColors.ostalo;

  return (
    <article className="group bg-white border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-md">
      <Link href={`/marketplace/usluga/${service.slug}`} className="block">
        <div className="relative h-44">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={service.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Category badge */}
          {categoryLabel && (
            <span className={`absolute top-3 left-3 px-2 py-0.5 text-xs font-medium rounded-full ${categoryColorClass}`}>
              {categoryLabel}
            </span>
          )}

          {/* Booking enabled badge */}
          {service.booking_enabled && (
            <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-white flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Rezerviši
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/marketplace/usluga/${service.slug}`}>
          <h3 className="font-bold text-text leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {service.title}
          </h3>
        </Link>

        {/* Price and duration */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg font-bold text-primary">
            {service.price_label || (service.price_from ? `od ${service.price_from} RSD` : 'Po dogovoru')}
          </p>
          {service.duration_minutes && (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(service.duration_minutes)}
            </span>
          )}
        </div>

        {/* Vendor info */}
        {vendor && (
          <Link
            href={`/marketplace/vendor/${vendor.slug}`}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-primary transition-colors mb-3"
          >
            {vendor.logo_url ? (
              <Image
                src={getAssetUrl(vendor.logo_url) || ''}
                alt={vendor.name || ''}
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{vendor.name?.charAt(0)}</span>
              </div>
            )}
            <span className="truncate">{vendor.name}</span>
            {vendor.location && (
              <>
                <span className="text-text-light">·</span>
                <span className="truncate text-text-light">{vendor.location}</span>
              </>
            )}
          </Link>
        )}

        {/* Book button */}
        {service.booking_enabled && (
          <Link
            href={`/marketplace/usluga/${service.slug}`}
            className="block w-full text-center py-2 px-4 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Zakaži termin
          </Link>
        )}
      </div>
    </article>
  );
}
