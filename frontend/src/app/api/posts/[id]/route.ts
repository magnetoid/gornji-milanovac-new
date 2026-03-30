import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, invalidateCache } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await db.query(`
      SELECT p.*,
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.color as cat_color,
             u.id as author_id, u.name as author_name
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      status,
      category_id,
      tags,
      featured_image,
      featured,
      locale,
      source_name,
      source_url,
      published_at,
    } = body;

    const result = await db.query(`
      UPDATE posts SET
        title = $1,
        slug = $2,
        content = $3,
        excerpt = $4,
        status = $5,
        category_id = $6,
        tags = $7,
        featured_image = $8,
        featured = $9,
        locale = $10,
        source_name = $11,
        source_url = $12,
        published_at = $13,
        updated_at = NOW()
      WHERE id = $14
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
      featured || false,
      locale || 'sr',
      source_name || null,
      source_url || null,
      published_at || null,
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await invalidateCache('posts:*');
    await invalidateCache(`post:${slug}`);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'editor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Soft delete - set status to archived
    const result = await db.query(
      'UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING slug',
      ['archived', id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await invalidateCache('posts:*');
    await invalidateCache(`post:${result.rows[0].slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
