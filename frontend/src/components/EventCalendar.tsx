'use client';

import { useState } from 'react';
import { eventCategory } from '@/lib/events';
import { monthNames, weekdayNames } from '@/lib/format';
import { safeHref } from '@/lib/site';

export interface CalendarEvent {
  id: string;
  title: string;
  category: string | null;
  location: string | null;
  description: string | null;
  url: string | null;
  startsAt: string;
  // Belgrade calendar day and time, computed on the server
  dayKey: string;
  time: string;
}

interface EventCalendarProps {
  year: number;
  month: number; // 1-12
  todayKey: string;
  initialDay: number | null;
  events: CalendarEvent[];
}

const weekdayHeads = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
}

function icsTime(iso: string): string {
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function downloadIcs(event: CalendarEvent) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gornji Milanovac//Dogadjaji//SR',
    'BEGIN:VEVENT',
    `UID:${event.id}@gornji-milanovac.com`,
    `DTSTAMP:${icsTime(new Date().toISOString())}`,
    `DTSTART:${icsTime(event.startsAt)}`,
    `SUMMARY:${icsText(event.title)}`,
    event.location ? `LOCATION:${icsText(event.location)}` : '',
    event.description ? `DESCRIPTION:${icsText(event.description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'dogadjaj.ics';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

export default function EventCalendar({ year, month, todayKey, initialDay, events }: EventCalendarProps) {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leadingBlanks = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;

  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    eventsByDay.set(event.dayKey, [...(eventsByDay.get(event.dayKey) || []), event]);
  }

  // Requested day, else today when it is in this month, else the first day with events
  const firstEventDay = events.length ? Number(events[0].dayKey.slice(8)) : 1;
  const todayDay = todayKey.startsWith(dayKey(year, month, 1).slice(0, 8)) ? Number(todayKey.slice(8)) : null;
  const [selected, setSelected] = useState(
    initialDay && initialDay <= daysInMonth ? initialDay : todayDay || firstEventDay
  );
  const [copied, setCopied] = useState<string | null>(null);

  const selectedEvents = eventsByDay.get(dayKey(year, month, selected)) || [];
  const weekday = weekdayNames[new Date(Date.UTC(year, month - 1, selected)).getUTCDay()].toLowerCase();

  async function share(event: CalendarEvent) {
    const url = `${window.location.origin}/dogadjaji?mesec=${year}-${String(month).padStart(2, '0')}&dan=${selected}`;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, url }); } catch {}
      return;
    }
    await navigator.clipboard?.writeText(url);
    setCopied(event.id);
  }

  return (
    <div className="grid gap-12 pt-7 items-start grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]">
      <div>
        <div className="grid grid-cols-7 gap-1 mb-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted">
          {weekdayHeads.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }, (_, i) => <span key={`blank-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const key = dayKey(year, month, day);
            const isSelected = day === selected;
            const isToday = key === todayKey;
            const hasEvents = eventsByDay.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(day)}
                aria-pressed={isSelected}
                aria-label={`${day}. ${monthNames[month - 1]}${hasEvents ? ', ima događaja' : ''}`}
                className={`aspect-square rounded-md border flex flex-col justify-between items-start p-1.5 text-sm font-medium ${
                  isSelected
                    ? 'bg-ink text-paper border-ink'
                    : `bg-paper-card text-ink ${isToday ? 'border-primary' : 'border-border hover:border-ink'}`
                }`}
              >
                <span>{day}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${hasEvents ? (isSelected ? 'bg-paper' : 'bg-primary') : 'bg-transparent'}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="font-mono text-xs uppercase tracking-[0.1em] text-text-muted pb-2">
          {weekday}, {selected}. {monthNames[month - 1]}
        </div>
        {selectedEvents.length === 0 && (
          <div className="py-4 border-t border-border text-[15px] text-text-muted">Nema događaja za ovaj dan.</div>
        )}
        {selectedEvents.map((event) => {
          const category = eventCategory(event.category);
          const href = event.url ? safeHref(event.url) : null;
          return (
            <article key={event.id} className="flex flex-col gap-2 py-[18px] border-t border-border">
              <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-text-muted">
                <span className={`font-mono text-[11px] uppercase tracking-[0.06em] px-[7px] py-0.5 rounded ${category.className}`}>
                  {category.label}
                </span>
                <span>{event.time}</span>
                {event.location && <><span>·</span><span>{event.location}</span></>}
              </div>
              <h2 className="font-serif text-2xl leading-[1.2] font-medium">
                {href ? <a href={href} className="text-ink">{event.title}</a> : event.title}
              </h2>
              {event.description && (
                <p className="text-[15px] leading-[1.55] text-text-secondary">{event.description}</p>
              )}
              <div className="flex gap-3.5 pt-1 text-sm font-medium">
                <button type="button" onClick={() => downloadIcs(event)} className="text-primary hover:text-primary-dark">
                  Dodaj u kalendar
                </button>
                <button type="button" onClick={() => share(event)} className="text-text-muted hover:text-ink">
                  {copied === event.id ? 'Link kopiran' : 'Podeli'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
