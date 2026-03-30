import Link from 'next/link';
import Image from 'next/image';
import { Post, Category, getAssetUrl, formatDate } from '@/lib/directus';

interface NewsCardProps {
  post: Post;
  variant?: 'default' | 'horizontal' | 'featured';
}

export default function NewsCard({ post, variant = 'default' }: NewsCardProps) {
  const category = post.category as Category | null;
  const imageUrl = getAssetUrl(post.featured_image, { width: 600, height: 400, quality: 80 });

  if (variant === 'horizontal') {
    return (
      <article className="flex bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative w-48 h-32 flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between p-4">
          {category && (
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              {category.name}
            </span>
          )}
          <Link href={`/vesti/${post.slug}`}>
            <h3 className="font-bold text-gray-900 hover:text-primary line-clamp-2 mt-1">
              {post.title}
            </h3>
          </Link>
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <time>{formatDate(post.published_at)}</time>
            {post.source_name && (
              <>
                <span className="mx-2">•</span>
                <span>{post.source_name}</span>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'featured') {
    return (
      <article className="relative h-96 rounded-lg overflow-hidden group">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          {category && (
            <span className="inline-block px-3 py-1 bg-secondary text-gray-900 text-xs font-bold uppercase rounded mb-3">
              {category.name}
            </span>
          )}
          <Link href={`/vesti/${post.slug}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white hover:text-secondary transition-colors duration-200 line-clamp-2">
              {post.title}
            </h2>
          </Link>
          {post.excerpt && (
            <p className="text-gray-200 mt-2 line-clamp-2 hidden md:block">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center text-sm text-gray-300 mt-3">
            <time>{formatDate(post.published_at)}</time>
            {post.source_name && (
              <>
                <span className="mx-2">•</span>
                <span>{post.source_name}</span>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative h-48">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {category && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-white text-xs font-semibold uppercase rounded">
            {category.name}
          </span>
        )}
      </div>

      <div className="p-4">
        <Link href={`/vesti/${post.slug}`}>
          <h3 className="font-bold text-lg text-gray-900 hover:text-primary line-clamp-2 mb-2">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center text-sm text-gray-500">
          <time>{formatDate(post.published_at)}</time>
          {post.source_name && (
            <>
              <span className="mx-2">•</span>
              <span>{post.source_name}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
