import { Metadata } from 'next';
import Link from 'next/link';
import { vendorCategoryLabels } from '@/lib/api';
import VendorForm from '@/components/VendorForm';

export const metadata: Metadata = {
  title: 'Upiši firmu',
  description: 'Besplatan upis firme, radnje ili zanata u imenik Gornjeg Milanovca.',
};

export default function UpisPage() {
  return (
    <div className="container py-12 grid gap-12 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="eyebrow mb-2">Lokalni imenik · besplatno</div>
        <h1 className="display-xl mb-3">Upiši firmu</h1>
        <p className="text-text-secondary mb-8 max-w-[60ch]">
          Upis se objavljuje u imeniku i prodavnici zajednice nakon provere redakcije.
        </p>
        <VendorForm categories={vendorCategoryLabels} />
      </div>

      <aside className="self-start sidebar-widget">
        <h2 className="sidebar-widget-title">Šta dobijate</h2>
        <ul className="flex flex-col gap-3 text-sm text-text-secondary">
          <li>Kontakt, adresu i radno vreme u imeniku grada.</li>
          <li>Svoju stranicu na kojoj možete ponuditi proizvode i usluge.</li>
          <li>Upis i izmene su besplatni.</li>
        </ul>
        <Link href="/imenik" className="section-link mt-5">Pogledaj imenik →</Link>
      </aside>
    </div>
  );
}
