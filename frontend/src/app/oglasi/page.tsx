import { Metadata } from 'next';
import Link from 'next/link';
import { getListings, getListingCategories, ListingCategory } from '@/lib/directus';
import ListingCard from '@/components/ListingCard';

export const revalidate = 60;

interface PageProps {
  searchParams: { kategorija?: string; page?: string; q?: string };
}

const categoryFilters = [
  { name: 'Sve', slug: '' },
  { name: 'Nekretnine', slug: 'nekretnine' },
  { name: 'Vozila', slug: 'vozila' },
  { name: 'Usluge', slug: 'usluge' },
  { name: 'Ostalo', slug: 'ostalo' },
];

export const metadata: Metadata = {
  title: 'Mali Oglasi',
  description: 'Pregledajte male oglase u Gornjem Milanovcu i okolini. Nekretnine, vozila, usluge i više.',
  openGraph: {
    title: 'Mali Oglasi | Gornji Milanovac',
    description: 'Pregledajte male oglase u Gornjem Milanovcu i okolini.',
  },
};

export default async function OglasiPage({ searchParams }: PageProps) {
  const categorySlug = searchParams.kategorija;
  const page = parseInt(searchParams.page || '1', 10);
  const searchQuery = searchParams.q;

  const [listings, categories] = await Promise.all([
    getListings({ limit: 12, page, category: categorySlug }),
    getListingCategories(),
  ]);

  const filteredListings = searchQuery
    ? listings.filter((listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings;

  return (
    <div className="bg-surface-alt min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            Mali Oglasi
          </h1>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl">
            Pronađite šta vam treba ili postavite svoj oglas. Nekretnine, vozila, usluge i više u Gornjem Milanovcu.
          </p>

          {/* Search Form */}
          <form method="get" className="mt-6 flex max-w-lg">
            <input
              type="text"
              name="q"
              placeholder="Pretraži oglase..."
              defaultValue={searchQuery}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-secondary text-dark font-medium rounded-r-lg hover:bg-secondary-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
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
                  href={filter.slug ? `/oglasi?kategorija=${filter.slug}` : '/oglasi'}
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
          <div className="lg:col-span-3 lg:order-1">
            {filteredListings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <Link
                      href={`/oglasi?${categorySlug ? `kategorija=${categorySlug}&` : ''}page=${page - 1}`}
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

                  {listings.length === 12 && (
                    <Link
                      href={`/oglasi?${categorySlug ? `kategorija=${categorySlug}&` : ''}page=${page + 1}`}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-text mb-2">Nema oglasa za prikaz</h3>
                <p className="text-text-muted mb-6">
                  {searchQuery
                    ? `Nema rezultata za "${searchQuery}"`
                    : 'Trenutno nema oglasa u ovoj kategoriji.'}
                </p>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Postavi prvi oglas
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:order-2 space-y-6">
            {/* Post Ad CTA */}
            <div className="sidebar-widget bg-gradient-to-br from-secondary to-secondary-800 text-dark">
              <h3 className="text-lg font-bold mb-2">Dodaj Oglas</h3>
              <p className="text-sm mb-4 opacity-90">
                Imate nešto za prodaju? Postavite besplatno svoj oglas.
              </p>
              <Link
                href="/kontakt"
                className="block w-full text-center py-3 bg-dark text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Postavi Oglas
              </Link>
            </div>

            {/* Categories Widget */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Kategorije</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/oglasi"
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
                {categories.map((category: ListingCategory) => (
                  <li key={category.id}>
                    <Link
                      href={`/oglasi?kategorija=${category.slug}`}
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

            {/* Tips Widget */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Saveti za kupce</h3>
              <ul className="space-y-3 text-sm text-text-muted">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Uvek proverite artikal pre kupovine</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Ne plaćajte unapred nepoznatim prodavcima</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Sastajte se na javnom mestu</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
