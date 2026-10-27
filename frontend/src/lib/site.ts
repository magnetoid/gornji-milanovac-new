// Static site content shared between pages

export const importantPhones = [
  { name: 'Hitna pomoć', number: '194' },
  { name: 'Policija', number: '192' },
  { name: 'Vatrogasci', number: '193' },
  { name: 'Opština GM', number: '032/712-600' },
];

export const cityStats = [
  { value: '38.985', label: 'stanovnika (popis 2022)' },
  { value: '836 km²', label: 'površina opštine' },
  { value: '1853', label: 'osnovan' },
];

export const weatherUrl =
  'https://www.yr.no/en/forecast/daily-table/2-789128/Serbia/Central%20Serbia/Moravica/Gornji%20Milanovac';

export function telHref(number: string): string {
  return `tel:${number.replace(/[^0-9+]/g, '')}`;
}

// Only allow site-relative or http(s) links from editable content
export function safeHref(url: string): string | null {
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}
