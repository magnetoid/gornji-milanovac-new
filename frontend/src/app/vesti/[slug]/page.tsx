import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost, getPosts, getAssetUrl, formatDate, Category, Tag } from '@/lib/directus';
import NewsCard from '@/components/NewsCard';

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Vest nije pronađena',
    };
  }

  const ogImage = getAssetUrl(post.featured_image, { width: 1200, height: 630 });

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

export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const category = post.category as Category | null;
  const tags = post.tags?.map((t) => t.tags_id) || [];
  const imageUrl = getAssetUrl(post.featured_image, { width: 1200, height: 600 });

  let relatedPosts: any[] = [];
  if (category) {
    const related = await getPosts({ limit: 4, category: category.slug });
    relatedPosts = related.filter((p) => p.id !== post.id).slice(0, 3);
  }

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

      <article className="container py-8">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-primary">
                Početna
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href="/vesti" className="hover:text-primary">
                Vesti
              </Link>
            </li>
            {category && (
              <>
                <li>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li>
                  <Link href={`/vesti?kategorija=${category.slug}`} className="hover:text-primary">
                    {category.name}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {category && (
              <Link
                href={`/vesti?kategorija=${category.slug}`}
                className="inline-block px-3 py-1 bg-primary text-white text-sm font-semibold uppercase rounded mb-4"
              >
                {category.name}
              </Link>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            <div className="flex items-center text-gray-500 mb-6 space-x-4">
              <time className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(post.published_at)}
              </time>
              {post.source_name && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Izvor: {post.source_name}
                </span>
              )}
            </div>

            {imageUrl && (
              <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 font-serif italic border-l-4 border-primary pl-4">
                {post.excerpt}
              </p>
            )}

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />

            {tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Tagovi</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: Tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {post.source_url && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <a
                  href={post.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-primary-800"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Pogledaj originalni članak
                </a>
              </div>
            )}
          </div>

          <aside className="space-y-8">
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Slične Vesti</h3>
                <div className="space-y-4">
                  {relatedPosts.map((relatedPost) => (
                    <NewsCard key={relatedPost.id} post={relatedPost} variant="horizontal" />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Podeli</h3>
              <div className="flex space-x-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://new.gornji-milanovac.com/vesti/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  aria-label="Podeli na Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                  </svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://new.gornji-milanovac.com/vesti/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600"
                  aria-label="Podeli na Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z" />
                  </svg>
                </a>
                <a
                  href={`viber://forward?text=${encodeURIComponent(post.title + ' https://new.gornji-milanovac.com/vesti/' + post.slug)}`}
                  className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                  aria-label="Podeli na Viber"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.398.002C9.47.028 5.276.32 2.917 2.462 1.072 4.307.343 6.987.266 10.333c-.076 3.346-.174 9.622 5.902 11.36h.005l-.004 2.597s-.04.999.625 1.202c.8.244 1.27-.516 2.034-1.333.42-.449.994-1.106 1.43-1.613 3.94.332 6.97-.426 7.315-.537.795-.257 5.295-.834 6.026-6.804.754-6.16-.357-10.057-2.344-11.82l-.003-.003c-.538-.513-2.727-2.02-7.754-2.182 0 0-.39-.02-.9-.01" />
                  </svg>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
