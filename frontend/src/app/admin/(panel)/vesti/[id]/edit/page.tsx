'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: string;
  category_id: string | null;
  tags: string[] | null;
  featured_image: string | null;
  featured: boolean;
  locale: string;
  source_name: string | null;
  source_url: string | null;
  published_at: string | null;
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [post, setPost] = useState<Post | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    category_id: '',
    tags: '',
    featured_image: '',
    featured: false,
    locale: 'sr',
    source_name: '',
    source_url: '',
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/posts/${id}`).then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
    ])
      .then(([postData, categoriesData]) => {
        setPost(postData);
        setCategories(categoriesData);
        setFormData({
          title: postData.title || '',
          slug: postData.slug || '',
          content: postData.content || '',
          excerpt: postData.excerpt || '',
          status: postData.status || 'draft',
          category_id: postData.category_id || '',
          tags: postData.tags?.join(', ') || '',
          featured_image: postData.featured_image || '',
          featured: postData.featured || false,
          locale: postData.locale || 'sr',
          source_name: postData.source_name || '',
          source_url: postData.source_url || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        status: publishNow ? 'published' : formData.status,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        published_at: publishNow && formData.status !== 'published' ? new Date().toISOString() : post?.published_at,
      };

      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to update post');
      }

      router.refresh();
      alert('Vest je sačuvana');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Greška pri čuvanju vesti');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu vest?')) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/admin/vesti');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Greška pri brisanju vesti');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vest nije pronađena</p>
        <Link href="/admin/vesti" className="text-green-600 hover:underline mt-2 inline-block">
          Nazad na listu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Uredi vest</h1>
          <p className="text-gray-600">ID: {id}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            Obriši
          </button>
          <Link
            href="/admin/vesti"
            className="text-gray-500 hover:text-gray-700"
          >
            &larr; Nazad na listu
          </Link>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow p-6">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Naslov vesti"
                className="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-green-500 focus:ring-0 pb-2"
                required
              />
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <span>Slug:</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="flex-1 border-0 bg-gray-50 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kratak opis (excerpt)
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                placeholder="Kratak opis vesti koji se prikazuje u pregledu..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sadržaj
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={20}
                placeholder="Unesite sadržaj vesti... (podržava Markdown formatiranje)"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Box */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Objava</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="draft">Nacrt</option>
                    <option value="published">Objavljeno</option>
                    <option value="scheduled">Zakazano</option>
                    <option value="archived">Arhivirano</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700">
                    Istaknuta vest
                  </label>
                </div>

                {post.published_at && (
                  <p className="text-xs text-gray-500">
                    Objavljeno: {new Date(post.published_at).toLocaleString('sr-RS')}
                  </p>
                )}

                <div className="pt-4 border-t border-gray-200 flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Sačuvaj
                  </button>
                  {formData.status !== 'published' && (
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Čuvanje...' : 'Objavi'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategorija</h3>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Izaberite kategoriju</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tagovi</h3>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="mt-2 text-xs text-gray-500">Odvojite tagove zarezom</p>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Naslovna slika</h3>
              <input
                type="text"
                value={formData.featured_image}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                placeholder="URL slike"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {formData.featured_image && (
                <div className="mt-4">
                  <img
                    src={formData.featured_image}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Locale */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Jezik</h3>
              <select
                value={formData.locale}
                onChange={(e) => setFormData(prev => ({ ...prev, locale: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="sr">Srpski (SR)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>

            {/* Source */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Izvor (opciono)</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.source_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, source_name: e.target.value }))}
                  placeholder="Naziv izvora (npr. GM Info)"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="url"
                  value={formData.source_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
                  placeholder="URL izvora"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
