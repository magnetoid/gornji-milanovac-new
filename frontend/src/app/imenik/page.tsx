import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  getVendors,
  getVendorCategoryCounts,
  vendorCategoryLabels,
  Vendor,
  VendorCategory,
} from '@/lib/api';
import { telHref } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Imenik',
  description: 'Lokalni imenik Gornjeg Milanovca: firme, ustanove, majstori i usluge sa adresama, radnim vremenom i telefonima.',
};

interface PageProps {
  searchParams: { kategorija?: string; q?: string };
}

function mapUrl(vendor: Vendor): string {
  const query = [vendor.name, vendor.location, 'Gornji Milanovac'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function imenikHref(category: string, q: string): string {
  const params = new URLSearchParams();
  if (category) params.set('kategorija', category);
  if (q) params.set('q', q);
  const query = params.toString();
  return query ? `/imenik?${query}` : '/imenik';
}

export default async function ImenikPage({ searchParams }: PageProps) {
  try { noStore(); } catch {}
  const q = (searchParams.q || '').trim().slice(0, 100);
  const category = searchParams.kategorija &&
    Object.prototype.hasOwnProperty.call(vendorCategoryLabels, searchParams.kategorija)
    ? (searchParams.kategorija as VendorCategory)
    : undefined;

  let vendors: Vendor[] = [];
  let counts: Record<string, number> = {};
  try {
    [vendors, counts] = await Promise.all([
      getVendors({ category, search: q || undefined, limit: 60 }),
      getVendorCategoryCounts(),
    ]);
  } catch (error) {
    console.error('Error fetching directory:', error);
  }

  const chips = (Object.keys(vendorCategoryLabels) as VendorCategory[]).filter((key) => counts[key]);

  return (
    <div className="container pb-[72px]">
      <div className="flex flex-wrap items-end justify-between gap-5 pt-10 pb-6 border-b border-border">
        <div>
          <div className="eyebrow mb-2">Lokalni imenik</div>
          <h1 className="font-serif text-[36px] sm:text-[48px] font-medium tracking-[-0.02em] leading-[1.1]">
            Firme, ustanove i majstori
          </h1>
        </div>
        <form action="/imenik" method="GET" role="search" className="w-full sm:w-[360px]">
          {category && <input type="hidden" name="kategorija" value={category} />}
          <label htmlFor="imenik-q" className="sr-only">Pretraga imenika</label>
          <input
            id="imenik-q"
            name="q"
            defaultValue={q}
            placeholder="Vodoinstalater, apoteka, frizer…"
            className="w-full px-[18px] py-3 rounded-full border border-border-dark bg-paper-card text-[15px] outline-none focus:border-ink"
          />
        </form>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 py-5">
          <Link href={imenikHref('', q)} className={!category ? 'chip-active' : 'chip-default'}>Sve</Link>
          {chips.map((key) => (
            <Link
              key={key}
              href={imenikHref(key, q)}
              className={category === key ? 'chip-active' : 'chip-default'}
            >
              {vendorCategoryLabels[key]}
            </Link>
          ))}
        </div>
      )}

      {vendors.length > 0 ? (
        <div className={`grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] ${chips.length ? '' : 'pt-6'}`}>
          {vendors.map((vendor) => (
            <article key={vendor.id} className="flex flex-col gap-2.5 p-[18px] bg-paper-card border border-border rounded-lg">
              <div className="flex flex-col gap-[3px]">
                <Link href={`/marketplace/vendor/${vendor.slug}`} className="text-[17px] font-semibold text-ink">
                  {vendor.name}
                </Link>
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-text-muted">
                  {vendorCategoryLabels[(vendor.category || 'ostalo') as VendorCategory] || vendor.category}
                </span>
              </div>
              {vendor.location && <span className="text-sm text-text-secondary">{vendor.location}</span>}
              {vendor.working_hours && <span className="text-[13px] text-text-muted">{vendor.working_hours}</span>}
              <div className="flex items-center justify-between gap-2.5 mt-auto pt-2.5 border-t border-border">
                {vendor.phone ? (
                  <a href={telHref(vendor.phone)} className="font-mono text-sm text-ink">{vendor.phone}</a>
                ) : (
                  <span />
                )}
                <a href={mapUrl(vendor)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary">
                  Mapa →
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-text-muted">
          {q || category ? 'Nema rezultata za ovu pretragu.' : 'Imenik je još prazan.'}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-5 bg-primary-50 rounded-[10px] px-7 py-6">
        <span className="text-base font-medium text-primary-dark">
          Imate firmu ili radnju u Gornjem Milanovcu? Upis u imenik je besplatan.
        </span>
        <Link href="/imenik/upis" className="btn-primary">Upiši firmu</Link>
      </div>
    </div>
  );
}
