'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/api';

interface BreakingNewsTickerProps {
  posts: Post[];
}

export default function BreakingNewsTicker({ posts }: BreakingNewsTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || posts.length === 0) return;

    const scrollElement = scrollRef.current;
    let animationId: number;
    let startTime: number;
    const duration = 30000; // 30 seconds for full scroll
    const scrollWidth = scrollElement.scrollWidth / 2;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      if (!isPaused) {
        const elapsed = timestamp - startTime;
        const progress = (elapsed % duration) / duration;
        scrollElement.scrollLeft = progress * scrollWidth;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [posts, isPaused]);

  if (posts.length === 0) return null;

  const separator = (
    <span className="mx-4 text-white/50 font-bold">&#183;</span>
  );

  return (
    <div
      className="breaking-ticker py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <div className="flex items-center gap-4">
          <span className="breaking-ticker-label flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            NAJVAŽNIJE
          </span>

          <div
            ref={scrollRef}
            className="breaking-ticker-content overflow-hidden"
          >
            <div className="flex whitespace-nowrap">
              {/* First set of headlines */}
              {posts.map((post, index) => (
                <span key={`first-${post.id}`} className="inline-flex items-center">
                  <Link
                    href={`/vesti/${post.slug}`}
                    className="text-white hover:text-secondary font-medium transition-colors"
                  >
                    {post.title}
                  </Link>
                  {index < posts.length - 1 && separator}
                </span>
              ))}

              {separator}

              {/* Duplicate for seamless loop */}
              {posts.map((post, index) => (
                <span key={`second-${post.id}`} className="inline-flex items-center">
                  <Link
                    href={`/vesti/${post.slug}`}
                    className="text-white hover:text-secondary font-medium transition-colors"
                  >
                    {post.title}
                  </Link>
                  {index < posts.length - 1 && separator}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
