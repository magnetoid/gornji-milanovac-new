import Link from 'next/link';
import { db } from '@/lib/db';
import { vendorCategoryLabels, VendorCategory } from '@/lib/api';

interface SearchParams {
  status?: string;
  page?: string;
}

async function getVendors(options: { status?: string; page?: number }) {
  const { status, page = 1 } = options;
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = `SELECT * FROM vendors WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (status && status !== 'all') {
    query += ` AND status = $${paramIndex++}`;
    params.push(status);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await db.query(query, params);
  return result.rows;
}

async function getVendorsCount(status?: string) {
  let query = 'SELECT COUNT(*) FROM vendors WHERE 1=1';
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

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
  };
  const labels: Record<string, string> = {
    active: 'Aktivan',
    pending: 'Na čekanju',
    suspended: 'Suspendovan',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

export default async function ProdavciPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = params.status || 'all';
  const page = parseInt(params.page || '1', 10);

  const [vendors, totalCount] = await Promise.all([
    getVendors({ status: status === 'all' ? undefined : status, page }),
    getVendorsCount(status === 'all' ? undefined : status),
  ]);

  const totalPages = Math.ceil(totalCount / 20);

  const statuses = [
    { value: 'all', label: 'Svi' },
    { value: 'pending', label: 'Na čekanju' },
    { value: 'active', label: 'Aktivni' },
    { value: 'suspended', label: 'Suspendovani' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prodavci</h1>
          <p className="text-gray-600">Upravljanje prodavcima na marketplace-u</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center gap-2">
          {statuses.map((s) => (
            <Link
              key={s.value}
              href={`/admin/marketplace/prodavci?status=${s.value}`}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodavac</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategorija</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokacija</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontakt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Nema prodavaca
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {vendor.logo_url ? (
                        <img
                          src={vendor.logo_url}
                          alt={vendor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">{vendor.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-900 font-medium">{vendor.name}</p>
                        {vendor.featured && (
                          <span className="text-xs text-orange-600">Istaknuto</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {vendor.category ? vendorCategoryLabels[vendor.category as VendorCategory] || vendor.category : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {vendor.location || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(vendor.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {vendor.phone || vendor.email || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(vendor.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {vendor.status === 'pending' && (
                        <form action={`/api/vendors/${vendor.id}/approve`} method="POST">
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
                      {vendor.status === 'active' && (
                        <form action={`/api/vendors/${vendor.id}/suspend`} method="POST">
                          <button
                            type="submit"
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Suspenduj"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        </form>
                      )}
                      <Link
                        href={`/marketplace/vendor/${vendor.slug}`}
                        target="_blank"
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Pogledaj"
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
              Prikazano {vendors.length} od {totalCount} prodavaca
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/marketplace/prodavci?status=${status}&page=${page - 1}`}
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
                  href={`/admin/marketplace/prodavci?status=${status}&page=${page + 1}`}
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
