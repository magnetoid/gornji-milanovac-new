import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, invalidateCache } from '@/lib/db';
import { redirectBack } from '@/lib/admin-redirect';

const statusForAction: Record<string, string> = {
  approve: 'active',
  suspend: 'suspended',
};

// POST /api/vendors/:id/approve | /suspend - moderation forms in /admin/marketplace/prodavci
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
    const result = await db.query(
      'UPDATE vendors SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING slug',
      [newStatus, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    await invalidateCache('vendors:*');
    await invalidateCache(`vendor:${result.rows[0].slug}`);

    return redirectBack(request, '/admin/marketplace/prodavci');
  } catch (error) {
    console.error('Error updating vendor status:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}
