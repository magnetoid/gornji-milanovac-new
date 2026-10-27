import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, getCategories, getNewsSources, Category } from '@/lib/api';
import { belgradeDayKey, formatDayHeading, formatEventDate } from '@/lib/format';
import NewsArchive, { ArchiveItem } from '@/components/NewsArchive';
import { OWN_SOURCE } from '@/components/NewsCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function ensureNoCache() { try { noStore(); } catch {} }

interface PageProps {
  searchParams: { kategorija?: string; page?: string };
}

const PAGE_SIZE = 30;

function hostOf(url: string | null): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function vestiHref(category: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set('kategorija', category);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/vesti?${query}` : '/vesti';
}

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
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);

  const [posts, categories, sourceRows] = await Promise.all([
    getPosts({ limit: PAGE_SIZE, page, category: categorySlug }).catch(() => []),
    getCategories().catch(() => [] as Category[]),
    getNewsSources().catch(() => []),
  ]);

  const currentCategory = categorySlug
    ? categories.find((c: Category) => c.slug === categorySlug)
    : null;

  const now = new Date();
  const items: ArchiveItem[] = posts.map((post) => {
    const date = post.published_at || post.created_at;
    return {
      post,
      time: formatEventDate(date).time,
      dayKey: belgradeDayKey(new Date(date)),
      dayHeading: formatDayHeading(date, now),
    };
  });

  const sources = sourceRows.map((row) => ({
    name: row.name || OWN_SOURCE,
    host: row.name ? hostOf(row.url) : 'gornji-milanovac.com',
  }));

  const tabs = [{ name: 'Sve', slug: '' }, ...categories.map((c) => ({ name: c.name, slug: c.slug }))];

  return (
    <div className="container pb-[72px]">
      <div className="flex flex-wrap items-end justify-between gap-5 pt-10 pb-6 border-b border-border">
        <div>
          <div className="eyebrow mb-2">
            Agregator · {sources.length} {sources.length === 1 ? 'izvor' : 'izvora'}
          </div>
          <h1 className="font-serif text-[36px] sm:text-[48px] font-medium tracking-[-0.02em] leading-[1.1]">
            {currentCategory ? currentCategory.name : 'Sve vesti'}
          </h1>
        </div>
        <nav
          className="flex gap-1 w-full sm:w-auto max-w-full overflow-x-auto scrollbar-hide shadow-[inset_0_-1px_0_#DDD7CA]"
          aria-label="Kategorije vesti"
        >
          {tabs.map((tab) => {
            const isActive = (categorySlug || '') === tab.slug;
            return (
              <Link
                key={tab.slug || 'sve'}
                href={vestiHref(tab.slug || undefined, 1)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 ${
                  isActive ? 'border-ink text-ink' : 'border-transparent text-text-muted hover:text-ink'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <NewsArchive items={items} sources={sources} />

      {(page > 1 || posts.length === PAGE_SIZE) && (
        <div className="flex items-center justify-center gap-3 pt-10">
          {page > 1 && (
            <Link href={vestiHref(categorySlug, page - 1)} className="btn-outline">← Novije</Link>
          )}
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-text-muted">Strana {page}</span>
          {posts.length === PAGE_SIZE && (
            <Link href={vestiHref(categorySlug, page + 1)} className="btn-outline">Starije →</Link>
          )}
        </div>
      )}
    </div>
  );
}
