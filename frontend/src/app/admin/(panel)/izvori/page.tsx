import { db } from '@/lib/db';
import { formatDate, formatEventDate } from '@/lib/format';
import NewsSourceForm from '@/components/admin/NewsSourceForm';

export const dynamic = 'force-dynamic';

interface SearchParams {
  uvezeno?: string;
  greske?: string;
  uvoz?: string;
}

async function getSources() {
  const result = await db.query(`
    SELECT s.*, c.name AS category_name
    FROM news_sources s
    LEFT JOIN categories c ON s.category_id = c.id
    ORDER BY s.enabled DESC, s.name
  `);
  return result.rows;
}

async function getCategories() {
  const result = await db.query('SELECT id, name FROM categories ORDER BY name');
  return result.rows as { id: string; name: string }[];
}

function importMessage(params: SearchParams): string | null {
  if (params.uvoz === 'zauzeto') return 'Uvoz je već u toku, pokušajte za minut.';
  if (params.uvoz === 'greska') return 'Uvoz nije uspeo. Pogledajte log servera.';
  if (params.uvezeno !== undefined) {
    const errors = Number(params.greske || 0);
    return `Uvezeno novih vesti: ${params.uvezeno}.${errors ? ` Izvora sa greškom: ${errors}.` : ''}`;
  }
  return null;
}

export default async function IzvoriPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  let sources: any[] = [];
  let categories: { id: string; name: string }[] = [];
  let loadError = false;
  try {
    [sources, categories] = await Promise.all([getSources(), getCategories()]);
  } catch (error) {
    console.error('Error fetching news sources:', error);
    loadError = true;
  }
  const message = importMessage(params);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Izvori vesti</h1>
          <p className="text-gray-600">
            RSS agregator: vesti koje sadrže ključne reči objavljuju se automatski sa linkom na original.
          </p>
        </div>
        <form action="/api/news-sources/import" method="POST">
          <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
            Preuzmi vesti sada
          </button>
        </form>
      </div>

      {message && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-green-50 text-green-800 text-sm" role="status">{message}</div>
      )}

      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Novi izvor</h2>
        <p className="text-sm text-gray-500 mb-4">
          Ključne reči se odvajaju zarezom, a * zamenjuje ostatak reči: „gornj* milanov*“ hvata Gornji Milanovac,
          Gornjem Milanovcu, Gornjeg Milanovca i ćirilicu. Prazno polje uvozi sve vesti iz feed-a (za lokalne medije).
        </p>
        <NewsSourceForm categories={categories} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loadError ? (
          <p className="px-6 py-12 text-center text-gray-500">
            Tabela izvora nije dostupna. Migracije se pokreću pri startu aplikacije; proverite log servera.
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Izvor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ključne reči</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategorija</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poslednji uvoz</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Još nema izvora</td>
                </tr>
              ) : (
                sources.map((source) => {
                  const fetchedAt = source.last_fetched_at?.toISOString();
                  return (
                    <tr key={source.id} className={source.enabled ? 'hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{source.name}</div>
                        <div className="text-xs text-gray-500 break-all">{source.feed_url}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{source.keywords || 'sve vesti'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{source.category_name || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {fetchedAt ? (
                          <>
                            <div className="text-gray-700">{formatDate(fetchedAt)} {formatEventDate(fetchedAt).time}</div>
                            {source.last_error ? (
                              <div className="text-xs text-red-600">Greška: {source.last_error}</div>
                            ) : (
                              <div className="text-xs text-gray-500">novih: {source.last_imported}</div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500">još nije preuzet</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 text-sm">
                          <form action={`/api/news-sources/${source.id}/${source.enabled ? 'disable' : 'enable'}`} method="POST">
                            <button type="submit" className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">
                              {source.enabled ? 'Isključi' : 'Uključi'}
                            </button>
                          </form>
                          <form action={`/api/news-sources/${source.id}/delete`} method="POST">
                            <button type="submit" className="px-2 py-1 text-red-600 hover:bg-red-50 rounded">Obriši</button>
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
