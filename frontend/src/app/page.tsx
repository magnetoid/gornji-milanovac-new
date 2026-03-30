import Link from 'next/link';
import { Metadata } from 'next';
import { getPosts, getCategories, getListings, Post, Category } from '@/lib/directus';
import NewsCard from '@/components/NewsCard';
import ListingCard from '@/components/ListingCard';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Gornji Milanovac - Portal sa vestima iz Takova',
  description: 'Najnovije vesti iz Gornjeg Milanovca i okoline. Sport, kultura, ekonomija, mali oglasi i sve iz Takovskog kraja.',
  openGraph: {
    title: 'Gornji Milanovac - Portal',
    description: 'Najnovije vesti iz Gornjeg Milanovca i okoline.',
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
      latestPosts: latestPosts.slice(0, 12),
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

export default async function HomePage() {
  const { breakingNews, latestPosts, featuredPost, categories, categoryPosts, listings } = await getHomeData();

  return (
    <>
      <BreakingNewsTicker posts={breakingNews} />

      <div className="container py-8">
        {featuredPost && (
          <section className="mb-12">
            <NewsCard post={featuredPost} variant="featured" />
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Najnovije Vesti</h2>
                <Link
                  href="/vesti"
                  className="text-primary hover:text-primary-800 font-medium flex items-center"
                >
                  Sve vesti
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestPosts.slice(1, 13).map((post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Brzi Linkovi</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://www.gornjimilanovac.rs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-primary"
                  >
                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Opština Gornji Milanovac
                  </a>
                </li>
                <li>
                  <a
                    href="https://dz-gornjimilanovac.rs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-primary"
                  >
                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Dom Zdravlja
                  </a>
                </li>
                <li>
                  <Link
                    href="/oglasi"
                    className="flex items-center text-gray-700 hover:text-primary"
                  >
                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Mali Oglasi
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Kategorije</h3>
              <ul className="space-y-2">
                {categories.map((category: Category) => (
                  <li key={category.id}>
                    <Link
                      href={`/vesti?kategorija=${category.slug}`}
                      className="flex items-center justify-between text-gray-700 hover:text-primary py-1"
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
          </aside>
        </div>

        {Object.entries(categoryPosts).map(([slug, posts]) => {
          if (posts.length === 0) return null;
          const categoryName = slug === 'sport' ? 'Sport' : slug === 'kultura' ? 'Kultura' : 'Ekonomija';

          return (
            <section key={slug} className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{categoryName}</h2>
                <Link
                  href={`/vesti?kategorija=${slug}`}
                  className="text-primary hover:text-primary-800 font-medium flex items-center"
                >
                  Sve iz {categoryName.toLowerCase()}
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          );
        })}

        {listings.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Oglasi</h2>
              <Link
                href="/oglasi"
                className="text-primary hover:text-primary-800 font-medium flex items-center"
              >
                Svi oglasi
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
