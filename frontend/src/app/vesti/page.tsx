import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, getCategories, Category } from '@/lib/api';
import NewsCard from '@/components/NewsCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function ensureNoCache() { try { noStore(); } catch {} }

interface PageProps {
  searchParams: { kategorija?: string; page?: string };
}

const categoryFilters = [
  { name: 'Sve', slug: '', color: 'primary' },
  { name: 'Sport', slug: 'sport', color: 'blue' },
  { name: 'Kultura', slug: 'kultura', color: 'purple' },
  { name: 'Ekonomija', slug: 'ekonomija', color: 'emerald' },
  { name: 'Hronika', slug: 'hronika', color: 'orange' },
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
  ensureNoCache();
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
    <div className="bg-surface-warm min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-border">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-sm">
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
              {currentCategory && (
                <>
                  <li className="text-text-muted">/</li>
                  <li className="text-text font-medium">{currentCategory.name}</li>
                </>
              )}
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-text">
            {currentCategory ? currentCategory.name : 'Sve Vesti'}
          </h1>
          <p className="text-text-muted mt-2">
            Najnovije vesti iz Gornjeg Milanovca i Takovskog kraja
          </p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="bg-white border-b border-border sticky top-[104px] z-40">
        <div className="container">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {categoryFilters.map((filter) => {
              const isActive = (!categorySlug && !filter.slug) || categorySlug === filter.slug;
              return (
                <Link
                  key={filter.slug}
                  href={filter.slug ? `/vesti?kategorija=${filter.slug}` : '/vesti'}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-muted text-text-secondary hover:bg-border hover:text-text'
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
                    <NewsCard key={post.id} post={post} variant="feature" />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-3 mt-12">
                  {page > 1 && (
                    <Link
                      href={`/vesti?${categorySlug ? `kategorija=${categorySlug}&` : ''}page=${page - 1}`}
                      className="px-5 py-2.5 bg-white border border-border rounded-lg text-text hover:border-primary hover:text-primary transition-all shadow-sm"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Prethodna
                      </span>
                    </Link>
                  )}

                  <span className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium shadow-sm">
                    Strana {page}
                  </span>

                  {posts.length === 12 && (
                    <Link
                      href={`/vesti?${categorySlug ? `kategorija=${categorySlug}&` : ''}page=${page + 1}`}
                      className="px-5 py-2.5 bg-white border border-border rounded-lg text-text hover:border-primary hover:text-primary transition-all shadow-sm"
                    >
                      <span className="flex items-center gap-2">
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
              <div className="text-center py-16 bg-white rounded-xl border border-border">
                <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="text-xl font-serif font-bold text-text mb-2">Nema vesti za prikaz</h3>
                <p className="text-text-muted mb-6">Trenutno nema vesti u ovoj kategoriji.</p>
                <Link
                  href="/vesti"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
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
                    className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all ${
                      !categorySlug
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface-muted hover:text-primary'
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
                      className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all ${
                        categorySlug === category.slug
                          ? 'bg-primary text-white'
                          : 'text-text-secondary hover:bg-surface-muted hover:text-primary'
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
            <div className="sidebar-widget bg-gradient-to-br from-primary to-primary-dark text-white border-none">
              <h3 className="text-lg font-bold mb-2">Newsletter</h3>
              <p className="text-white/80 text-sm mb-4">
                Prijavite se za najnovije vesti direktno u vaš inbox.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Vaš email"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 transition-all"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-accent-dark transition-colors text-sm"
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
