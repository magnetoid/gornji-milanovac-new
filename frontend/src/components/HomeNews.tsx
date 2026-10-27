'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Post } from '@/lib/api';
import NewsCard, { postSource } from './NewsCard';

const ALL = 'Sve';
const MAX_SOURCE_CHIPS = 5;

interface HomeNewsProps {
  // Time labels are formatted on the server so hydration sees the same text
  items: { post: Post; timeLabel: string }[];
}

// Most frequent sources first
function topSources(items: HomeNewsProps['items']): string[] {
  const counts = new Map<string, number>();
  for (const { post } of items) {
    const source = postSource(post);
    counts.set(source, (counts.get(source) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_SOURCE_CHIPS)
    .map(([source]) => source);
}

export default function HomeNews({ items }: HomeNewsProps) {
  const [source, setSource] = useState(ALL);
  const sources = [ALL, ...topSources(items)];
  const filtered = source === ALL ? items : items.filter(({ post }) => postSource(post) === source);
  const [lead, ...rest] = filtered;

  return (
    <>
      <div className="section-header">
        <div>
          <div className="eyebrow mb-2">Vesti iz više izvora</div>
          <h2 className="display-xl">Šta se dešava u gradu</h2>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Izvor vesti">
            {sources.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSource(s)}
                className={s === source ? 'chip-active' : 'chip-default'}
                aria-pressed={s === source}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {lead ? (
        <div className="grid gap-8 grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]">
          <NewsCard post={lead.post} variant="hero" timeLabel={lead.timeLabel} />
          <div className="flex flex-col">
            {rest.slice(0, 5).map(({ post, timeLabel }) => (
              <NewsCard key={post.id} post={post} variant="list" timeLabel={timeLabel} />
            ))}
            {rest.length === 0 && (
              <div className="py-4 border-t border-border text-sm text-text-muted">
                Nema više vesti iz ovog izvora.
              </div>
            )}
            <Link href="/vesti" className="section-link mt-3">
              Sve vesti →
            </Link>
          </div>
        </div>
      ) : (
        <p className="py-16 text-center text-text-muted">Nema vesti za prikaz.</p>
      )}
    </>
  );
}
