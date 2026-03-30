import { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, getCategories, Category } from '@/lib/directus';
import NewsCard from '@/components/NewsCard';

export const revalidate = 60;

interface PageProps {
  searchParams: { kategorija?: string; page?: string };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const categorySlug = searchParams.kategorija;
  let title = 'Vesti';
  let description = 'Najnovije vesti iz Gornjeg Milanovca i okoline.';

  if (categorySlug) {
    const categories = await getCategories();
    const category = categories.find((c: Category) => c.slug === categorySlug);
    if (category) {
      title = `${category.name} - Vesti`;
      description = `Najnovije vesti iz kategorije ${category.name}.`;
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
          <li>
            <Link href="/vesti" className="hover:text-primary">
              Vesti
            </Link>
          </li>
          {currentCategory && (
            <>
              <li>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-gray-900 font-medium">{currentCategory.name}</li>
            </>
          )}
        </ol>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {currentCategory ? currentCategory.name : 'Sve Vesti'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>

              <div className="flex justify-center mt-8 space-x-2">
                {page > 1 && (
                  <Link
                    href={`/vesti?${categorySlug ? `kategorija=${categorySlug}&` : ''}page=${page - 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Prethodna
                  </Link>
                )}
                <span className="px-4 py-2 bg-primary text-white rounded-md">
                  {page}
                </span>
                {posts.length === 12 && (
                  <Link
                    href={`/vesti?${categorySlug ? `kategorija=${categorySlug}&` : ''}page=${page + 1}`}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-gray-500 text-lg">Nema vesti za prikaz.</p>
            </div>
          )}
        </div>

        <aside>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Kategorije</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/vesti"
                  className={`flex items-center justify-between py-2 px-3 rounded-md transition-colors ${
                    !categorySlug
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>Sve kategorije</span>
                </Link>
              </li>
              {categories.map((category: Category) => (
                <li key={category.id}>
                  <Link
                    href={`/vesti?kategorija=${category.slug}`}
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
          </div>
        </aside>
      </div>
    </div>
  );
}
