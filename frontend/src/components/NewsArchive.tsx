'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Post } from '@/lib/api';
import { getAssetUrl } from '@/lib/format';
import { postSource } from './NewsCard';
import Thumb from './Thumb';

const STORAGE_KEY = 'gm:skriveni-izvori';

export interface ArchiveItem {
  post: Post;
  // Formatted on the server: "11:20", "Danas · 27. oktobar"
  time: string;
  dayKey: string;
  dayHeading: string;
}

interface NewsArchiveProps {
  items: ArchiveItem[];
  sources: { name: string; host: string }[];
}

function loadHidden(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export default function NewsArchive({ items, sources }: NewsArchiveProps) {
  const [hidden, setHidden] = useState<string[]>([]);

  // Read after mount so the server render and hydration agree
  useEffect(() => setHidden(loadHidden()), []);

  function toggle(source: string) {
    const next = hidden.includes(source) ? hidden.filter((s) => s !== source) : [...hidden, source];
    setHidden(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  const visible = items.filter(({ post }) => !hidden.includes(postSource(post)));
  const groups: { dayKey: string; heading: string; items: ArchiveItem[] }[] = [];
  for (const item of visible) {
    const last = groups[groups.length - 1];
    if (last && last.dayKey === item.dayKey) last.items.push(item);
    else groups.push({ dayKey: item.dayKey, heading: item.dayHeading, items: [item] });
  }
  const hiddenCount = items.length - visible.length;

  return (
    <div className="grid gap-12 pt-2 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex flex-col">
        {groups.map((group) => (
          <section key={group.dayKey} className="pt-7">
            <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-text-muted pb-1.5">{group.heading}</h2>
            {group.items.map(({ post, time }) => (
              <Link
                key={post.id}
                href={`/vesti/${post.slug}`}
                className="grid grid-cols-[44px_minmax(0,1fr)_72px] sm:grid-cols-[56px_minmax(0,1fr)_96px] gap-[18px] items-start py-4 border-t border-border text-ink hover:text-ink group"
              >
                <span className="font-mono text-[13px] text-text-muted pt-[3px]">{time}</span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-serif text-[19px] sm:text-[21px] leading-[1.22] font-medium text-pretty group-hover:text-primary">
                    {post.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    <span className="tag text-[10.5px] px-[7px] py-[2px]">{postSource(post)}</span>
                    {post.category && <span>{post.category.name}</span>}
                  </div>
                </div>
                <Thumb src={getAssetUrl(post.featured_image)} alt="" className="aspect-square rounded bg-border" />
              </Link>
            ))}
          </section>
        ))}
        {groups.length === 0 && (
          <p className="py-16 text-center text-text-muted">
            {items.length ? 'Sve vesti na ovoj strani su iz izvora koje ste isključili.' : 'Nema vesti za prikaz.'}
          </p>
        )}
        {hiddenCount > 0 && groups.length > 0 && (
          <p className="pt-4 border-t border-border text-sm text-text-muted">
            Sakriveno {hiddenCount} {hiddenCount === 1 ? 'vest' : 'vesti'} iz isključenih izvora.
          </p>
        )}
      </div>

      <aside className="lg:pt-7 flex flex-col gap-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted mb-2">Izvori koje pratite</span>
        {sources.map((source) => {
          const on = !hidden.includes(source.name);
          return (
            <button
              key={source.name}
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => toggle(source.name)}
              className="flex items-center justify-between gap-2.5 py-2.5 border-t border-border text-left text-ink"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{source.name}</span>
                {source.host && <span className="text-xs text-text-muted">{source.host}</span>}
              </span>
              <span className={`relative flex-shrink-0 w-[34px] h-5 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-border-dark'}`}>
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-paper-card transition-[left] ${on ? 'left-4' : 'left-0.5'}`}
                />
              </span>
            </button>
          );
        })}
        <span className="text-xs leading-[1.5] text-text-muted mt-2.5">
          Vesti iz drugih izvora objavljujemo sa naslovom, kratkim izvodom i linkom na original. Izbor izvora se pamti u ovom pretraživaču.
        </span>
      </aside>
    </div>
  );
}
