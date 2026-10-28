import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCategoryBySlug, getPageBySlug, getPostBySlug, Page } from '@/lib/api';
import { sanitizeContent } from '@/lib/sanitize';

// Catches every path no other route handles: old WordPress URLs and CMS pages.
//   /<post-slug>/, /2024/03/<post-slug>/      -> 301 to /vesti/<post-slug>
//   /kategorija/vesti/blic/<cat>/             -> 301 to /vesti?kategorija=<cat>
//   /poslovi-gornji-milanovac/, /o-gradu/x/   -> page from the pages table
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { legacy: string[] };
}

function segmentsOf(params: PageProps['params']): string[] {
  return params.legacy.map((s) => decodeURIComponent(s)).filter(Boolean);
}

async function findPage(slug: string): Promise<Page | null> {
  try {
    return await getPageBySlug(slug);
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const segments = segmentsOf(params);
  const page = await findPage(segments[segments.length - 1] || '');
  if (!page) return { title: 'Stranica nije pronađena' };
  return {
    title: page.meta_title || page.title,
    description: page.meta_description || undefined,
  };
}

export default async function LegacyPage({ params }: PageProps) {
  try { noStore(); } catch {}
  const segments = segmentsOf(params);
  const slug = segments[segments.length - 1];
  if (!slug) notFound();

  if (segments[0] === 'kategorija' || segments[0] === 'category') {
    const category = await getCategoryBySlug(slug).catch(() => null);
    permanentRedirect(category ? `/vesti?kategorija=${encodeURIComponent(category.slug)}` : '/vesti');
  }
  if (segments[0] === 'tag' || slug === 'feed') {
    permanentRedirect('/vesti');
  }

  const post = await getPostBySlug(slug).catch(() => null);
  if (post && post.status === 'published') {
    permanentRedirect(`/vesti/${encodeURIComponent(post.slug)}`);
  }

  const page = await findPage(slug);
  if (!page) notFound();

  return (
    <div className="container pt-10 pb-[72px]">
      <nav className="font-mono text-xs uppercase tracking-[0.12em] text-primary mb-2" aria-label="Putanja">
        <Link href="/" className="text-primary">Gornji Milanovac</Link>
        {segments.length > 1 && <> · {segments[0].replace(/-/g, ' ')}</>}
      </nav>
      <h1 className="font-serif text-[36px] sm:text-[48px] font-medium tracking-[-0.02em] leading-[1.1] pb-6 mb-8 border-b border-border">
        {page.title}
      </h1>
      <div className="prose max-w-[70ch]" dangerouslySetInnerHTML={{ __html: sanitizeContent(page.content) }} />
    </div>
  );
}
