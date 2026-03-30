import Link from 'next/link';
import { db } from '@/lib/db';

interface SearchParams {
  status?: string;
  page?: string;
}

async function getBookings(options: { status?: string; page?: number }) {
  const { status, page = 1 } = options;
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = `
    SELECT b.*,
           s.title as service_title, s.slug as service_slug,
           v.name as vendor_name, v.slug as vendor_slug
    FROM bookings b
    LEFT JOIN services s ON b.service_id = s.id
    LEFT JOIN vendors v ON b.vendor_id = v.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (status && status !== 'all') {
    query += ` AND b.status = $${paramIndex++}`;
    params.push(status);
  }

  query += ` ORDER BY b.requested_date DESC, b.requested_time DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await db.query(query, params);
  return result.rows;
}

async function getBookingsCount(status?: string) {
  let query = 'SELECT COUNT(*) FROM bookings WHERE 1=1';
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
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };
  const labels: Record<string, string> = {
    pending: 'Na čekanju',
    confirmed: 'Potvrđeno',
    cancelled: 'Otkazano',
    completed: 'Završeno',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

export default async function RezervacijePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = params.status || 'all';
  const page = parseInt(params.page || '1', 10);

  const [bookings, totalCount] = await Promise.all([
    getBookings({ status: status === 'all' ? undefined : status, page }),
    getBookingsCount(status === 'all' ? undefined : status),
  ]);

  const totalPages = Math.ceil(totalCount / 20);

  const statuses = [
    { value: 'all', label: 'Sve' },
    { value: 'pending', label: 'Na čekanju' },
    { value: 'confirmed', label: 'Potvrđene' },
    { value: 'completed', label: 'Završene' },
    { value: 'cancelled', label: 'Otkazane' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rezervacije</h1>
          <p className="text-gray-600">Upravljanje rezervacijama usluga</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center gap-2">
          {statuses.map((s) => (
            <Link
              key={s.value}
              href={`/admin/marketplace/rezervacije?status=${s.value}`}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mušterija</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usluga</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodavac</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Termin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poruka</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Nema rezervacija
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-gray-900 font-medium">{booking.customer_name}</p>
                    <p className="text-xs text-gray-500">{booking.customer_email}</p>
                    {booking.customer_phone && (
                      <p className="text-xs text-gray-500">{booking.customer_phone}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {booking.service_title || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {booking.vendor_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(booking.requested_date)}
                    </p>
                    <p className="text-xs text-gray-500">{booking.requested_time}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {booking.message || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <form action={`/api/bookings/${booking.id}/confirm`} method="POST">
                            <button
                              type="submit"
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Potvrdi"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          </form>
                          <form action={`/api/bookings/${booking.id}/cancel`} method="POST">
                            <button
                              type="submit"
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Otkaži"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </form>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <form action={`/api/bookings/${booking.id}/complete`} method="POST">
                          <button
                            type="submit"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Označi kao završeno"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </form>
                      )}
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
              Prikazano {bookings.length} od {totalCount} rezervacija
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/marketplace/rezervacije?status=${status}&page=${page - 1}`}
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
                  href={`/admin/marketplace/rezervacije?status=${status}&page=${page + 1}`}
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
