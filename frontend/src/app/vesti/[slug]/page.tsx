import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPosts, getAssetUrl, formatDate, Category } from '@/lib/api';
import NewsCard from '@/components/NewsCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function ensureNoCache() { try { noStore(); } catch {} }

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Vest nije pronađena',
    };
  }

  const ogImage = getAssetUrl(post.featured_image);

  return {
    title: post.title,
    description: post.excerpt || `Pročitajte vest: ${post.title}`,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      publishedTime: post.published_at || undefined,
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
      images: ogImage ? [ogImage] : [],
    },
  };
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
    default:
      return `${baseClass} category-badge-default`;
  }
}

export default async function PostPage({ params }: PageProps) {
  ensureNoCache();
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const category = post.category as Category | null;
  const tags = post.tags || [];
  const imageUrl = getAssetUrl(post.featured_image);

  let relatedPosts: any[] = [];
  if (category) {
    const related = await getPosts({ limit: 4, category: category.slug });
    relatedPosts = related.filter((p) => p.id !== post.id).slice(0, 3);
  }

  const shareUrl = `https://new.gornji-milanovac.com/vesti/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt || '',
    image: imageUrl || '',
    datePublished: post.published_at || '',
    publisher: {
      '@type': 'Organization',
      name: 'Gornji Milanovac Portal',
      url: 'https://new.gornji-milanovac.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="bg-surface-warm min-h-screen">
        {/* Article Header */}
        <div className="bg-white border-b border-border">
          <div className="container py-8">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <ol className="flex items-center gap-2 text-sm flex-wrap">
                <li>
                  <Link href="/" className="text-text-muted hover:text-primary transition-colors">
                    Početna
                  </Link>
                </li>
                <li className="text-text-muted">/</li>
                <li>
                  <Link href="/vesti" className="text-text-muted hover:text-primary transition-colors">
                    Vesti
                  </Link>
                </li>
                {category && (
                  <>
                    <li className="text-text-muted">/</li>
                    <li>
                      <Link
                        href={`/vesti?kategorija=${category.slug}`}
                        className="text-text-muted hover:text-primary transition-colors"
                      >
                        {category.name}
                      </Link>
                    </li>
                  </>
                )}
              </ol>
            </nav>

            {/* Category Badge */}
            {category && (
              <Link
                href={`/vesti?kategorija=${category.slug}`}
                className={`${getCategoryBadgeClass(category.slug)} mb-4 inline-block`}
              >
                {category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-text leading-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt / Standfirst */}
            {post.excerpt && (
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-6 italic max-w-3xl">
                {post.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
              {post.author && (
                <span className="flex items-center gap-2 font-medium text-text">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {(post.author as any).name || post.author}
                </span>
              )}
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <time className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(post.published_at)}
              </time>
              {post.source_name && (
                <>
                  <span className="w-1 h-1 rounded-full bg-text-muted" />
                  <span className="px-2.5 py-1 bg-surface-muted rounded-md text-xs">
                    Izvor: {post.source_name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Featured Image - Full Width */}
        {imageUrl && (
          <div className="container py-6">
            <figure className="rounded-xl overflow-hidden bg-white border border-border shadow-sm">
              <div className="relative aspect-video md:aspect-[21/9]">
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </figure>
          </div>
        )}

        {/* Main Content */}
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Article Body */}
            <div className="lg:col-span-2">
              {/* Article Content */}
              <div className="bg-white rounded-xl border border-border p-6 sm:p-8 md:p-10 shadow-sm">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content || '' }}
                />

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-border">
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
                      Tagovi
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-surface-muted text-text-secondary text-sm rounded-full hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source Link */}
                {post.source_url && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <a
                      href={post.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Pogledaj originalni članak
                    </a>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="mt-10 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
                    Podeli članak
                  </h3>
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                      aria-label="Podeli na Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                      </svg>
                    </a>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm"
                      aria-label="Podeli na Telegram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    </a>
                    <button
                      onClick={() => navigator.clipboard?.writeText(shareUrl)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface-muted text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label="Kopiraj link"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="sidebar-widget">
                  <h3 className="sidebar-widget-title">Slične Vesti</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <NewsCard key={relatedPost.id} post={relatedPost} variant="list" />
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="sidebar-widget">
                <h3 className="sidebar-widget-title">Kategorije</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/vesti"
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg text-text-secondary hover:bg-surface-muted hover:text-primary transition-all"
                    >
                      <span>Sve vesti</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                  {['sport', 'kultura', 'ekonomija', 'hronika'].map((slug) => (
                    <li key={slug}>
                      <Link
                        href={`/vesti?kategorija=${slug}`}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg text-text-secondary hover:bg-surface-muted hover:text-primary transition-all capitalize"
                      >
                        <span>{slug}</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
