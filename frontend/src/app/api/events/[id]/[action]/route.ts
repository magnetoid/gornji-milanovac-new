import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, invalidateCache } from '@/lib/db';
import { redirectBack } from '@/lib/admin-redirect';

// POST /api/events/:id/cancel | /publish | /delete - buttons in /admin/dogadjaji
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
      result = await db.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
    } else if (action === 'cancel' || action === 'publish') {
      result = await db.query(
        'UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
        [action === 'cancel' ? 'cancelled' : 'published', id]
      );
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await invalidateCache('events:*');

    return redirectBack(request, '/admin/dogadjaji');
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}
