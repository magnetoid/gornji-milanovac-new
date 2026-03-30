import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getVendors,
  getProducts,
  getServices,
  VendorCategory,
  ProductCategory,
  ServiceCategory,
  vendorCategoryLabels,
  productCategoryLabels,
  serviceCategoryLabels,
} from '@/lib/directus';
import VendorCard from '@/components/VendorCard';
import ProductCard from '@/components/ProductCard';
import ServiceCard from '@/components/ServiceCard';

export const revalidate = 60;

interface CategoryInfo {
  name: string;
  description: string;
  icon: string;
  type: 'vendor' | 'product' | 'service';
}

const categoryMap: Record<string, CategoryInfo> = {
  // Vendor categories
  farma: { name: 'Farme i Gazdinstava', description: 'Sveži lokalni proizvodi direktno sa farmi iz okoline Gornjeg Milanovca.', icon: '🌾', type: 'vendor' },
  zanatstvo: { name: 'Zanatstvo', description: 'Tradicionalni zanati i ručno izrađeni proizvodi.', icon: '🔨', type: 'vendor' },
  usluge: { name: 'Usluge', description: 'Lokalne usluge i majstori iz Gornjeg Milanovca.', icon: '🛠️', type: 'vendor' },
  trgovina: { name: 'Trgovina', description: 'Male lokalne prodavnice i radnje.', icon: '🏪', type: 'vendor' },
  turizam: { name: 'Turizam i Ugostitelstvo', description: 'Smeštaj, restorani i turistički sadržaji.', icon: '🏨', type: 'vendor' },
  // Product categories
  hrana: { name: 'Hrana', description: 'Domaća hrana i prehrambeni proizvodi.', icon: '🍞', type: 'product' },
  pice: { name: 'Piće', description: 'Domaća pića, sokovi i vina.', icon: '🍷', type: 'product' },
  meso: { name: 'Meso', description: 'Sveže meso i mesne prerađevine.', icon: '🥩', type: 'product' },
  voce_povrce: { name: 'Voće i Povrće', description: 'Sezonsko voće i povrće.', icon: '🥬', type: 'product' },
  mlecni: { name: 'Mlečni Proizvodi', description: 'Domaći mlečni proizvodi.', icon: '🧀', type: 'product' },
  med: { name: 'Med', description: 'Lokalni pčelarski proizvodi.', icon: '🍯', type: 'product' },
  preradjevine: { name: 'Prerađevine', description: 'Domaće prerađevine i konzerve.', icon: '🫙', type: 'product' },
  zanatski: { name: 'Zanatski Proizvodi', description: 'Ručno izrađeni zanatski proizvodi.', icon: '🎨', type: 'product' },
  // Service categories
  popravke: { name: 'Popravke', description: 'Servisi i popravke raznih uređaja.', icon: '🔧', type: 'service' },
  gradjevina: { name: 'Građevina', description: 'Građevinske usluge i majstori.', icon: '🏗️', type: 'service' },
  lepota: { name: 'Lepota i Wellness', description: 'Frizerski i kozmetički saloni.', icon: '💇', type: 'service' },
  zdravlje: { name: 'Zdravlje', description: 'Zdravstvene usluge i ordinacije.', icon: '🏥', type: 'service' },
  edukacija: { name: 'Edukacija', description: 'Kursevi, obuke i časovi.', icon: '📚', type: 'service' },
  prevoz: { name: 'Prevoz', description: 'Prevozničke usluge i dostava.', icon: '🚚', type: 'service' },
  ugostitelstvo: { name: 'Ugostiteljstvo', description: 'Restorani, kafići i ketering.', icon: '🍽️', type: 'service' },
  ostalo: { name: 'Ostalo', description: 'Ostale kategorije.', icon: '📦', type: 'vendor' },
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const info = categoryMap[category];

  if (!info) {
    return { title: 'Kategorija nije pronađena' };
  }

  return {
    title: `${info.name} - Marketplace Gornji Milanovac`,
    description: info.description,
  };
}

async function getCategoryData(category: string, type: 'vendor' | 'product' | 'service') {
  try {
    if (type === 'vendor') {
      const [vendors, products, services] = await Promise.all([
        getVendors({ category: category as VendorCategory, limit: 20 }),
        getProducts({ limit: 6 }),
        getServices({ limit: 4 }),
      ]);
      return { vendors, products, services };
    } else if (type === 'product') {
      const [products, vendors] = await Promise.all([
        getProducts({ category: category as ProductCategory, limit: 20 }),
        getVendors({ limit: 4 }),
      ]);
      return { vendors, products, services: [] };
    } else {
      const [services, vendors] = await Promise.all([
        getServices({ category: category as ServiceCategory, limit: 20 }),
        getVendors({ limit: 4 }),
      ]);
      return { vendors, products: [], services };
    }
  } catch (error) {
    console.error('Error fetching category data:', error);
    return { vendors: [], products: [], services: [] };
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const info = categoryMap[category];

  if (!info) {
    notFound();
  }

  const { vendors, products, services } = await getCategoryData(category, info.type);

  return (
    <div className="container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-text-muted">
          <li>
            <Link href="/marketplace" className="hover:text-primary transition-colors">
              Marketplace
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li className="text-text font-medium">{info.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{info.icon}</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-text">
              {info.name}
            </h1>
            <p className="text-text-muted">{info.description}</p>
          </div>
        </div>
      </div>

      {/* Vendors Section */}
      {info.type === 'vendor' && vendors.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-text mb-6">Prodavci</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} variant="grid" />
            ))}
          </div>
        </section>
      )}

      {/* Products Section */}
      {info.type === 'product' && products.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-text mb-6">Proizvodi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Services Section */}
      {info.type === 'service' && services.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-text mb-6">Usluge</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {vendors.length === 0 && products.length === 0 && services.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text mb-2">Nema rezultata</h3>
          <p className="text-text-muted mb-6">
            Trenutno nema aktivnih unosa u ovoj kategoriji.
          </p>
          <Link
            href="/marketplace/registracija"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Budi prvi - registruj se
          </Link>
        </div>
      )}

      {/* Related Products (for vendor categories) */}
      {info.type === 'vendor' && products.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <div className="section-header">
            <h2 className="section-title">Proizvodi iz ove kategorije</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
