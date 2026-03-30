import Link from 'next/link';
import { Metadata } from 'next';
import { getPosts, getCategories, getListings, Post, Category } from '@/lib/directus';
import NewsCard from '@/components/NewsCard';
import ListingCard from '@/components/ListingCard';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Gornji Milanovac - Digitalni Portal Šumadije',
  description: 'Najnovije vesti iz Gornjeg Milanovca i Takovskog kraja. Sport, kultura, ekonomija, hronika, mali oglasi i sve iz Šumadije.',
  openGraph: {
    title: 'Gornji Milanovac - Digitalni Portal Šumadije',
    description: 'Najnovije vesti iz Gornjeg Milanovca i Takovskog kraja.',
    type: 'website',
  },
};

async function getHomeData() {
  try {
    const [latestPosts, categories, listings] = await Promise.all([
      getPosts({ limit: 17 }),
      getCategories(),
      getListings({ limit: 3 }),
    ]);

    const categorySlugs = ['sport', 'kultura', 'ekonomija'];
    const categoryPosts: Record<string, Post[]> = {};

    for (const slug of categorySlugs) {
      try {
        const posts = await getPosts({ limit: 3, category: slug });
        categoryPosts[slug] = posts;
      } catch {
        categoryPosts[slug] = [];
      }
    }

    return {
      breakingNews: latestPosts.slice(0, 5),
      latestPosts: latestPosts.slice(1, 9),
      featuredPost: latestPosts[0] || null,
      categories,
      categoryPosts,
      listings,
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return {
      breakingNews: [],
      latestPosts: [],
      featuredPost: null,
      categories: [],
      categoryPosts: {},
      listings: [],
    };
  }
}

const importantPhones = [
  { name: 'Hitna pomoć', number: '194' },
  { name: 'Policija', number: '192' },
  { name: 'Vatrogasci', number: '193' },
  { name: 'Opština GM', number: '032/712-600' },
];

export default async function HomePage() {
  const { breakingNews, latestPosts, featuredPost, categories, categoryPosts, listings } = await getHomeData();

  return (
    <>
      {/* Breaking News Ticker */}
      <BreakingNewsTicker posts={breakingNews} />

      {/* Featured Hero */}
      {featuredPost && (
        <section className="bg-dark">
          <div className="container py-6 md:py-8">
            <NewsCard post={featuredPost} variant="featured" />
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column - 2/3 */}
          <div className="lg:col-span-2">
            <section>
              <div className="section-header">
                <h2 className="section-title">Najnovije Vesti</h2>
                <Link href="/vesti" className="section-link">
                  Sve vesti
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {latestPosts.map((post) => (
                  <NewsCard key={post.id} post={post} variant="medium" />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - 1/3 */}
          <aside className="space-y-6">
            {/* Categories */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Kategorije</h3>
              <ul className="space-y-1">
                {categories.map((category: Category) => (
                  <li key={category.id}>
                    <Link
                      href={`/vesti?kategorija=${category.slug}`}
                      className="flex items-center justify-between py-2 px-3 rounded-md text-text-muted hover:bg-surface-alt hover:text-primary transition-colors"
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

            {/* Weather Widget */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Vreme u Gornjem Milanovcu</h3>
              <a
                href="https://www.yr.no/en/forecast/daily-table/2-789128/Serbia/Central%20Serbia/Moravica/Gornji%20Milanovac"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg hover:from-primary/20 hover:to-secondary/20 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-sm font-medium text-text">Vremenska prognoza</span>
                  <span className="text-xs text-text-muted">Pogledaj na yr.no</span>
                </div>
                <svg className="w-4 h-4 text-text-light ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Listings Preview */}
            {listings.length > 0 && (
              <div className="sidebar-widget">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <h3 className="text-lg font-bold text-text">Oglasi</h3>
                  <Link href="/oglasi" className="text-xs text-primary hover:text-primary-dark font-medium">
                    Svi oglasi
                  </Link>
                </div>
                <div className="space-y-4">
                  {listings.slice(0, 3).map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            )}

            {/* Important Phones */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Važni Telefoni</h3>
              <ul className="space-y-2">
                {importantPhones.map((phone) => (
                  <li key={phone.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-text-muted">{phone.name}</span>
                    <a
                      href={`tel:${phone.number.replace(/[^0-9+]/g, '')}`}
                      className="font-bold text-primary hover:text-primary-dark"
                    >
                      {phone.number}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Category Sections */}
        {Object.entries(categoryPosts).map(([slug, posts]) => {
          if (posts.length === 0) return null;
          const categoryNames: Record<string, string> = {
            sport: 'Sport',
            kultura: 'Kultura',
            ekonomija: 'Ekonomija',
          };
          const categoryName = categoryNames[slug] || slug;

          return (
            <section key={slug} className="mt-12 md:mt-16">
              <div className="section-header">
                <h2 className="section-title">{categoryName}</h2>
                <Link href={`/vesti?kategorija=${slug}`} className="section-link">
                  Sve iz kategorije {categoryName.toLowerCase()}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <NewsCard key={post.id} post={post} variant="medium" />
                ))}
              </div>
            </section>
          );
        })}

        {/* Social CTA Strip */}
        <section className="mt-12 md:mt-16 bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Prati nas na društvenim mrežama
          </h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Budite prvi koji će saznati najnovije vesti iz Gornjeg Milanovca i okoline.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://facebook.com/gornjimilanovac"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/gornjimilanovac"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://t.me/gornjimilanovac"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Telegram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
