import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { extname, resolve, sep } from 'path';

const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR || './uploads');

// Only types that browsers will not run as a page on this origin
const contentTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
};

// GET /uploads/2026/10/<file> - files saved by /api/upload and migrated wp-content/uploads
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filePath = resolve(UPLOAD_DIR, ...path);
  const contentType = contentTypes[extname(filePath).toLowerCase()];

  if (!filePath.startsWith(UPLOAD_DIR + sep) || !contentType) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new NextResponse('Not found', { status: 404 });
    const data = await readFile(filePath);
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(info.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
