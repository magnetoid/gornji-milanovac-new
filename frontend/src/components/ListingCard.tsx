import Link from 'next/link';
import Image from 'next/image';
import { Listing, ListingCategory, getAssetUrl, formatDate } from '@/lib/directus';

interface ListingCardProps {
  listing: Listing;
}

const categoryIcons: Record<string, JSX.Element> = {
  nekretnine: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  vozila: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 0v8m0-8l4-4 4 4M8 15h8m-8 0l4 4 4-4" />
    </svg>
  ),
  usluge: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  default: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
};

function formatPrice(price: number | null): string {
  if (!price) return 'Po dogovoru';
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ListingCard({ listing }: ListingCardProps) {
  const category = listing.category as ListingCategory | null;
  const firstImage = listing.images?.[0]?.directus_files_id;
  const imageUrl = getAssetUrl(firstImage || null, { width: 400, height: 300, quality: 80 });
  const categoryIcon = categoryIcons[category?.slug || 'default'] || categoryIcons.default;
  const isSold = listing.status === 'sold';

  return (
    <article className={`group bg-white border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-md ${isSold ? 'opacity-75' : ''}`}>
      <Link href={`/oglasi/${listing.slug}`} className="block">
        <div className="relative h-44">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {category && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm text-text text-xs font-medium rounded shadow-sm">
              {categoryIcon}
              {category.name}
            </span>
          )}

          {isSold && (
            <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
              <span className="bg-accent text-white text-sm font-bold uppercase px-4 py-2 rounded">
                Prodato
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/oglasi/${listing.slug}`}>
          <h3 className="font-bold text-text leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {listing.title}
          </h3>
        </Link>

        <p className="text-lg font-bold text-primary mb-3">
          {formatPrice(listing.price)}
        </p>

        <div className="flex items-center justify-between">
          {listing.location && (
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{listing.location}</span>
            </div>
          )}

          <time className="text-xs text-text-light">
            {formatDate(listing.expires_at)}
          </time>
        </div>
      </div>
    </article>
  );
}
