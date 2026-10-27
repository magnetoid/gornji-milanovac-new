'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ListingCategory } from '@/lib/api';

interface ListingFormProps {
  categories: ListingCategory[];
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ListingForm({ categories }: ListingFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (key: string) => String(form.get(key) || '').trim();

    if (!get('contact_phone') && !get('contact_email')) {
      setError('Unesite telefon ili email da bi kupci mogli da vas kontaktiraju.');
      return;
    }

    const priceType = get('price_type') || 'fixed';
    const price = priceType === 'fixed' ? parseFloat(get('price').replace(/\./g, '').replace(',', '.')) : NaN;

    setError('');
    setStatus('sending');
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: get('title'),
          description: get('description'),
          category_id: get('category_id') || null,
          price_type: priceType,
          price: Number.isFinite(price) ? price : null,
          location: get('location'),
          contact_name: get('contact_name'),
          contact_phone: get('contact_phone'),
          contact_email: get('contact_email'),
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus('sent');
    } catch {
      setStatus('error');
      setError('Oglas nije poslat. Pokušajte ponovo za nekoliko minuta.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="card-flat p-6 sm:p-8 flex flex-col gap-3">
        <span className="eyebrow">Hvala!</span>
        <p className="font-serif text-2xl leading-snug">Oglas je primljen i biće objavljen čim ga redakcija pregleda.</p>
        <div className="flex flex-wrap gap-2.5 mt-2">
          <Link href="/oglasi" className="btn-primary">Nazad na oglase</Link>
          <button type="button" className="btn-outline" onClick={() => setStatus('idle')}>
            Postavi još jedan
          </button>
        </div>
      </div>
    );
  }

  const labelClass = 'block text-sm font-medium mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="title" className={labelClass}>Naslov oglasa</label>
        <input id="title" name="title" required maxLength={200} className="input" />
      </div>

      <div>
        <label htmlFor="category_id" className={labelClass}>Kategorija</label>
        <select id="category_id" name="category_id" className="input" defaultValue="">
          <option value="">Izaberite</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className={labelClass}>Mesto</label>
        <input id="location" name="location" placeholder="npr. Takovo" className="input" />
      </div>

      <div>
        <label htmlFor="price_type" className={labelClass}>Cena</label>
        <select id="price_type" name="price_type" className="input" defaultValue="fixed">
          <option value="fixed">Fiksna cena</option>
          <option value="negotiable">Po dogovoru</option>
          <option value="free">Besplatno</option>
        </select>
      </div>

      <div>
        <label htmlFor="price" className={labelClass}>Iznos (din)</label>
        <input id="price" name="price" inputMode="decimal" placeholder="npr. 4.500" className="input" />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="description" className={labelClass}>Opis</label>
        <textarea id="description" name="description" rows={6} className="input" />
      </div>

      <div>
        <label htmlFor="contact_name" className={labelClass}>Ime</label>
        <input id="contact_name" name="contact_name" autoComplete="name" className="input" />
      </div>

      <div>
        <label htmlFor="contact_phone" className={labelClass}>Telefon</label>
        <input id="contact_phone" name="contact_phone" type="tel" autoComplete="tel" className="input" />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="contact_email" className={labelClass}>Email</label>
        <input id="contact_email" name="contact_email" type="email" autoComplete="email" className="input" />
      </div>

      {error && (
        <p className="sm:col-span-2 text-sm text-red" role="alert">{error}</p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Šaljem…' : 'Pošalji oglas'}
        </button>
      </div>
    </form>
  );
}
