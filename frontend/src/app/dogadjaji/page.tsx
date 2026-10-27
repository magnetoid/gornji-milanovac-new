import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import Link from 'next/link';
import { getEventsBetween, CommunityEvent } from '@/lib/api';
import { belgradeDayKey, belgradeMidnight, formatEventDate, monthNames } from '@/lib/format';
import EventCalendar, { CalendarEvent } from '@/components/EventCalendar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Događaji',
  description: 'Kalendar događaja u Gornjem Milanovcu: kultura, sport, akcije građana i pijaca.',
};

interface PageProps {
  searchParams: { mesec?: string; dan?: string };
}

function monthParam(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default async function DogadjajiPage({ searchParams }: PageProps) {
  try { noStore(); } catch {}

  const todayKey = belgradeDayKey(new Date());
  const [todayYear, todayMonth] = todayKey.split('-').map(Number);

  // ?mesec=2026-10, defaulting to the current month
  const match = /^(\d{4})-(\d{2})$/.exec(searchParams.mesec || '');
  let year = todayYear;
  let month = todayMonth;
  if (match && Number(match[2]) >= 1 && Number(match[2]) <= 12) {
    year = Number(match[1]);
    month = Number(match[2]);
  }

  const prev = month === 1 ? [year - 1, 12] : [year, month - 1];
  const next = month === 12 ? [year + 1, 1] : [year, month + 1];

  let events: CommunityEvent[] = [];
  try {
    events = await getEventsBetween(belgradeMidnight(year, month, 1), belgradeMidnight(next[0], next[1], 1));
  } catch (error) {
    console.error('Error fetching events:', error);
  }

  const calendarEvents: CalendarEvent[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    category: event.category,
    location: event.location,
    description: event.description,
    url: event.url,
    startsAt: event.starts_at,
    dayKey: belgradeDayKey(new Date(event.starts_at)),
    time: formatEventDate(event.starts_at).time,
  }));

  const requestedDay = Number(searchParams.dan);

  return (
    <div className="container pb-[72px]">
      <div className="flex flex-wrap items-end justify-between gap-5 pt-10 pb-6 border-b border-border">
        <div>
          <div className="eyebrow mb-2">Zajednica</div>
          <h1 className="font-serif text-[36px] sm:text-[48px] font-medium tracking-[-0.02em] leading-[1.1]">
            Događaji · {monthNames[month - 1]} {year}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dogadjaji?mesec=${monthParam(prev[0], prev[1])}`}
            className="w-10 h-10 rounded-full border border-ink flex items-center justify-center text-ink hover:bg-ink hover:text-paper"
            aria-label="Prethodni mesec"
          >
            ←
          </Link>
          <Link
            href={`/dogadjaji?mesec=${monthParam(next[0], next[1])}`}
            className="w-10 h-10 rounded-full border border-ink flex items-center justify-center text-ink hover:bg-ink hover:text-paper"
            aria-label="Sledeći mesec"
          >
            →
          </Link>
          <Link href="/kontakt" className="btn-primary ml-2">Najavite događaj</Link>
        </div>
      </div>

      <EventCalendar
        // Remount per month so the selected day resets
        key={`${year}-${month}`}
        year={year}
        month={month}
        todayKey={todayKey}
        initialDay={requestedDay >= 1 && requestedDay <= 31 ? requestedDay : null}
        events={calendarEvents}
      />
    </div>
  );
}
