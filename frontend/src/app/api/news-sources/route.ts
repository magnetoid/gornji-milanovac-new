import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'editor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, feed_url, keywords, category_id } = await request.json();
    if (!name || !/^https?:\/\/\S+$/i.test(feed_url || '')) {
      return NextResponse.json({ error: 'Naziv i ispravna adresa feed-a su obavezni' }, { status: 400 });
    }

    const result = await db.query(`
      INSERT INTO news_sources (name, feed_url, keywords, category_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (feed_url) DO NOTHING
      RETURNING *
    `, [name.trim(), feed_url.trim(), keywords?.trim() || null, category_id || null]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Ovaj feed je već dodat' }, { status: 409 });
    }
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating news source:', error);
    return NextResponse.json({ error: 'Failed to create news source' }, { status: 500 });
  }
}
