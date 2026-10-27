import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const date = new Date();
    const yearMonth = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    const uploadPath = join(UPLOAD_DIR, yearMonth);
    await mkdir(uploadPath, { recursive: true });

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const filename = `${randomUUID()}.${ext}`;
    const filePath = join(uploadPath, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Return URL
    const url = `${yearMonth}/${filename}`;
    const fullUrl = `${process.env.NEXT_PUBLIC_UPLOAD_URL || '/uploads'}/${url}`;

    // Media library record; the file is already saved, so a failure here is only logged
    try {
      await db.query(`
        INSERT INTO media (filename, original_name, mime_type, size_bytes, url, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, (SELECT id FROM users WHERE id::text = $6))
      `, [url, file.name.slice(0, 255), file.type, file.size, fullUrl, String((session.user as any).id || '')]);
    } catch (error) {
      console.error('Error saving media record:', error);
    }

    return NextResponse.json({
      success: true,
      url,
      fullUrl,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// App Router handles multipart/form-data natively - no config needed
