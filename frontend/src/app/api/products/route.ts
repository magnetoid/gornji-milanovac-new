import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const vendorId = searchParams.get('vendorId');
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT p.*,
             v.id as v_id, v.name as vendor_name, v.slug as vendor_slug,
             v.logo_url as vendor_logo, v.location as vendor_location
      FROM products p
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.status = 'active' AND p.available = true
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (vendorId) {
      query += ` AND p.vendor_id = $${paramIndex++}`;
      params.push(vendorId);
    }

    if (category) {
      query += ` AND p.category = $${paramIndex++}`;
      params.push(category);
    }

    if (featured === 'true') {
      query += ` AND p.featured = true`;
    }

    query += ` ORDER BY p.featured DESC, p.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const products = result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      status: row.status,
      vendor_id: row.vendor_id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      price: row.price ? parseFloat(row.price) : null,
      price_unit: row.price_unit,
      price_negotiable: row.price_negotiable,
      images: row.images,
      category: row.category,
      available: row.available,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      featured: row.featured,
      view_count: row.view_count,
      vendor: row.v_id ? {
        id: row.v_id,
        name: row.vendor_name,
        slug: row.vendor_slug,
        logo_url: row.vendor_logo,
        location: row.vendor_location,
      } : null,
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
