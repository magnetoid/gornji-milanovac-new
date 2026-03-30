import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, invalidateCache } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await db.query('SELECT * FROM vendors WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      ...row,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      rating: row.rating ? parseFloat(row.rating) : 0,
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'editor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      logo_url,
      cover_url,
      category,
      location,
      phone,
      email,
      website,
      facebook,
      instagram,
      working_hours,
      status,
      featured,
    } = body;

    const result = await db.query(`
      UPDATE vendors SET
        name = $1,
        slug = $2,
        description = $3,
        logo_url = $4,
        cover_url = $5,
        category = $6,
        location = $7,
        phone = $8,
        email = $9,
        website = $10,
        facebook = $11,
        instagram = $12,
        working_hours = $13,
        status = $14,
        featured = $15,
        updated_at = NOW()
      WHERE id = $16
      RETURNING *
    `, [
      name,
      slug,
      description || null,
      logo_url || null,
      cover_url || null,
      category || null,
      location || null,
      phone || null,
      email || null,
      website || null,
      facebook || null,
      instagram || null,
      working_hours || null,
      status,
      featured || false,
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    await invalidateCache('vendors:*');
    await invalidateCache(`vendor:${slug}`);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

// Special action routes
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'editor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const action = url.pathname.split('/').pop();

  try {
    let newStatus: string;

    switch (action) {
      case 'approve':
        newStatus = 'active';
        break;
      case 'suspend':
        newStatus = 'suspended';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await db.query(
      'UPDATE vendors SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING slug',
      [newStatus, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    await invalidateCache('vendors:*');
    await invalidateCache(`vendor:${result.rows[0].slug}`);

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('Error updating vendor status:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}
