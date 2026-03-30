import { NextRequest, NextResponse } from 'next/server';
import { db, invalidateCache } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || 'active';
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const offset = (page - 1) * limit;

  try {
    let query = `SELECT * FROM vendors WHERE status = $1`;
    const params: any[] = [status];
    let paramIndex = 2;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (featured === 'true') {
      query += ` AND featured = true`;
    }

    query += ` ORDER BY featured DESC, created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const vendors = result.rows.map(row => ({
      ...row,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      rating: row.rating ? parseFloat(row.rating) : 0,
    }));

    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    } = body;

    // Generate slug if not provided
    const finalSlug = slug || name
      .toLowerCase()
      .replace(/[čć]/g, 'c')
      .replace(/[đ]/g, 'dj')
      .replace(/[š]/g, 's')
      .replace(/[ž]/g, 'z')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Public vendors start as pending
    const result = await db.query(`
      INSERT INTO vendors (name, slug, description, logo_url, cover_url, category, location, phone, email, website, facebook, instagram, working_hours, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
      RETURNING *
    `, [
      name,
      finalSlug,
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
    ]);

    await invalidateCache('vendors:*');

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
