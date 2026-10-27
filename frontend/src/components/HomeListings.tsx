'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Listing } from '@/lib/api';
import ListingCard from './ListingCard';

const ALL = 'Sve';
const MAX_TABS = 5;
const MAX_CARDS = 8;

interface HomeListingsProps {
  listings: Listing[];
}

function categoryName(listing: Listing): string {
  return listing.category?.name || 'Ostalo';
}

export default function HomeListings({ listings }: HomeListingsProps) {
  const [tab, setTab] = useState(ALL);

  const counts = new Map<string, number>();
  for (const listing of listings) {
    counts.set(categoryName(listing), (counts.get(categoryName(listing)) || 0) + 1);
  }
  const tabs = [
    ALL,
    ...Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, MAX_TABS).map(([name]) => name),
  ];
  const shown = (tab === ALL ? listings : listings.filter((l) => categoryName(l) === tab)).slice(0, MAX_CARDS);

  return (
    <>
      <div className="section-header">
        <div>
          <div className="eyebrow mb-2">Mali oglasi · besplatno</div>
          <h2 className="display-lg">Oglasi komšija</h2>
        </div>
        {listings.length > 0 && (
          <div className="flex flex-wrap gap-1 border-b border-border" role="group" aria-label="Kategorija oglasa">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={t === tab}
                className={`-mb-px px-3 py-2 text-sm font-medium border-b-2 ${
                  t === tab ? 'border-ink text-ink' : 'border-transparent text-text-muted hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {shown.length > 0 ? (
        <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))]">
          {shown.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center text-text-muted">
          Još nema oglasa. <Link href="/oglasi/novi" className="link-underline">Postavite prvi</Link>.
        </div>
      )}

      {listings.length > 0 && (
        <Link href="/oglasi" className="section-link mt-6">
          Svi oglasi →
        </Link>
      )}
    </>
  );
}
