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
    const result = await db.query(`
      SELECT l.*,
             lc.id as cat_id, lc.name as cat_name, lc.slug as cat_slug, lc.icon as cat_icon
      FROM listings l
      LEFT JOIN listing_categories lc ON l.category_id = lc.id
      WHERE l.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      expires_at: row.expires_at?.toISOString() || null,
      status: row.status,
      title: row.title,
      slug: row.slug,
      description: row.description,
      price: row.price ? parseFloat(row.price) : null,
      price_type: row.price_type,
      images: row.images,
      category_id: row.category_id,
      location: row.location,
      contact_name: row.contact_name,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      views: row.views,
      featured: row.featured,
      category: row.cat_id ? {
        id: row.cat_id,
        name: row.cat_name,
        slug: row.cat_slug,
        icon: row.cat_icon,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
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
      title,
      slug,
      description,
      price,
      price_type,
      images,
      category_id,
      location,
      contact_name,
      contact_phone,
      contact_email,
      status,
      featured,
    } = body;

    const result = await db.query(`
      UPDATE listings SET
        title = $1,
        slug = $2,
        description = $3,
        price = $4,
        price_type = $5,
        images = $6,
        category_id = $7,
        location = $8,
        contact_name = $9,
        contact_phone = $10,
        contact_email = $11,
        status = $12,
        featured = $13,
        updated_at = NOW()
      WHERE id = $14
      RETURNING *
    `, [
      title,
      slug,
      description || null,
      price || null,
      price_type,
      images || null,
      category_id || null,
      location || null,
      contact_name || null,
      contact_phone || null,
      contact_email || null,
      status,
      featured || false,
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    await invalidateCache('listings:*');
    await invalidateCache(`listing:${slug}`);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'editor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await db.query(
      'UPDATE listings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING slug',
      ['deleted', id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    await invalidateCache('listings:*');
    await invalidateCache(`listing:${result.rows[0].slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}
