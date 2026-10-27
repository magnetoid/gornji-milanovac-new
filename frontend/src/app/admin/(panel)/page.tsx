import Link from 'next/link';
import { db } from '@/lib/db';
import { getBookings } from '@/lib/api';

async function getDashboardStats() {
  const [postsResult, listingsResult, vendorsResult, bookingsResult] = await Promise.all([
    db.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE DATE(published_at) = CURRENT_DATE) as today FROM posts WHERE status = $1', ['published']),
    db.query('SELECT COUNT(*) FROM listings WHERE status = $1', ['active']),
    db.query('SELECT COUNT(*) FROM vendors WHERE status = $1', ['active']),
    db.query('SELECT COUNT(*) FROM bookings WHERE status = $1', ['pending']),
  ]);

  return {
    totalPosts: parseInt(postsResult.rows[0].total, 10),
    postsToday: parseInt(postsResult.rows[0].today, 10),
    totalListings: parseInt(listingsResult.rows[0].count, 10),
    activeVendors: parseInt(vendorsResult.rows[0].count, 10),
    pendingBookings: parseInt(bookingsResult.rows[0].count, 10),
  };
}

async function getRecentPosts() {
  const result = await db.query(`
    SELECT p.id, p.title, p.slug, p.status, p.published_at, p.created_at,
           c.name as category_name, u.name as author_name
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.author_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 10
  `);
  return result.rows;
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    archived: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-orange-100 text-orange-800',
  };
  const labels: Record<string, string> = {
    published: 'Objavljeno',
    draft: 'Nacrt',
    scheduled: 'Zakazano',
    archived: 'Arhivirano',
    pending: 'Na čekanju',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
}

export default async function AdminDashboard() {
  const [stats, recentPosts, pendingBookings] = await Promise.all([
    getDashboardStats(),
    getRecentPosts(),
    getBookings({ status: 'pending', limit: 5 }),
  ]);

  const statCards = [
    { label: 'Ukupno vesti', value: stats.totalPosts, icon: 'newspaper', color: 'bg-blue-500' },
    { label: 'Objavljeno danas', value: stats.postsToday, icon: 'today', color: 'bg-green-500' },
    { label: 'Aktivnih oglasa', value: stats.totalListings, icon: 'tag', color: 'bg-purple-500' },
    { label: 'Aktivnih prodavaca', value: stats.activeVendors, icon: 'store', color: 'bg-orange-500' },
    { label: 'Rezervacije na čekanju', value: stats.pendingBookings, icon: 'calendar', color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Dobrodošli u admin panel Gornji Milanovac portala</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Brze akcije</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/vesti/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova vest
          </Link>
          <Link
            href="/admin/oglasi"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Pregled oglasa
          </Link>
          <Link
            href="/admin/marketplace/prodavci"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Odobri prodavce
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Poslednje vesti</h2>
            <Link href="/admin/vesti" className="text-sm text-green-600 hover:text-green-700">
              Sve vesti &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naslov</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/admin/vesti/${post.id}/edit`} className="text-gray-900 hover:text-green-600 font-medium line-clamp-1">
                        {post.title}
                      </Link>
                      <p className="text-xs text-gray-500">{post.category_name || 'Bez kategorije'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(post.published_at || post.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Rezervacije na čekanju</h2>
            <Link href="/admin/marketplace/rezervacije" className="text-sm text-green-600 hover:text-green-700">
              Sve rezervacije &rarr;
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingBookings.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-500">Nema rezervacija na čekanju</p>
            ) : (
              pendingBookings.map((booking) => (
                <div key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{booking.customer_name}</p>
                      <p className="text-sm text-gray-500">{booking.service?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.requested_date).toLocaleDateString('sr-RS')}
                      </p>
                      <p className="text-sm text-gray-500">{booking.requested_time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
