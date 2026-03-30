import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, invalidateCache } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || 'published';
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT p.*,
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.color as cat_color,
             u.id as author_id, u.name as author_name
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.status = $1
    `;
    const params: any[] = [status];
    let paramIndex = 2;

    if (category) {
      query += ` AND c.slug = $${paramIndex++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const posts = result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      published_at: row.published_at?.toISOString() || null,
      status: row.status,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      featured_image: row.featured_image,
      author_id: row.author_id,
      category_id: row.category_id,
      tags: row.tags,
      view_count: row.view_count,
      featured: row.featured,
      source_name: row.source_name,
      source_url: row.source_url,
      locale: row.locale,
      category: row.cat_id ? {
        id: row.cat_id,
        name: row.cat_name,
        slug: row.cat_slug,
        color: row.cat_color,
      } : null,
      author: row.author_id ? {
        id: row.author_id,
        name: row.author_name,
      } : null,
    }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'editor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      status = 'draft',
      category_id,
      tags,
      featured_image,
      featured = false,
      locale = 'sr',
      source_name,
      source_url,
      published_at,
    } = body;

    const result = await db.query(`
      INSERT INTO posts (title, slug, content, excerpt, status, category_id, tags, featured_image, featured, locale, source_name, source_url, published_at, author_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      title,
      slug,
      content || null,
      excerpt || null,
      status,
      category_id || null,
      tags || null,
      featured_image || null,
      featured,
      locale,
      source_name || null,
      source_url || null,
      published_at || (status === 'published' ? new Date().toISOString() : null),
      (session.user as any).id,
    ]);

    await invalidateCache('posts:*');

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
