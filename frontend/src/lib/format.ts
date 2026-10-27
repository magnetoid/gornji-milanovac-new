// Formatting helpers with no server-only imports, safe for client components.
// Dates are shown in Serbian time regardless of the server's timezone.

const TIME_ZONE = 'Europe/Belgrade';

const months = [
  'januar', 'februar', 'mart', 'april', 'maj', 'jun',
  'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
];

const weekdaysLong = ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'];
const weekdaysShort = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'];

interface DateParts {
  year: number;
  month: number; // 0-11
  day: number;
  weekday: number; // 0 = Sunday
  hour: number;
  minute: number;
}

function partsInBelgrade(date: Date): DateParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '';
  return {
    year: parseInt(get('year'), 10),
    month: parseInt(get('month'), 10) - 1,
    day: parseInt(get('day'), 10),
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
    hour: parseInt(get('hour'), 10),
    minute: parseInt(get('minute'), 10),
  };
}

// Whole calendar days between two dates, counted in Belgrade time
function calendarDaysBetween(earlier: Date, later: Date): number {
  const a = partsInBelgrade(earlier);
  const b = partsInBelgrade(later);
  return Math.round((Date.UTC(b.year, b.month, b.day) - Date.UTC(a.year, a.month, a.day)) / 86400000);
}

// "30. mart 2026."
export function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const { day, month, year } = partsInBelgrade(new Date(dateString));
  return `${day}. ${months[month]} ${year}.`;
}

// "Ponedeljak, 26. oktobar 2026"
export function formatLongDate(date: Date): string {
  const { weekday, day, month, year } = partsInBelgrade(date);
  return `${weekdaysLong[weekday]}, ${day}. ${months[month]} ${year}`;
}

// "pre 2 h", "juče", "pre 3 d" - falls back to the full date after a week
export function formatRelativeTime(dateString: string | null, now: Date = new Date()): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return 'upravo';
  if (minutes < 60) return `pre ${minutes} min`;
  const days = calendarDaysBetween(date, now);
  if (days === 0) return `pre ${Math.floor(minutes / 60)} h`;
  if (days === 1) return 'juče';
  if (days < 7) return `pre ${days} d`;
  return formatDate(dateString);
}

// "danas", "juče", "pre 3 d" - day granularity, for listings
export function formatRelativeDay(dateString: string | null, now: Date = new Date()): string {
  if (!dateString) return '';
  const days = calendarDaysBetween(new Date(dateString), now);
  if (days <= 0) return 'danas';
  if (days === 1) return 'juče';
  if (days < 7) return `pre ${days} d`;
  return formatDate(dateString);
}

// Event date tile: { day: "Uto", date: "27", time: "19:30" }
export function formatEventDate(dateString: string): { day: string; date: string; time: string } {
  const { weekday, day, hour, minute } = partsInBelgrade(new Date(dateString));
  return {
    day: weekdaysShort[weekday],
    date: String(day).padStart(2, '0'),
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
}

// "1.400 din"; null means the price is agreed with the seller
export function formatPrice(price: number | string | null, priceType?: string | null): string {
  if (priceType === 'free') return 'Besplatno';
  if (price === null || price === undefined || price === '') return 'po dogovoru';
  const value = typeof price === 'string' ? parseFloat(price) : price;
  if (!value) return 'po dogovoru';
  return `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(value)} din`;
}

export function getAssetUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_URL || '/uploads';
  return `${baseUrl}/${url}`;
}
