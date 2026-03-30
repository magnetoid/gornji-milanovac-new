import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, invalidateCache } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const vendorId = searchParams.get('vendorId');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    let query = `
      SELECT b.*,
             s.title as service_title, s.slug as service_slug,
             v.name as vendor_name, v.slug as vendor_slug
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (vendorId) {
      query += ` AND b.vendor_id = $${paramIndex++}`;
      params.push(vendorId);
    }

    if (status) {
      query += ` AND b.status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY b.requested_date DESC, b.requested_time DESC LIMIT $${paramIndex++}`;
    params.push(limit);

    const result = await db.query(query, params);

    const bookings = result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      status: row.status,
      service_id: row.service_id,
      vendor_id: row.vendor_id,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      customer_phone: row.customer_phone,
      requested_date: row.requested_date?.toISOString?.() || String(row.requested_date),
      requested_time: row.requested_time,
      message: row.message,
      vendor_notes: row.vendor_notes,
      service: {
        title: row.service_title,
        slug: row.service_slug,
      },
      vendor: {
        name: row.vendor_name,
        slug: row.vendor_slug,
      },
    }));

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      service_id,
      vendor_id,
      customer_name,
      customer_email,
      customer_phone,
      requested_date,
      requested_time,
      message,
    } = body;

    if (!service_id || !vendor_id || !customer_name || !customer_email || !requested_date || !requested_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.query(`
      INSERT INTO bookings (service_id, vendor_id, customer_name, customer_email, customer_phone, requested_date, requested_time, message, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *
    `, [
      service_id,
      vendor_id,
      customer_name,
      customer_email,
      customer_phone || null,
      requested_date,
      requested_time,
      message || null,
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
