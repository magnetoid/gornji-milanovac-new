import { db } from '@/lib/db';
import { formatDate, formatEventDate } from '@/lib/format';
import { eventCategory } from '@/lib/events';
import EventForm from '@/components/admin/EventForm';

export const dynamic = 'force-dynamic';

async function getEvents() {
  // Upcoming first, then the last 30 days
  const result = await db.query(`
    SELECT * FROM events
    WHERE starts_at >= NOW() - INTERVAL '30 days'
    ORDER BY (starts_at < NOW()), starts_at ASC
    LIMIT 200
  `);
  return result.rows;
}

const statusStyles: Record<string, [string, string]> = {
  published: ['bg-green-100 text-green-800', 'Objavljen'],
  cancelled: ['bg-gray-100 text-gray-800', 'Otkazan'],
  draft: ['bg-yellow-100 text-yellow-800', 'Nacrt'],
};

export default async function DogadjajiAdminPage() {
  let events: any[] = [];
  let loadError = false;
  try {
    events = await getEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
    loadError = true;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Događaji</h1>
        <p className="text-gray-600">Kalendar na stranici /dogadjaji i u sekciji „Ove nedelje“ na naslovnoj</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Novi događaj</h2>
        <EventForm />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loadError ? (
          <p className="px-6 py-12 text-center text-gray-500">
            Tabela događaja nije dostupna. Pokrenite migration/2026-10-events-and-alert.sql.
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naslov</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vrsta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Nema događaja</td>
                </tr>
              ) : (
                events.map((event) => {
                  const startsAt = event.starts_at.toISOString();
                  const [statusClass, statusLabel] = statusStyles[event.status] || statusStyles.draft;
                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {formatDate(startsAt)} {formatEventDate(startsAt).time}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{event.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{eventCategory(event.category).label}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{event.location || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>{statusLabel}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 text-sm">
                          <form action={`/api/events/${event.id}/${event.status === 'published' ? 'cancel' : 'publish'}`} method="POST">
                            <button type="submit" className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">
                              {event.status === 'published' ? 'Otkaži' : 'Objavi'}
                            </button>
                          </form>
                          <form action={`/api/events/${event.id}/delete`} method="POST">
                            <button type="submit" className="px-2 py-1 text-red-600 hover:bg-red-50 rounded">
                              Obriši
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
