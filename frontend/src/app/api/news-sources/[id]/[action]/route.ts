import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirectBack } from '@/lib/admin-redirect';

// POST /api/news-sources/:id/enable | /disable | /delete - buttons in /admin/izvori
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const { id, action } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'editor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let result;
    if (action === 'delete') {
      // Posts already imported from the source stay
      result = await db.query('DELETE FROM news_sources WHERE id = $1 RETURNING id', [id]);
    } else if (action === 'enable' || action === 'disable') {
      result = await db.query('UPDATE news_sources SET enabled = $1 WHERE id = $2 RETURNING id', [action === 'enable', id]);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }
    return redirectBack(request, '/admin/izvori');
  } catch (error) {
    console.error('Error updating news source:', error);
    return NextResponse.json({ error: 'Failed to update news source' }, { status: 500 });
  }
}
