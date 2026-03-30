import Link from 'next/link';
import { db } from '@/lib/db';

interface SearchParams {
  status?: string;
  page?: string;
}

async function getListings(options: { status?: string; page?: number }) {
  const { status, page = 1 } = options;
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = `
    SELECT l.*, lc.name as category_name
    FROM listings l
    LEFT JOIN listing_categories lc ON l.category_id = lc.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (status && status !== 'all') {
    query += ` AND l.status = $${paramIndex++}`;
    params.push(status);
  }

  query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await db.query(query, params);
  return result.rows;
}

async function getListingsCount(status?: string) {
  let query = 'SELECT COUNT(*) FROM listings WHERE 1=1';
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ' AND status = $1';
    params.push(status);
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count, 10);
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatPrice(price: number | null): string {
  if (price === null) return '-';
  return new Intl.NumberFormat('sr-RS').format(price) + ' RSD';
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-gray-100 text-gray-800',
    deleted: 'bg-red-100 text-red-800',
  };
  const labels: Record<string, string> = {
    active: 'Aktivan',
    pending: 'Na čekanju',
    expired: 'Istekao',
    deleted: 'Obrisan',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

export default async function OglasiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = params.status || 'all';
  const page = parseInt(params.page || '1', 10);

  const [listings, totalCount] = await Promise.all([
    getListings({ status: status === 'all' ? undefined : status, page }),
    getListingsCount(status === 'all' ? undefined : status),
  ]);

  const totalPages = Math.ceil(totalCount / 20);

  const statuses = [
    { value: 'all', label: 'Svi' },
    { value: 'active', label: 'Aktivni' },
    { value: 'pending', label: 'Na čekanju' },
    { value: 'expired', label: 'Istekli' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Oglasi</h1>
          <p className="text-gray-600">Upravljanje malim oglasima</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center gap-2">
          {statuses.map((s) => (
            <Link
              key={s.value}
              href={`/admin/oglasi?status=${s.value}`}
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naslov</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategorija</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cena</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontakt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Nema oglasa
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-gray-900 font-medium line-clamp-1">{listing.title}</p>
                    <p className="text-xs text-gray-500">{listing.location || 'Bez lokacije'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {listing.category_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatPrice(listing.price)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(listing.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {listing.contact_phone || listing.contact_email || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(listing.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {listing.status === 'pending' && (
                        <form action={`/api/listings/${listing.id}/approve`} method="POST">
                          <button
                            type="submit"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Odobri"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </form>
                      )}
                      <Link
                        href={`/oglasi/${listing.slug}`}
                        target="_blank"
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Pogledaj"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <form action={`/api/listings/${listing.id}`} method="DELETE">
                        <button
                          type="submit"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Obriši"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
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
              Prikazano {listings.length} od {totalCount} oglasa
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/oglasi?status=${status}&page=${page - 1}`}
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
                  href={`/admin/oglasi?status=${status}&page=${page + 1}`}
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
