import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import Link from 'next/link';
import { getListingCategories, ListingCategory } from '@/lib/api';
import ListingForm from '@/components/ListingForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Postavi oglas',
  description: 'Besplatno postavite mali oglas za Gornji Milanovac i okolinu.',
};

export default async function NewListingPage() {
  try { noStore(); } catch {}
  let categories: ListingCategory[] = [];
  try {
    categories = await getListingCategories();
  } catch (error) {
    console.error('Error fetching listing categories:', error);
  }

  return (
    <div className="container py-12 grid gap-12 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="eyebrow mb-2">Mali oglasi · besplatno</div>
        <h1 className="display-xl mb-3">Postavi oglas</h1>
        <p className="text-text-secondary mb-8 max-w-[60ch]">
          Oglas se objavljuje nakon pregleda redakcije i ostaje aktivan 30 dana.
        </p>
        <ListingForm categories={categories} />
      </div>

      <aside className="self-start sidebar-widget">
        <h2 className="sidebar-widget-title">Saveti</h2>
        <ul className="flex flex-col gap-3 text-sm text-text-secondary">
          <li>Naslov neka kaže šta prodajete i gde, npr. „Kuća 120 m² sa placem, Takovo“.</li>
          <li>Navedite stanje, godište ili dimenzije u opisu.</li>
          <li>Ostavite bar jedan kontakt - telefon ili email.</li>
        </ul>
        <Link href="/oglasi" className="section-link mt-5">Pogledaj sve oglase →</Link>
      </aside>
    </div>
  );
}
