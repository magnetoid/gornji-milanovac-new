import { unstable_noStore as noStore } from 'next/cache';
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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function ensureNoCache() { try { noStore(); } catch {} }

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
  { slug: 'lepota', name: 'Lepota i Zdravlje', icon: '💆', description: 'Saloni i zdravstvene usluge' },
  { slug: 'edukacija', name: 'Edukacija', icon: '📚', description: 'Kursevi i obuke' },
  { slug: 'ostalo', name: 'Ostalo', icon: '📦', description: 'Ostale kategorije' },
];

async function getMarketplaceData() {
  ensureNoCache();
  try {
    const [stats, featuredVendors, latestProducts, latestServices] = await Promise.all([
      getMarketplaceStats(),
      getVendors({ featured: true, limit: 3 }),
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
      <section className="bg-primary relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container py-16 md:py-20 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-sm mb-6">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Podrži lokalnu ekonomiju
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-6">
              Lokalni Marketplace<br />
              <span className="text-accent-light">Gornjeg Milanovca</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
              Kupuj direktno od lokalnih proizvođača, farmera i zanatlija. Podrži komšije i uživaj u kvalitetnim domaćim proizvodima.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/marketplace/registracija"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary font-medium rounded-lg hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Registruj svoj biznis
              </Link>
              <a
                href="#kategorije"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all border border-white/20"
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
        <div className="container py-8">
          <div className="grid grid-cols-3 gap-6 md:gap-12">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-serif font-bold text-primary">{stats.vendors}</p>
              <p className="text-sm text-text-muted mt-1">Lokalnih prodavaca</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-serif font-bold text-primary">{stats.products}</p>
              <p className="text-sm text-text-muted mt-1">Proizvoda</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-serif font-bold text-primary">{stats.services}</p>
              <p className="text-sm text-text-muted mt-1">Usluga</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section id="kategorije" className="bg-surface-warm py-12">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-text mb-3">Pretraži po kategorijama</h2>
            <p className="text-text-muted">Pronađi lokalne prodavce i usluge koje ti trebaju</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/marketplace/${category.slug}`}
                className="group p-6 bg-white border border-border rounded-xl hover:border-primary hover:shadow-lg transition-all text-center"
              >
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{category.icon}</span>
                <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-text-muted mt-1.5 line-clamp-1">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vendors */}
      {featuredVendors.length > 0 && (
        <section className="bg-white py-12 border-t border-border">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Istaknuti prodavci</h2>
              <Link href="/marketplace/farma" className="section-link">
                Svi prodavci
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} variant="featured" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <section className="bg-surface-warm py-12">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Najnoviji proizvodi</h2>
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
          </div>
        </section>
      )}

      {/* Latest Services */}
      {latestServices.length > 0 && (
        <section className="bg-white py-12 border-t border-border">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Usluge sa rezervacijom</h2>
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
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-4">
            Imaš lokalni biznis?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg">
            Registruj se na našem marketplace-u potpuno besplatno i dosegni hiljade potencijalnih kupaca iz Gornjeg Milanovca i okoline.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/marketplace/registracija"
              className="px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-primary-50 transition-all shadow-lg"
            >
              Registruj svog prodavca
            </Link>
            <Link
              href="/kontakt"
              className="px-8 py-4 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Saznaj više
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
