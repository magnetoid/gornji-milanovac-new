'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/api';

interface BreakingNewsTickerProps {
  posts: Post[];
}

export default function BreakingNewsTicker({ posts }: BreakingNewsTickerProps) {
  const [isPaused, setIsPaused] = useState(false);

  if (!posts || posts.length === 0) return null;

  // Limit to max 7 items
  const tickerPosts = posts.slice(0, 7);

  return (
    <div
      className="bg-white border-b border-border"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <div className="flex items-center gap-4 py-2.5">
          {/* Label */}
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-red rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-white text-xs font-bold uppercase tracking-wide">
              Najvažnije
            </span>
          </div>

          {/* Ticker Content */}
          <div className="flex-1 overflow-hidden">
            <div
              className={`flex whitespace-nowrap ${isPaused ? '' : 'animate-ticker-scroll'}`}
              style={{
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              {/* First set */}
              {tickerPosts.map((post, index) => (
                <span key={`first-${post.id}`} className="inline-flex items-center">
                  <Link
                    href={`/vesti/${post.slug}`}
                    className="text-text hover:text-primary font-medium text-sm transition-colors"
                  >
                    {post.title}
                  </Link>
                  {index < tickerPosts.length - 1 && (
                    <span className="mx-4 text-text-muted font-bold">//</span>
                  )}
                </span>
              ))}

              <span className="mx-4 text-text-muted font-bold">//</span>

              {/* Duplicate for seamless loop */}
              {tickerPosts.map((post, index) => (
                <span key={`second-${post.id}`} className="inline-flex items-center">
                  <Link
                    href={`/vesti/${post.slug}`}
                    className="text-text hover:text-primary font-medium text-sm transition-colors"
                  >
                    {post.title}
                  </Link>
                  {index < tickerPosts.length - 1 && (
                    <span className="mx-4 text-text-muted font-bold">//</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
