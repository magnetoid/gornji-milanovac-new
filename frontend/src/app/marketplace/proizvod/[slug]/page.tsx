import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getProductBySlug,
  getProducts,
  getAssetUrl,
  productCategoryLabels,
  Vendor,
  ProductCategory,
} from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ContactVendorForm from '@/components/ContactVendorForm';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Proizvod nije pronađen' };
  }

  const firstImage = product.images?.[0];

  return {
    title: `${product.title} - Marketplace Gornji Milanovac`,
    description: product.description?.replace(/<[^>]*>/g, '').slice(0, 160) || `${product.title} na Gornji Milanovac marketplace-u.`,
    openGraph: {
      title: product.title,
      description: product.description?.replace(/<[^>]*>/g, '').slice(0, 160) || undefined,
      images: firstImage ? [getAssetUrl(firstImage) || ''] : [],
    },
  };
}

function formatPrice(price: number | null, unit: string | null): string {
  if (price === null) return 'Po dogovoru';

  const formattedPrice = new Intl.NumberFormat('sr-RS', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price);

  const unitLabel = unit ? `/${unit}` : '';
  return `${formattedPrice} RSD${unitLabel}`;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const vendor = product.vendor as Partial<Vendor> | undefined;
  const categoryLabel = product.category ? productCategoryLabels[product.category as ProductCategory] : null;

  // Get related products
  const relatedProducts = await getProducts({
    category: product.category as ProductCategory || undefined,
    limit: 4,
  }).then((products) => products.filter((p) => p.id !== product.id).slice(0, 3));

  const mainImage = product.images?.[0];
  const allImages = product.images || [];

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
          {product.category && (
            <>
              <li>
                <Link href={`/marketplace/${product.category}`} className="hover:text-primary transition-colors">
                  {categoryLabel}
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
            </>
          )}
          <li className="text-text font-medium truncate max-w-[200px]">{product.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Gallery - 2/3 */}
        <div className="lg:col-span-2">
          {/* Main Image */}
          <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-4">
            {mainImage ? (
              <Image
                src={getAssetUrl(mainImage) || ''}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}

            {/* Category Badge */}
            {categoryLabel && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-sm font-medium rounded-full">
                {categoryLabel}
              </span>
            )}

            {/* Availability */}
            {!product.available && (
              <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
                <span className="bg-gray-800 text-white text-lg font-medium px-6 py-3 rounded-lg">
                  Nije dostupno
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-border"
                >
                  <Image
                    src={getAssetUrl(imageUrl) || ''}
                    alt={`${product.title} - slika ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-text mb-4">Opis</h2>
              <div
                className="prose prose-sm max-w-none text-text-muted"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>

        {/* Sidebar - Info & Contact */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl p-6 sticky top-24">
            <h1 className="text-2xl font-serif font-bold text-text mb-2">
              {product.title}
            </h1>

            <p className="text-3xl font-bold text-primary mb-6">
              {formatPrice(product.price, product.price_unit)}
            </p>

            {/* Vendor Info */}
            {vendor && (
              <Link
                href={`/marketplace/vendor/${vendor.slug}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-6"
              >
                {vendor.logo_url ? (
                  <Image
                    src={getAssetUrl(vendor.logo_url) || ''}
                    alt={vendor.name || ''}
                    width={40}
                    height={40}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{vendor.name?.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text truncate">{vendor.name}</p>
                  {vendor.location && (
                    <p className="text-xs text-text-muted truncate">{vendor.location}</p>
                  )}
                </div>
                <svg className="w-5 h-5 text-text-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            {/* Contact Form */}
            <ContactVendorForm
              vendorEmail={product.contact_email || vendor?.email || null}
              vendorPhone={product.contact_phone || vendor?.phone || null}
              vendorName={vendor?.name || 'Prodavac'}
              productName={product.title}
            />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <div className="section-header">
            <h2 className="section-title">Slični proizvodi</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
