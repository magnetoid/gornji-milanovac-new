import Link from 'next/link';
import { Metadata } from 'next';
import {
  getVendors,
  getProducts,
  getServices,
  getMarketplaceStats,
  VendorCategory,
} from '@/lib/api';
import VendorCard from '@/components/VendorCard';
import ProductCard from '@/components/ProductCard';
import ServiceCard from '@/components/ServiceCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Lokalni Marketplace - Gornji Milanovac',
  description: 'Kupuj lokalno od farmera, zanatlija i malih preduzeća iz Gornjeg Milanovca. Proizvodi, usluge i rezervacije.',
  openGraph: {
    title: 'Lokalni Marketplace - Gornji Milanovac',
    description: 'Kupuj lokalno od farmera, zanatlija i malih preduzeća iz Gornjeg Milanovca.',
    type: 'website',
  },
};

interface CategoryInfo {
  slug: VendorCategory | string;
  name: string;
  icon: string;
  description: string;
}

const categories: CategoryInfo[] = [
  { slug: 'farma', name: 'Farme i Gazdinstava', icon: '🌾', description: 'Sveža hrana sa lokalnih farmi' },
  { slug: 'zanatstvo', name: 'Zanatstvo', icon: '🔨', description: 'Ručno izrađeni proizvodi' },
  { slug: 'usluge', name: 'Usluge', icon: '🛠️', description: 'Lokalne usluge i majstori' },
  { slug: 'trgovina', name: 'Trgovina', icon: '🏪', description: 'Male prodavnice i radnje' },
  { slug: 'turizam', name: 'Turizam i Ugostitelstvo', icon: '🏨', description: 'Smeštaj i restorani' },
  { slug: 'lepota', name: 'Lepota i Zdravlje', icon: '🧴', description: 'Saloni i zdravstvene usluge' },
  { slug: 'edukacija', name: 'Edukacija', icon: '📚', description: 'Kursevi i obuke' },
  { slug: 'popravke', name: 'Popravke', icon: '🔧', description: 'Servis i održavanje' },
];

async function getMarketplaceData() {
  try {
    const [stats, featuredVendors, latestProducts, latestServices] = await Promise.all([
      getMarketplaceStats(),
      getVendors({ featured: true, limit: 4 }),
      getProducts({ limit: 6 }),
      getServices({ limit: 4 }),
    ]);

    return {
      stats,
      featuredVendors,
      latestProducts,
      latestServices,
    };
  } catch (error) {
    console.error('Error fetching marketplace data:', error);
    return {
      stats: { vendors: 0, products: 0, services: 0 },
      featuredVendors: [],
      latestProducts: [],
      latestServices: [],
    };
  }
}

export default async function MarketplacePage() {
  const { stats, featuredVendors, latestProducts, latestServices } = await getMarketplaceData();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
              Lokalni Marketplace
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-6">
              Kupuj direktno od lokalnih proizvođača, farmera i zanatlija iz Gornjeg Milanovca i okoline.
              Podrži lokalnu ekonomiju i uživaj u kvalitetnim proizvodima.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/marketplace/registracija"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-primary-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Registruj svoj biznis
              </Link>
              <a
                href="#kategorije"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
              >
                Pretraži kategorije
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-border">
        <div className="container py-6">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.vendors}</p>
              <p className="text-sm text-text-muted">Prodavaca</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.products}</p>
              <p className="text-sm text-text-muted">Proizvoda</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.services}</p>
              <p className="text-sm text-text-muted">Usluga</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12">
        {/* Featured Vendors */}
        {featuredVendors.length > 0 && (
          <section className="mb-12">
            <div className="section-header">
              <h2 className="section-title">Istaknuti Prodavci</h2>
              <Link href="/marketplace/farma" className="section-link">
                Svi prodavci
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} variant="featured" />
              ))}
            </div>
          </section>
        )}

        {/* Categories Grid */}
        <section id="kategorije" className="mb-12">
          <div className="section-header">
            <h2 className="section-title">Kategorije</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/marketplace/${category.slug}`}
                className="group p-4 bg-white border border-border rounded-lg hover:border-primary hover:shadow-md transition-all text-center"
              >
                <span className="text-3xl mb-2 block">{category.icon}</span>
                <h3 className="font-medium text-text group-hover:text-primary transition-colors text-sm">
                  {category.name}
                </h3>
                <p className="text-xs text-text-muted mt-1 line-clamp-1">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Products */}
        {latestProducts.length > 0 && (
          <section className="mb-12">
            <div className="section-header">
              <h2 className="section-title">Najnoviji Proizvodi</h2>
              <Link href="/marketplace/hrana" className="section-link">
                Svi proizvodi
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Latest Services */}
        {latestServices.length > 0 && (
          <section className="mb-12">
            <div className="section-header">
              <h2 className="section-title">Usluge sa Rezervacijom</h2>
              <Link href="/marketplace/usluge" className="section-link">
                Sve usluge
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-text mb-4">
            Imaš lokalni biznis?
          </h2>
          <p className="text-text-muted mb-6 max-w-2xl mx-auto">
            Registruj svoj biznis na našem marketplace-u potpuno besplatno i dosegni više kupaca iz Gornjeg Milanovca i okoline.
          </p>
          <Link
            href="/marketplace/registracija"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Registruj svog prodavca
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      </div>
    </>
  );
}
