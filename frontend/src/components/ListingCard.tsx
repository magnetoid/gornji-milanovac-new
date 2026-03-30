import Link from 'next/link';
import Image from 'next/image';
import { Listing, ListingCategory, getAssetUrl } from '@/lib/directus';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const category = listing.category as ListingCategory | null;
  const firstImage = listing.images?.[0]?.directus_files_id;
  const imageUrl = getAssetUrl(firstImage || null, { width: 400, height: 300, quality: 80 });

  const formatPrice = (price: number | null) => {
    if (!price) return 'Po dogovoru';
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative h-48">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {category && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-white text-xs font-semibold uppercase rounded">
            {category.name}
          </span>
        )}
        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white text-lg font-bold px-4 py-2 rounded">
              PRODATO
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <Link href={`/oglasi/${listing.slug}`}>
          <h3 className="font-bold text-lg text-gray-900 hover:text-primary line-clamp-2 mb-2">
            {listing.title}
          </h3>
        </Link>

        <p className="text-xl font-bold text-secondary mb-2">
          {formatPrice(listing.price)}
        </p>

        {listing.location && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.location}
          </div>
        )}

        <Link
          href={`/oglasi/${listing.slug}`}
          className="inline-flex items-center text-primary hover:text-primary-800 font-medium text-sm"
        >
          Pogledaj oglas
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
