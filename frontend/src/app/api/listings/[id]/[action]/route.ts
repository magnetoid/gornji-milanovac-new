import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, invalidateCache } from '@/lib/db';
import { redirectBack } from '@/lib/admin-redirect';

const statusForAction: Record<string, string> = {
  approve: 'active',
  delete: 'deleted',
};

// POST /api/listings/:id/approve | /delete - moderation forms in /admin/oglasi
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const { id, action } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'editor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const newStatus = statusForAction[action];
  if (!newStatus) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    // Approving restarts the 30-day run from the moment it goes live
    const result = await db.query(
      `UPDATE listings SET status = $1, updated_at = NOW(),
         expires_at = CASE WHEN $3 THEN NOW() + INTERVAL '30 days' ELSE expires_at END
       WHERE id = $2 RETURNING slug`,
      [newStatus, id, newStatus === 'active']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    await invalidateCache('listings:*');
    await invalidateCache(`listing:${result.rows[0].slug}`);

    return redirectBack(request, '/admin/oglasi');
  } catch (error) {
    console.error('Error updating listing status:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}
