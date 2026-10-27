import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { importAllSources } from '@/lib/rss';

export const maxDuration = 300;

// POST /api/news-sources/import - "Preuzmi vesti sada" in /admin/izvori
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'editor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const target = new URL('/admin/izvori', request.url);
  try {
    const results = await importAllSources();
    if (results === null) {
      target.searchParams.set('uvoz', 'zauzeto');
    } else {
      target.searchParams.set('uvezeno', String(results.reduce((sum, r) => sum + r.imported, 0)));
      target.searchParams.set('greske', String(results.filter((r) => r.error).length));
    }
  } catch (error) {
    console.error('Manual RSS import failed:', error);
    target.searchParams.set('uvoz', 'greska');
  }
  return NextResponse.redirect(target, 303);
}
