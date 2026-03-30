import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const vendorId = searchParams.get('vendorId');
  const category = searchParams.get('category');
  const bookingEnabled = searchParams.get('bookingEnabled');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT s.*,
             v.id as v_id, v.name as vendor_name, v.slug as vendor_slug,
             v.logo_url as vendor_logo, v.location as vendor_location
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.status = 'active'
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (vendorId) {
      query += ` AND s.vendor_id = $${paramIndex++}`;
      params.push(vendorId);
    }

    if (category) {
      query += ` AND s.category = $${paramIndex++}`;
      params.push(category);
    }

    if (bookingEnabled === 'true') {
      query += ` AND s.booking_enabled = true`;
    }

    query += ` ORDER BY s.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const services = result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      status: row.status,
      vendor_id: row.vendor_id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      price_from: row.price_from ? parseFloat(row.price_from) : null,
      price_label: row.price_label,
      images: row.images,
      category: row.category,
      duration_minutes: row.duration_minutes,
      booking_enabled: row.booking_enabled,
      available_days: row.available_days,
      available_hours_start: row.available_hours_start,
      available_hours_end: row.available_hours_end,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      vendor: row.v_id ? {
        id: row.v_id,
        name: row.vendor_name,
        slug: row.vendor_slug,
        logo_url: row.vendor_logo,
        location: row.vendor_location,
      } : null,
    }));

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
