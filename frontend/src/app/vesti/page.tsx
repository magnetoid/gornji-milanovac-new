import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, getCategories, Category } from '@/lib/api';
import NewsCard from '@/components/NewsCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Ensure no static caching
function ensureNoCache() { try { noStore(); } catch {} }

interface PageProps {
  searchParams: { kategorija?: string; page?: string };
}

const categoryFilters = [
  { name: 'Sve', slug: '' },
  { name: 'Sport', slug: 'sport' },
  { name: 'Kultura', slug: 'kultura' },
  { name: 'Ekonomija', slug: 'ekonomija' },
  { name: 'Hronika', slug: 'hronika' },
];

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const categorySlug = searchParams.kategorija;
  let title = 'Vesti';
  let description = 'Najnovije vesti iz Gornjeg Milanovca i Takovskog kraja.';

  if (categorySlug) {
    const categories = await getCategories();
    const category = categories.find((c: Category) => c.slug === categorySlug);
    if (category) {
      title = `${category.name} - Vesti`;
      description = `Najnovije vesti iz kategorije ${category.name} u Gornjem Milanovcu.`;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Gornji Milanovac`,
      description,
    },
  };
}

export default async function VestiPage({ searchParams }: PageProps) {
  const categorySlug = searchParams.kategorija;
  const page = parseInt(searchParams.page || '1', 10);

  const [posts, categories] = await Promise.all([
    getPosts({ limit: 12, page, category: categorySlug }),
    getCategories(),
  ]);

  const currentCategory = categorySlug
    ? categories.find((c: Category) => c.slug === categorySlug)
    : null;

  return (
    <div className="bg-surface-alt min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-border">
        <div className="container py-6">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-text-muted hover:text-primary transition-colors">
                  Početna
                </Link>
              </li>
              <li className="text-text-light">/</li>
              <li>
                <Link href="/vesti" className="text-text-muted hover:text-primary transition-colors">
                  Vesti
                </Link>
              </li>
              {currentCategory && (
                <>
                  <li className="text-text-light">/</li>
                  <li className="text-text font-medium">{currentCategory.name}</li>
                </>
              )}
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-text">
            {currentCategory ? currentCategory.name : 'Sve Vesti'}
          </h1>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white border-b border-border sticky top-[120px] md:top-[136px] z-40">
        <div className="container">
          <div className="flex items-center gap-1 overflow-x-auto py-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {categoryFilters.map((filter) => {
              const isActive = (!categorySlug && !filter.slug) || categorySlug === filter.slug;
              return (
                <Link
                  key={filter.slug}
                  href={filter.slug ? `/vesti?kategorija=${filter.slug}` : '/vesti'}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-surface-alt text-text-muted hover:bg-border hover:text-text'
                  }`}
                >
                  {filter.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <NewsCard key={post.id} post={post} variant="medium" />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <Link
                      href={`/vesti?${categorySlug ? `kategorija=${categorySlug}&` : ''}page=${page - 1}`}
                      className="px-4 py-2 bg-white border border-border rounded-lg text-text hover:border-primary hover:text-primary transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Prethodna
                      </span>
                    </Link>
                  )}

                  <span className="px-4 py-2 bg-primary text-white rounded-lg font-medium">
                    Strana {page}
                  </span>

                  {posts.length === 12 && (
                    <Link
                      href={`/vesti?${categorySlug ? `kategorija=${categorySlug}&` : ''}page=${page + 1}`}
                      className="px-4 py-2 bg-white border border-border rounded-lg text-text hover:border-primary hover:text-primary transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        Sledeća
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-border">
                <svg className="w-16 h-16 text-text-light mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="text-lg font-medium text-text mb-2">Nema vesti za prikaz</h3>
                <p className="text-text-muted mb-6">Trenutno nema vesti u ovoj kategoriji.</p>
                <Link
                  href="/vesti"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Pogledaj sve vesti
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Categories Widget */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Kategorije</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/vesti"
                    className={`flex items-center justify-between py-2 px-3 rounded-md transition-colors ${
                      !categorySlug
                        ? 'bg-primary text-white'
                        : 'text-text-muted hover:bg-surface-alt hover:text-primary'
                    }`}
                  >
                    <span>Sve kategorije</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
                {categories.map((category: Category) => (
                  <li key={category.id}>
                    <Link
                      href={`/vesti?kategorija=${category.slug}`}
                      className={`flex items-center justify-between py-2 px-3 rounded-md transition-colors ${
                        categorySlug === category.slug
                          ? 'bg-primary text-white'
                          : 'text-text-muted hover:bg-surface-alt hover:text-primary'
                      }`}
                    >
                      <span>{category.name}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter Widget */}
            <div className="sidebar-widget bg-gradient-to-br from-primary to-primary-dark text-white">
              <h3 className="text-lg font-bold mb-2">Newsletter</h3>
              <p className="text-primary-100 text-sm mb-4">
                Prijavite se za najnovije vesti direktno u vaš inbox.
              </p>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="Vaš email"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40"
                />
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-secondary text-dark font-medium rounded-lg hover:bg-secondary-700 transition-colors text-sm"
                >
                  Prijavi se
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
