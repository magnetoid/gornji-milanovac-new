import Link from 'next/link';
import { db } from '@/lib/db';

interface SearchParams {
  status?: string;
  search?: string;
  page?: string;
}

async function getPosts(options: { status?: string; search?: string; page?: number }) {
  const { status, search, page = 1 } = options;
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = `
    SELECT p.id, p.title, p.slug, p.status, p.published_at, p.created_at, p.view_count,
           c.name as category_name, c.slug as category_slug,
           u.name as author_name
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.author_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (status && status !== 'all') {
    query += ` AND p.status = $${paramIndex++}`;
    params.push(status);
  }

  if (search) {
    query += ` AND (p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await db.query(query, params);
  return result.rows;
}

async function getPostsCount(options: { status?: string; search?: string }) {
  const { status, search } = options;

  let query = 'SELECT COUNT(*) FROM posts p WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (status && status !== 'all') {
    query += ` AND p.status = $${paramIndex++}`;
    params.push(status);
  }

  if (search) {
    query += ` AND (p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count, 10);
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    archived: 'bg-yellow-100 text-yellow-800',
  };
  const labels: Record<string, string> = {
    published: 'Objavljeno',
    draft: 'Nacrt',
    scheduled: 'Zakazano',
    archived: 'Arhivirano',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
}

export default async function VestiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = params.status || 'all';
  const search = params.search || '';
  const page = parseInt(params.page || '1', 10);

  const [posts, totalCount] = await Promise.all([
    getPosts({ status: status === 'all' ? undefined : status, search, page }),
    getPostsCount({ status: status === 'all' ? undefined : status, search }),
  ]);

  const totalPages = Math.ceil(totalCount / 20);

  const statuses = [
    { value: 'all', label: 'Sve' },
    { value: 'published', label: 'Objavljeno' },
    { value: 'draft', label: 'Nacrt' },
    { value: 'scheduled', label: 'Zakazano' },
    { value: 'archived', label: 'Arhivirano' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vesti</h1>
          <p className="text-gray-600">Upravljanje vestima i člancima</p>
        </div>
        <Link
          href="/admin/vesti/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova vest
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <form className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            {statuses.map((s) => (
              <Link
                key={s.value}
                href={`/admin/vesti?status=${s.value}${search ? `&search=${search}` : ''}`}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  status === s.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>

          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Pretraži vesti..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naslov</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategorija</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pregledi</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Nema vesti koje odgovaraju kriterijumima
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/vesti/${post.id}/edit`} className="text-gray-900 hover:text-green-600 font-medium line-clamp-1">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.category_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.author_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(post.published_at || post.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.view_count || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/vesti/${post.id}/edit`}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Uredi"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/vesti/${post.slug}`}
                        target="_blank"
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Pogledaj na sajtu"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Prikazano {posts.length} od {totalCount} vesti
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/vesti?status=${status}&search=${search}&page=${page - 1}`}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Prethodna
                </Link>
              )}
              <span className="text-sm text-gray-500">
                Strana {page} od {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/admin/vesti?status=${status}&search=${search}&page=${page + 1}`}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Sledeća
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
