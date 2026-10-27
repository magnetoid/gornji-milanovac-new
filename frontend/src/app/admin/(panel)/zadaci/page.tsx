import { describeSchedule, getJobStates, JOBS, JobState } from '@/lib/jobs';
import { formatDate, formatEventDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

interface SearchParams {
  zadatak?: string;
  rezultat?: string;
}

const STATUS_STYLES: Record<string, string> = {
  ok: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  running: 'bg-blue-100 text-blue-800',
};

const STATUS_LABELS: Record<string, string> = {
  ok: 'Uspešno',
  error: 'Greška',
  running: 'U toku',
};

function runMessage(params: SearchParams): { text: string; error: boolean } | null {
  const job = JOBS.find((j) => j.name === params.zadatak);
  if (!job || !params.rezultat) return null;
  if (params.rezultat === 'zauzeto') return { text: `„${job.label}“ je već u toku.`, error: false };
  if (params.rezultat === 'error') return { text: `„${job.label}“ nije uspeo. Detalji su u tabeli.`, error: true };
  return { text: `„${job.label}“ je završen.`, error: false };
}

function formatWhen(date: Date | null): string {
  if (!date) return '-';
  const iso = date.toISOString();
  return `${formatDate(iso)} ${formatEventDate(iso).time}`;
}

export default async function ZadaciPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  let states = new Map<string, JobState>();
  let loadError = false;
  try {
    states = await getJobStates();
  } catch (error) {
    console.error('Error fetching job states:', error);
    loadError = true;
  }
  const message = runMessage(params);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Zakazani zadaci</h1>
        <p className="text-gray-600">
          Poslovi koje sajt sam pokreće po rasporedu (kao WP-Cron). Dnevni zadaci rade po vremenu u Srbiji.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}
          role="status"
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loadError ? (
          <p className="px-6 py-12 text-center text-gray-500">
            Tabela zadataka nije dostupna. Migracije se pokreću pri startu aplikacije; proverite log servera.
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zadatak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raspored</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poslednje pokretanje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rezultat</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {JOBS.map((job) => {
                const state = states.get(job.name);
                const status = state?.last_status;
                return (
                  <tr key={job.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{job.label}</div>
                      <div className="text-xs text-gray-500">{job.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{describeSchedule(job.schedule)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {state?.last_started_at ? (
                        <>
                          <div>{formatWhen(state.last_started_at)}</div>
                          {state.last_duration_ms !== null && status !== 'running' && (
                            <div className="text-xs text-gray-500">trajanje: {(state.last_duration_ms / 1000).toFixed(1)} s</div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">još nije pokrenut</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {status && (
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status] || ''}`}>
                          {STATUS_LABELS[status] || status}
                        </span>
                      )}
                      {state?.last_message && status !== 'running' && (
                        <div className={`mt-1 text-xs break-words ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                          {state.last_message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={`/api/jobs/${job.name}/run`} method="POST">
                        <button type="submit" className="px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 rounded">
                          Pokreni sada
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
