import Link from 'next/link';
import Image from 'next/image';
import { Post, Category, getAssetUrl, formatDate } from '@/lib/directus';

interface NewsCardProps {
  post: Post;
  variant?: 'featured' | 'medium' | 'compact';
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

export default function NewsCard({ post, variant = 'medium' }: NewsCardProps) {
  const category = post.category as Category | null;
  const categorySlug = category?.slug;

  // Featured variant - large hero card
  if (variant === 'featured') {
    const imageUrl = getAssetUrl(post.featured_image, { width: 1200, height: 600, quality: 85 });

    return (
      <article className="news-card group relative bg-dark rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Image Section - 60% on desktop */}
          <div className="lg:col-span-3 relative h-64 sm:h-80 lg:h-[400px]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <svg className="w-20 h-20 text-primary-200 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-dark/60 via-dark/30 to-transparent lg:hidden" />
          </div>

          {/* Content Section - 40% on desktop */}
          <div className="lg:col-span-2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-dark">
            {category && (
              <span className={`${getCategoryBadgeClass(categorySlug)} mb-4 self-start`}>
                {category.name}
              </span>
            )}

            <Link href={`/vesti/${post.slug}`}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white hover:text-secondary transition-colors leading-tight mb-4">
                {post.title}
              </h2>
            </Link>

            {post.excerpt && (
              <p className="text-gray-300 line-clamp-3 mb-6 text-base lg:text-lg">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400">
              {post.author && (
                <span className="font-medium text-gray-300">{post.author}</span>
              )}
              <time>{formatDate(post.published_at)}</time>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Compact variant - sidebar/list style
  if (variant === 'compact') {
    const imageUrl = getAssetUrl(post.featured_image, { width: 160, height: 120, quality: 75 });

    return (
      <article className="group flex gap-3">
        <Link href={`/vesti/${post.slug}`} className="flex-shrink-0">
          <div className="relative w-20 h-16 sm:w-24 sm:h-[72px] rounded-md overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </Link>

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

  // Medium variant (default) - grid cards
  const imageUrl = getAssetUrl(post.featured_image, { width: 600, height: 400, quality: 80 });

  return (
    <article className="news-card group bg-white border border-border rounded-lg overflow-hidden">
      <Link href={`/vesti/${post.slug}`} className="block">
        <div className="news-card-image relative h-48 sm:h-52">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        <div className="flex items-center justify-between text-xs text-text-light">
          <time>{formatDate(post.published_at)}</time>
          {post.source_name && (
            <span className="px-2 py-0.5 bg-surface-alt rounded text-text-muted">
              {post.source_name}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
