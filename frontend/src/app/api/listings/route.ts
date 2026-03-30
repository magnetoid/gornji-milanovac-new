import { NextRequest, NextResponse } from 'next/server';
import { db, invalidateCache } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || 'active';
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT l.*,
             lc.id as cat_id, lc.name as cat_name, lc.slug as cat_slug, lc.icon as cat_icon
      FROM listings l
      LEFT JOIN listing_categories lc ON l.category_id = lc.id
      WHERE l.status = $1
    `;
    const params: any[] = [status];
    let paramIndex = 2;

    if (category) {
      query += ` AND lc.slug = $${paramIndex++}`;
      params.push(category);
    }

    query += ` ORDER BY l.featured DESC, l.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const listings = result.rows.map(row => ({
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
    }));

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      price,
      price_type = 'fixed',
      images,
      category_id,
      location,
      contact_name,
      contact_phone,
      contact_email,
    } = body;

    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[čć]/g, 'c')
      .replace(/[đ]/g, 'dj')
      .replace(/[š]/g, 's')
      .replace(/[ž]/g, 'z')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    // Public listings start as pending
    const result = await db.query(`
      INSERT INTO listings (title, slug, description, price, price_type, images, category_id, location, contact_name, contact_phone, contact_email, status, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', NOW() + INTERVAL '30 days')
      RETURNING *
    `, [
      title,
      finalSlug,
      description || null,
      price || null,
      price_type,
      images || null,
      category_id || null,
      location || null,
      contact_name || null,
      contact_phone || null,
      contact_email || null,
    ]);

    await invalidateCache('listings:*');

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
