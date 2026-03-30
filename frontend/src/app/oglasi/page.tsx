import { Metadata } from 'next';
import Link from 'next/link';
import { getListings, getListingCategories, ListingCategory } from '@/lib/directus';
import ListingCard from '@/components/ListingCard';

export const revalidate = 60;

interface PageProps {
  searchParams: { kategorija?: string; page?: string; q?: string };
}

export const metadata: Metadata = {
  title: 'Mali Oglasi',
  description: 'Pregledajte male oglase u Gornjem Milanovcu i okolini. Kupovina, prodaja, usluge i više.',
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

  const currentCategory = categorySlug
    ? categories.find((c: ListingCategory) => c.slug === categorySlug)
    : null;

  const filteredListings = searchQuery
    ? listings.filter((listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings;

  return (
    <div className="container py-8">
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
          <li className="text-gray-900 font-medium">Oglasi</li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          {currentCategory ? currentCategory.name : 'Mali Oglasi'}
        </h1>

        <form method="get" className="flex">
          <input
            type="text"
            name="q"
            placeholder="Pretraži oglase..."
            defaultValue={searchQuery}
            className="px-4 py-2 border border-gray-300 rounded-l-md focus:ring-primary focus:border-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:order-2">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Kategorije</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/oglasi"
                  className={`flex items-center justify-between py-2 px-3 rounded-md transition-colors ${
                    !categorySlug
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>Sve kategorije</span>
                </Link>
              </li>
              {categories.map((category: ListingCategory) => (
                <li key={category.id}>
                  <Link
                    href={`/oglasi?kategorija=${category.slug}`}
                    className={`flex items-center justify-between py-2 px-3 rounded-md transition-colors ${
                      categorySlug === category.slug
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
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

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/kontakt"
                className="block w-full text-center py-3 bg-secondary text-gray-900 font-medium rounded-md hover:bg-secondary-700"
              >
                Postavi Oglas
              </Link>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3 lg:order-1">
          {filteredListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              <div className="flex justify-center mt-8 space-x-2">
                {page > 1 && (
                  <Link
                    href={`/oglasi?${categorySlug ? `kategorija=${categorySlug}&` : ''}page=${page - 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Prethodna
                  </Link>
                )}
                <span className="px-4 py-2 bg-primary text-white rounded-md">
                  {page}
                </span>
                {listings.length === 12 && (
                  <Link
                    href={`/oglasi?${categorySlug ? `kategorija=${categorySlug}&` : ''}page=${page + 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Sledeća
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg mb-4">Nema oglasa za prikaz.</p>
              <Link
                href="/kontakt"
                className="inline-flex items-center text-primary hover:text-primary-800 font-medium"
              >
                Budi prvi - postavi oglas
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
