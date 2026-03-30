import Link from 'next/link';
import Image from 'next/image';
import { Vendor, getAssetUrl, vendorCategoryLabels, VendorCategory } from '@/lib/api';

interface VendorCardProps {
  vendor: Vendor;
  variant?: 'grid' | 'featured';
}

const categoryColors: Record<string, string> = {
  farma: 'bg-green-100 text-green-800',
  zanatstvo: 'bg-amber-100 text-amber-800',
  usluge: 'bg-blue-100 text-blue-800',
  trgovina: 'bg-purple-100 text-purple-800',
  turizam: 'bg-rose-100 text-rose-800',
  lepota: 'bg-pink-100 text-pink-800',
  edukacija: 'bg-indigo-100 text-indigo-800',
  ostalo: 'bg-gray-100 text-gray-800',
};

export default function VendorCard({ vendor, variant = 'grid' }: VendorCardProps) {
  const logoUrl = getAssetUrl(vendor.logo_url);
  const coverUrl = getAssetUrl(vendor.cover_url);
  const categoryLabel = vendor.category ? vendorCategoryLabels[vendor.category as VendorCategory] : null;
  const categoryColorClass = vendor.category ? categoryColors[vendor.category] : categoryColors.ostalo;

  // Featured variant - wide card with cover image
  if (variant === 'featured') {
    return (
      <article className="group relative bg-white border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg">
        <Link href={`/marketplace/vendor/${vendor.slug}`} className="block">
          {/* Cover Image */}
          <div className="relative h-40 sm:h-48">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={vendor.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />

            {/* Logo overlay */}
            <div className="absolute bottom-4 left-4 flex items-end gap-4">
              <div className="w-16 h-16 rounded-xl bg-white shadow-lg overflow-hidden flex-shrink-0">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={vendor.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {vendor.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h3 className="text-xl font-bold text-white drop-shadow-lg">
                  {vendor.name}
                </h3>
                {vendor.location && (
                  <p className="text-sm text-white/80 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {vendor.location}
                  </p>
                )}
              </div>
            </div>

            {/* Category badge */}
            {categoryLabel && (
              <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full ${categoryColorClass}`}>
                {categoryLabel}
              </span>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          {vendor.description && (
            <p className="text-sm text-text-muted line-clamp-2 mb-3">
              {vendor.description.replace(/<[^>]*>/g, '')}
            </p>
          )}

          <div className="flex items-center justify-between">
            {vendor.working_hours && (
              <span className="text-xs text-text-light flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {vendor.working_hours}
              </span>
            )}
            <Link
              href={`/marketplace/vendor/${vendor.slug}`}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Pogledaj
              <svg className="w-4 h-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Grid variant (default) - square card
  return (
    <article className="group bg-white border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-md">
      <Link href={`/marketplace/vendor/${vendor.slug}`} className="block">
        {/* Logo/Header area */}
        <div className="relative h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          {logoUrl ? (
            <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md bg-white">
              <Image
                src={logoUrl}
                alt={vendor.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-white shadow-md flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {vendor.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Category badge */}
          {categoryLabel && (
            <span className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full ${categoryColorClass}`}>
              {categoryLabel}
            </span>
          )}

          {/* Featured badge */}
          {vendor.featured && (
            <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-white">
              Istaknuto
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/marketplace/vendor/${vendor.slug}`}>
          <h3 className="font-bold text-text text-center group-hover:text-primary transition-colors mb-1">
            {vendor.name}
          </h3>
        </Link>

        {vendor.location && (
          <p className="text-xs text-text-muted text-center flex items-center justify-center gap-1 mb-2">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {vendor.location}
          </p>
        )}

        {vendor.description && (
          <p className="text-xs text-text-muted text-center line-clamp-2">
            {vendor.description.replace(/<[^>]*>/g, '')}
          </p>
        )}
      </div>
    </article>
  );
}
