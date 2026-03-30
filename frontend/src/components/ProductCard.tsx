import Link from 'next/link';
import Image from 'next/image';
import { Product, Vendor, getAssetUrl, productCategoryLabels } from '@/lib/directus';

interface ProductCardProps {
  product: Product;
}

const categoryColors: Record<string, string> = {
  hrana: 'bg-orange-100 text-orange-800',
  pice: 'bg-blue-100 text-blue-800',
  meso: 'bg-red-100 text-red-800',
  voce_povrce: 'bg-green-100 text-green-800',
  mlecni: 'bg-sky-100 text-sky-800',
  med: 'bg-amber-100 text-amber-800',
  preradjevine: 'bg-yellow-100 text-yellow-800',
  zanatski: 'bg-purple-100 text-purple-800',
  ostalo: 'bg-gray-100 text-gray-800',
};

function formatPrice(price: number | null, unit: string | null): string {
  if (price === null) return 'Po dogovoru';

  const formattedPrice = new Intl.NumberFormat('sr-RS', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price);

  const unitLabel = unit ? `/${unit}` : '';
  return `${formattedPrice} RSD${unitLabel}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images?.[0]?.directus_files_id;
  const imageUrl = getAssetUrl(firstImage || null, { width: 400, height: 300, quality: 80 });
  const vendor = product.vendor_id as Vendor | null;
  const categoryLabel = product.category ? productCategoryLabels[product.category] : null;
  const categoryColorClass = product.category ? categoryColors[product.category] : categoryColors.ostalo;

  return (
    <article className="group bg-white border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-md">
      <Link href={`/marketplace/proizvod/${product.slug}`} className="block">
        <div className="relative h-44">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}

          {/* Category badge */}
          {categoryLabel && (
            <span className={`absolute top-3 left-3 px-2 py-0.5 text-xs font-medium rounded-full ${categoryColorClass}`}>
              {categoryLabel}
            </span>
          )}

          {/* Featured badge */}
          {product.featured && (
            <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-white">
              Istaknuto
            </span>
          )}

          {/* Not available overlay */}
          {!product.available && (
            <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded">
                Nije dostupno
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/marketplace/proizvod/${product.slug}`}>
          <h3 className="font-bold text-text leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {product.title}
          </h3>
        </Link>

        <p className="text-lg font-bold text-primary mb-3">
          {formatPrice(product.price, product.price_unit)}
        </p>

        {/* Vendor info */}
        {vendor && typeof vendor === 'object' && (
          <Link
            href={`/marketplace/vendor/${vendor.slug}`}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-primary transition-colors"
          >
            {vendor.logo ? (
              <Image
                src={getAssetUrl(vendor.logo, { width: 32, height: 32 }) || ''}
                alt={vendor.name}
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{vendor.name.charAt(0)}</span>
              </div>
            )}
            <span className="truncate">{vendor.name}</span>
            {vendor.location && (
              <>
                <span className="text-text-light">·</span>
                <span className="truncate text-text-light">{vendor.location}</span>
              </>
            )}
          </Link>
        )}
      </div>
    </article>
  );
}
