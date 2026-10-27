'use client';

import { useState } from 'react';
import Link from 'next/link';

interface VendorFormProps {
  categories: Record<string, string>;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function VendorForm({ categories }: VendorFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (key: string) => String(form.get(key) || '').trim();

    if (!get('phone') && !get('email')) {
      setError('Unesite telefon ili email.');
      return;
    }

    setError('');
    setStatus('sending');
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: get('name'),
          category: get('category') || null,
          description: get('description'),
          location: get('location'),
          working_hours: get('working_hours'),
          phone: get('phone'),
          email: get('email'),
          website: get('website'),
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus('sent');
    } catch {
      setStatus('error');
      setError('Upis nije poslat. Ako firma sa istim imenom već postoji, javite nam se preko stranice Kontakt.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="card-flat p-6 sm:p-8 flex flex-col gap-3">
        <span className="eyebrow">Hvala!</span>
        <p className="font-serif text-2xl leading-snug">Upis je primljen i biće vidljiv čim ga redakcija proveri.</p>
        <Link href="/imenik" className="btn-primary self-start mt-2">Nazad na imenik</Link>
      </div>
    );
  }

  const labelClass = 'block text-sm font-medium mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="name" className={labelClass}>Naziv firme ili radnje</label>
        <input id="name" name="name" required maxLength={200} className="input" />
      </div>

      <div>
        <label htmlFor="category" className={labelClass}>Delatnost</label>
        <select id="category" name="category" className="input" defaultValue="">
          <option value="">Izaberite</option>
          {Object.entries(categories).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className={labelClass}>Adresa</label>
        <input id="location" name="location" placeholder="npr. Takovska 2" className="input" />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="working_hours" className={labelClass}>Radno vreme</label>
        <input id="working_hours" name="working_hours" placeholder="npr. Pon–Pet 08–17h, Sub 09–13h" className="input" />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>Telefon</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className="input" />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" autoComplete="email" className="input" />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="website" className={labelClass}>Sajt ili Facebook stranica</label>
        <input id="website" name="website" type="url" placeholder="https://" className="input" />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="description" className={labelClass}>Kratak opis</label>
        <textarea id="description" name="description" rows={4} className="input" />
      </div>

      {error && <p className="sm:col-span-2 text-sm text-red" role="alert">{error}</p>}

      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Šaljem…' : 'Pošalji upis'}
        </button>
      </div>
    </form>
  );
}
