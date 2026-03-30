import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, invalidateCache } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.query('SELECT * FROM settings ORDER BY group_name, key');

    // Group settings
    const grouped: Record<string, any[]> = {};
    const flat: Record<string, string> = {};

    for (const row of result.rows) {
      if (!grouped[row.group_name]) {
        grouped[row.group_name] = [];
      }
      grouped[row.group_name].push(row);
      flat[row.key] = row.value || '';
    }

    return NextResponse.json({ grouped, flat });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await db.query(
        'UPDATE settings SET value = $1 WHERE key = $2',
        [value as string, key]
      );
    }

    await invalidateCache('settings');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
