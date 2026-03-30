'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/directus';

interface BreakingNewsTickerProps {
  posts: Post[];
}

export default function BreakingNewsTicker({ posts }: BreakingNewsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [posts.length]);

  if (posts.length === 0) return null;

  return (
    <div className="bg-secondary text-gray-900 py-2">
      <div className="container">
        <div className="flex items-center">
          <span className="bg-primary text-white text-xs font-bold uppercase px-3 py-1 rounded mr-4 flex-shrink-0">
            Najnovije
          </span>

          <div className="overflow-hidden flex-1">
            <div className="relative h-6">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/vesti/${post.slug}`}
                  className={`absolute inset-0 flex items-center transition-opacity duration-500 hover:underline ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <span className="truncate font-medium">{post.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {posts.length > 1 && (
            <div className="flex items-center ml-4 space-x-2 flex-shrink-0">
              <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)}
                className="p-1 hover:bg-secondary-700 rounded"
                aria-label="Prethodna vest"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs">
                {currentIndex + 1}/{posts.length}
              </span>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % posts.length)}
                className="p-1 hover:bg-secondary-700 rounded"
                aria-label="Sledeća vest"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
