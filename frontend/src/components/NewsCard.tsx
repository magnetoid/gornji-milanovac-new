import Link from 'next/link';
import Image from 'next/image';
import { Post, Category, getAssetUrl, formatDate } from '@/lib/api';

interface NewsCardProps {
  post: Post;
  variant?: 'hero' | 'feature' | 'list' | 'mini';
  index?: number;
}

function getCategoryBadgeClass(slug: string | undefined): string {
  const baseClass = 'category-badge';
  switch (slug) {
    case 'sport':
      return `${baseClass} category-badge-sport`;
    case 'kultura':
      return `${baseClass} category-badge-kultura`;
    case 'ekonomija':
      return `${baseClass} category-badge-ekonomija`;
    case 'hronika':
      return `${baseClass} category-badge-hronika`;
    case 'politika':
      return `${baseClass} category-badge-politika`;
    case 'drustvo':
      return `${baseClass} category-badge-drustvo`;
    default:
      return `${baseClass} category-badge-default`;
  }
}

export default function NewsCard({ post, variant = 'feature', index }: NewsCardProps) {
  const category = post.category as Category | null;
  const categorySlug = category?.slug;
  const imageUrl = getAssetUrl(post.featured_image);

  // HERO variant - the BIG featured story
  if (variant === 'hero') {
    return (
      <article className="group relative rounded-xl overflow-hidden bg-primary-dark">
        <Link href={`/vesti/${post.slug}`} className="block">
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              {category && (
                <span className={`${getCategoryBadgeClass(categorySlug)} mb-4 self-start`}>
                  {category.name}
                </span>
              )}

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight mb-4 text-shadow-lg">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="text-white/80 text-base md:text-lg line-clamp-2 mb-4 max-w-3xl">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center gap-3 text-sm text-white/70">
                {post.author && (
                  <>
                    <span className="font-medium text-white/90">{(post.author as any).name || post.author}</span>
                    <span className="w-1 h-1 rounded-full bg-white/50" />
                  </>
                )}
                <time>{formatDate(post.published_at)}</time>
                {post.source_name && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/50" />
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs">{post.source_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // LIST variant - compact horizontal layout
  if (variant === 'list') {
    return (
      <article className="group flex gap-4">
        <Link href={`/vesti/${post.slug}`} className="flex-shrink-0">
          <div className="relative w-24 h-16 md:w-28 md:h-20 rounded-lg overflow-hidden bg-surface-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {category && (
            <span className={`${getCategoryBadgeClass(categorySlug)} text-[10px] px-1.5 py-0.5 mb-1.5 self-start`}>
              {category.name}
            </span>
          )}
          <Link href={`/vesti/${post.slug}`}>
            <h3 className="font-medium text-text text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
          </Link>
          <time className="text-xs text-text-muted mt-1.5">
            {formatDate(post.published_at)}
          </time>
        </div>
      </article>
    );
  }

  // MINI variant - numbered list for sidebar
  if (variant === 'mini') {
    return (
      <article className="group flex gap-3">
        {typeof index === 'number' && (
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-lg font-serif font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            {index + 1}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <Link href={`/vesti/${post.slug}`}>
            <h3 className="font-medium text-text text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
          </Link>
          <time className="text-xs text-text-muted mt-1 block">
            {formatDate(post.published_at)}
          </time>
        </div>
      </article>
    );
  }

  // FEATURE variant (default) - standard card
  return (
    <article className="news-card group">
      <Link href={`/vesti/${post.slug}`} className="block">
        <div className="news-card-image relative aspect-video">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {category && (
            <span className={`${getCategoryBadgeClass(categorySlug)} absolute bottom-3 left-3`}>
              {category.name}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/vesti/${post.slug}`}>
          <h3 className="font-serif font-semibold text-lg text-text leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="text-text-muted text-sm line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-text-muted">
          <time>{formatDate(post.published_at)}</time>
          {post.source_name && (
            <span className="px-2 py-0.5 bg-surface-muted rounded text-text-muted">
              {post.source_name}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
