import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JOBS, runJobNow } from '@/lib/jobs';

export const maxDuration = 300;

// POST /api/jobs/:name/run - "Pokreni sada" in /admin/zadaci
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!JOBS.some((job) => job.name === name)) {
    return NextResponse.json({ error: 'Unknown job' }, { status: 404 });
  }

  const target = new URL('/admin/zadaci', request.url);
  target.searchParams.set('zadatak', name);
  try {
    const result = await runJobNow(name);
    target.searchParams.set('rezultat', result ? result.status : 'zauzeto');
  } catch (error) {
    console.error(`Manual run of job ${name} failed:`, error);
    target.searchParams.set('rezultat', 'error');
  }
  return NextResponse.redirect(target, 303);
}
