import Link from 'next/link';
import type { Listing } from '@/lib/api';
import { getAssetUrl, formatPrice, formatRelativeDay } from '@/lib/format';
import Thumb from './Thumb';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = getAssetUrl(listing.images?.[0] || null);
  const isExpired = listing.status === 'expired';
  const meta = [listing.location, formatRelativeDay(listing.created_at)].filter(Boolean).join(' · ');

  return (
    <article className={isExpired ? 'opacity-60' : ''}>
      <Link
        href={`/oglasi/${listing.slug}`}
        className="flex flex-col gap-2.5 h-full p-3 bg-paper-card border border-border rounded-lg text-ink hover:text-ink hover:border-ink transition-colors"
      >
        <Thumb src={imageUrl} alt={listing.title} className="aspect-[4/3] rounded" stripes="light" />
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-text-muted">
          {listing.category?.name || 'Oglas'}
          {isExpired && ' · istekao'}
        </span>
        <h3 className="text-base font-semibold leading-[1.3] line-clamp-2">{listing.title}</h3>
        <div className="flex items-baseline justify-between gap-2 mt-auto">
          <span className="font-serif text-[22px] font-semibold whitespace-nowrap">
            {formatPrice(listing.price, listing.price_type)}
          </span>
          <span className="text-[13px] text-text-muted text-right">{meta}</span>
        </div>
      </Link>
    </article>
  );
}
