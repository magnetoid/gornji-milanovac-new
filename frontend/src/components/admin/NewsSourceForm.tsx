'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NewsSourceFormProps {
  categories: { id: string; name: string }[];
}

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500';

export default function NewsSourceForm({ categories }: NewsSourceFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/news-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(formElement).entries())),
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
      <div>
        <label htmlFor="source-name" className="block text-sm font-medium text-gray-700 mb-1">Naziv (prikazuje se kao izvor)</label>
        <input id="source-name" name="name" required placeholder="npr. RTS" className={inputClass} />
      </div>
      <div>
        <label htmlFor="source-url" className="block text-sm font-medium text-gray-700 mb-1">Adresa RSS feed-a</label>
        <input id="source-url" name="feed_url" type="url" required placeholder="https://primer.rs/feed/" className={inputClass} />
      </div>
      <div>
        <label htmlFor="source-keywords" className="block text-sm font-medium text-gray-700 mb-1">Ključne reči</label>
        <input id="source-keywords" name="keywords" defaultValue="gornj* milanov*" className={inputClass} />
      </div>
      <div>
        <label htmlFor="source-category" className="block text-sm font-medium text-gray-700 mb-1">Kategorija za uvezene vesti</label>
        <select id="source-category" name="category_id" className={inputClass} defaultValue="">
          <option value="">Bez kategorije</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? 'Čuvam…' : 'Dodaj izvor'}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
