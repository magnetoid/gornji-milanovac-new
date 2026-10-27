'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Setting {
  key: string;
  value: string | null;
  type: string;
  label: string | null;
  group_name: string;
}

interface GroupedSettings {
  [group: string]: Setting[];
}

const groupLabels: Record<string, string> = {
  general: 'Opšta podešavanja',
  content: 'Sadržaj',
  social: 'Društvene mreže',
  contact: 'Kontakt',
  seo: 'SEO',
  features: 'Funkcionalnosti',
};

export default function PodesavanjaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GroupedSettings>({});
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data.grouped || {});
        const initial: Record<string, string> = {};
        Object.values(data.grouped || {}).flat().forEach((setting: any) => {
          initial[setting.key] = setting.value || '';
        });
        setFormData(initial);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save');

      alert('Podešavanja su sačuvana');
      router.refresh();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Greška pri čuvanju podešavanja');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Podešavanja sajta</h1>
        <p className="text-gray-600">Upravljanje opštim podešavanjima portala</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {Object.entries(settings).map(([group, groupSettings]) => (
          <div key={group} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {groupLabels[group] || group}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {groupSettings.map((setting) => (
                <div key={setting.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {setting.label || setting.key}
                  </label>
                  {setting.type === 'boolean' ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData[setting.key] === 'true'}
                        onChange={(e) => handleChange(setting.key, e.target.checked ? 'true' : 'false')}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600">
                        {formData[setting.key] === 'true' ? 'Uključeno' : 'Isključeno'}
                      </span>
                    </div>
                  ) : setting.type === 'number' ? (
                    <input
                      type="number"
                      value={formData[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-full max-w-xs border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : setting.type === 'json' ? (
                    <textarea
                      value={formData[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                      placeholder="JSON data..."
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-full max-w-lg border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Ključ: <code className="bg-gray-100 px-1 rounded">{setting.key}</code>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Čuvanje...' : 'Sačuvaj podešavanja'}
          </button>
        </div>
      </form>
    </div>
  );
}
