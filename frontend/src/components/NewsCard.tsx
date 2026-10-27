import Link from 'next/link';
import type { Post } from '@/lib/api';
import { getAssetUrl, formatDate } from '@/lib/format';
import Thumb from './Thumb';

interface NewsCardProps {
  post: Post;
  variant?: 'hero' | 'feature' | 'list' | 'mini';
  index?: number;
  // Preformatted time label, e.g. "pre 2 h"; defaults to the full date
  timeLabel?: string;
}

// Posts written by the editors have no external source
export const OWN_SOURCE = 'GM Portal';

export function postSource(post: Pick<Post, 'source_name'>): string {
  return post.source_name || OWN_SOURCE;
}

export default function NewsCard({ post, variant = 'feature', index, timeLabel }: NewsCardProps) {
  const href = `/vesti/${post.slug}`;
  const imageUrl = getAssetUrl(post.featured_image);
  const time = timeLabel || formatDate(post.published_at);
  const category = post.category;

  // HERO variant - the lead story
  if (variant === 'hero') {
    return (
      <article>
        <Link href={href} className="flex flex-col gap-3.5 text-ink hover:text-ink group">
          <Thumb src={imageUrl} alt={post.title} className="aspect-[16/10] rounded-md bg-border" eager />
          <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-text-muted">
            <span className="tag">{postSource(post)}</span>
            {category && <span>{category.name}</span>}
            {category && time && <span>·</span>}
            <time dateTime={post.published_at || undefined}>{time}</time>
          </div>
          <h3 className="font-serif text-[28px] sm:text-[34px] leading-[1.12] font-medium tracking-[-0.015em] text-pretty group-hover:text-primary">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-base leading-[1.55] text-text-secondary max-w-[60ch] line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </Link>
      </article>
    );
  }

  // LIST variant - ruled row with a square thumbnail on the right
  if (variant === 'list') {
    return (
      <article>
        <Link
          href={href}
          className="grid grid-cols-[minmax(0,1fr)_88px] sm:grid-cols-[minmax(0,1fr)_112px] gap-[18px] py-4 border-t border-border text-ink hover:text-ink group"
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <span className="tag text-[10.5px] px-[7px] py-[2px]">{postSource(post)}</span>
              <time dateTime={post.published_at || undefined}>{time}</time>
            </div>
            <h4 className="font-serif text-xl leading-[1.22] font-medium text-pretty group-hover:text-primary">
              {post.title}
            </h4>
          </div>
          <Thumb src={imageUrl} alt="" className="aspect-square rounded bg-border" stripes="default" />
        </Link>
      </article>
    );
  }

  // MINI variant - numbered list for sidebars
  if (variant === 'mini') {
    return (
      <article className="flex gap-3 py-3 border-t border-border first:border-t-0 first:pt-0">
        {typeof index === 'number' && (
          <span className="flex-shrink-0 w-6 font-serif text-2xl leading-none text-primary">
            {index + 1}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <Link href={href} className="text-ink">
            <h3 className="font-serif text-[17px] leading-snug font-medium line-clamp-2">
              {post.title}
            </h3>
          </Link>
          <time className="text-xs text-text-muted mt-1 block">{time}</time>
        </div>
      </article>
    );
  }

  // FEATURE variant (default) - grid card
  return (
    <article>
      <Link href={href} className="news-card text-ink hover:text-ink group">
        <Thumb src={imageUrl} alt={post.title} className="news-card-image aspect-[16/10]" />
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span className="tag">{postSource(post)}</span>
          {category && <span>{category.name}</span>}
          {category && time && <span>·</span>}
          <time dateTime={post.published_at || undefined}>{time}</time>
        </div>
        <h3 className="font-serif text-[22px] leading-[1.2] font-medium text-pretty line-clamp-3 group-hover:text-primary">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[15px] leading-[1.55] text-text-secondary line-clamp-2">
            {post.excerpt}
          </p>
        )}
      </Link>
    </article>
  );
}
