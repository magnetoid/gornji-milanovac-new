import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { Metadata } from 'next';
import { getPosts, getCategories, getListings, getVendors, Post, Category, Vendor, getMarketplaceStats } from '@/lib/api';
import NewsCard from '@/components/NewsCard';
import ListingCard from '@/components/ListingCard';
import VendorCard from '@/components/VendorCard';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function ensureNoCache() { try { noStore(); } catch {} }

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
  ensureNoCache();
  try {
    const [latestPosts, categories, listings, vendors, stats] = await Promise.all([
      getPosts({ limit: 20 }),
      getCategories(),
      getListings({ limit: 4 }),
      getVendors({ limit: 4, featured: true }),
      getMarketplaceStats(),
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
      breakingNews: latestPosts.slice(0, 7),
      heroPost: latestPosts[0] || null,
      sidebarPosts: latestPosts.slice(1, 4),
      latestPosts: latestPosts.slice(4, 12),
      topPosts: latestPosts.slice(0, 5),
      categories,
      categoryPosts,
      listings,
      vendors,
      stats,
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return {
      breakingNews: [],
      heroPost: null,
      sidebarPosts: [],
      latestPosts: [],
      topPosts: [],
      categories: [],
      categoryPosts: {},
      listings: [],
      vendors: [],
      stats: { vendors: 0, products: 0, services: 0 },
    };
  }
}

const quickLinks = [
  { name: 'Opština GM', href: 'https://www.gornjimilanovac.rs', icon: '🏛️' },
  { name: 'Dom zdravlja', href: 'https://dz-gornjimilanovac.rs', icon: '🏥' },
  { name: 'Hitna pomoć', href: 'tel:194', icon: '🚑' },
  { name: 'MUP', href: 'https://www.mup.gov.rs', icon: '👮' },
];

export default async function HomePage() {
  const { breakingNews, heroPost, sidebarPosts, latestPosts, topPosts, categories, categoryPosts, listings, vendors, stats } = await getHomeData();

  return (
    <>
      {/* Breaking News Ticker */}
      <BreakingNewsTicker posts={breakingNews} />

      {/* HERO SECTION */}
      <section className="bg-surface-muted py-6 md:py-8">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hero Post - 2/3 width */}
            <div className="lg:col-span-2">
              {heroPost ? (
                <NewsCard post={heroPost} variant="hero" />
              ) : (
                <div className="aspect-[16/9] md:aspect-[21/9] bg-surface rounded-xl border border-border flex items-center justify-center">
                  <p className="text-text-muted">Nema vesti za prikaz</p>
                </div>
              )}
            </div>

            {/* Sidebar Posts - 1/3 width */}
            <div className="space-y-4">
              {sidebarPosts.length > 0 ? (
                sidebarPosts.map((post) => (
                  <NewsCard key={post.id} post={post} variant="list" />
                ))
              ) : (
                <div className="p-4 bg-surface rounded-lg border border-border text-center text-text-muted text-sm">
                  Nema dodatnih vesti
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER - Latest News */}
      <div className="bg-surface-warm py-2">
        <div className="container">
          <div className="flex items-center justify-between py-4 border-b border-border">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-text">Najnovije vesti</h2>
            <Link href="/vesti" className="section-link">
              Sve vesti
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* NEWS GRID */}
      <section className="bg-surface-warm py-8">
        <div className="container">
          {latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {latestPosts.map((post) => (
                <NewsCard key={post.id} post={post} variant="feature" />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-text-muted">
              Nema vesti za prikaz
            </div>
          )}
        </div>
      </section>

      {/* SECTION DIVIDER WITH ACCENT */}
      <div className="border-t-2 border-accent" />

      {/* CATEGORY SECTIONS */}
      <section className="bg-surface-warm py-10">
        <div className="container space-y-12">
          {Object.entries(categoryPosts).map(([slug, posts]) => {
            if (posts.length === 0) return null;
            const categoryNames: Record<string, string> = {
              sport: 'Sport',
              kultura: 'Kultura',
              ekonomija: 'Ekonomija',
            };
            const categoryName = categoryNames[slug] || slug;

            return (
              <div key={slug}>
                <div className="section-header">
                  <h2 className="section-title">{categoryName}</h2>
                  <Link href={`/vesti?kategorija=${slug}`} className="section-link">
                    Sve iz {categoryName.toLowerCase()}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <NewsCard key={post.id} post={post} variant="feature" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2-COLUMN LAYOUT: Marketplace + Sidebar */}
      <section className="bg-surface py-10 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Marketplace Teaser (2/3) */}
            <div className="lg:col-span-2">
              <div className="section-header">
                <h2 className="section-title">Lokalni Marketplace</h2>
                <Link href="/marketplace" className="section-link">
                  Svi prodavci
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {vendors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vendors.slice(0, 4).map((vendor: Vendor) => (
                    <VendorCard key={vendor.id} vendor={vendor} />
                  ))}
                </div>
              ) : (
                <div className="bg-surface-muted rounded-xl p-8 text-center">
                  <p className="text-text-muted mb-4">Marketplace je trenutno prazan</p>
                  <Link href="/marketplace/registracija" className="btn-primary">
                    Registruj svoj biznis
                  </Link>
                </div>
              )}

              {/* Marketplace Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-surface-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats.vendors}</p>
                  <p className="text-sm text-text-muted">Prodavaca</p>
                </div>
                <div className="bg-surface-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats.products}</p>
                  <p className="text-sm text-text-muted">Proizvoda</p>
                </div>
                <div className="bg-surface-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats.services}</p>
                  <p className="text-sm text-text-muted">Usluga</p>
                </div>
              </div>
            </div>

            {/* Right - Sidebar Widgets (1/3) */}
            <aside className="space-y-6">
              {/* Weather Widget */}
              <div className="sidebar-widget">
                <h3 className="sidebar-widget-title">Vreme</h3>
                <a
                  href="https://www.yr.no/en/forecast/daily-table/2-789128/Serbia/Central%20Serbia/Moravica/Gornji%20Milanovac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg hover:from-primary/10 hover:to-accent/10 transition-all"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="block font-medium text-text">Gornji Milanovac</span>
                    <span className="text-sm text-text-muted">Pogledaj prognozu</span>
                  </div>
                  <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Quick Links */}
              <div className="sidebar-widget">
                <h3 className="sidebar-widget-title">Korisni linkovi</h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-surface-muted rounded-lg text-sm text-text-secondary hover:bg-primary/5 hover:text-primary transition-all"
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span className="font-medium">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Top 5 Posts */}
              {topPosts.length > 0 && (
                <div className="sidebar-widget">
                  <h3 className="sidebar-widget-title">Najčitanije</h3>
                  <div className="space-y-4">
                    {topPosts.map((post, index) => (
                      <NewsCard key={post.id} post={post} variant="mini" index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* Oglasi Preview */}
              {listings.length > 0 && (
                <div className="sidebar-widget">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                    <h3 className="text-lg font-bold text-text">Oglasi</h3>
                    <Link href="/oglasi" className="text-xs text-primary hover:text-primary-dark font-medium">
                      Svi oglasi
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {listings.slice(0, 2).map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* FULL-WIDTH CTA */}
      <section className="bg-primary py-12 md:py-16">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-4">
            Jesi li iz Gornjeg Milanovca? Pridruži se zajednici!
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto text-lg">
            Postavi oglas, registruj svoj biznis na marketplace-u, ili nas jednostavno kontaktiraj.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/oglasi/novi"
              className="px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-primary-50 transition-colors"
            >
              Dodaj oglas
            </Link>
            <Link
              href="/marketplace/registracija"
              className="px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-dark transition-colors"
            >
              Registruj prodavca
            </Link>
            <Link
              href="/kontakt"
              className="px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
            >
              Kontaktiraj nas
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
