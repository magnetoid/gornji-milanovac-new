import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, invalidateCache } from '@/lib/db';
import { isEventCategory } from '@/lib/events';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'editor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, starts_at, category, location, description, url } = body;

    // starts_at comes from <input type="datetime-local">: "2026-10-31T09:00", Belgrade time
    if (!title || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(starts_at || '')) {
      return NextResponse.json({ error: 'Naslov i vreme početka su obavezni' }, { status: 400 });
    }

    const result = await db.query(`
      INSERT INTO events (title, starts_at, category, location, description, url)
      VALUES ($1, $2::timestamp AT TIME ZONE 'Europe/Belgrade', $3, $4, $5, $6)
      RETURNING *
    `, [
      title,
      starts_at,
      isEventCategory(category) ? category : null,
      location || null,
      description || null,
      url || null,
    ]);

    await invalidateCache('events:*');

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
