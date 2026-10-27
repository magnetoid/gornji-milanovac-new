'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventCategories } from '@/lib/events';

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500';

export default function EventForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      formElement.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">Naslov</label>
        <input id="event-title" name="title" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="event-starts" className="block text-sm font-medium text-gray-700 mb-1">Početak</label>
        <input id="event-starts" name="starts_at" type="datetime-local" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="event-category" className="block text-sm font-medium text-gray-700 mb-1">Vrsta</label>
        <select id="event-category" name="category" className={inputClass} defaultValue="kultura">
          {Object.entries(eventCategories).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">Mesto</label>
        <input id="event-location" name="location" placeholder="npr. Dom kulture" className={inputClass} />
      </div>
      <div>
        <label htmlFor="event-url" className="block text-sm font-medium text-gray-700 mb-1">Link (opciono)</label>
        <input id="event-url" name="url" type="url" placeholder="https://" className={inputClass} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
        <textarea id="event-description" name="description" rows={3} className={inputClass} />
      </div>
      <div className="md:col-span-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? 'Čuvam…' : 'Dodaj događaj'}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
