import Link from 'next/link';
import type { Product } from '@/lib/api';
import { getAssetUrl, formatPrice } from '@/lib/format';
import Thumb from './Thumb';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const href = `/marketplace/proizvod/${product.slug}`;
  const imageUrl = getAssetUrl(product.images?.[0] || null);
  const vendor = product.vendor;
  const maker = [vendor?.name, vendor?.location].filter(Boolean).join(', ');
  const price = formatPrice(product.price);
  const unit = product.price !== null && product.price_unit ? ` / ${product.price_unit}` : '';

  return (
    <article className="flex flex-col gap-2.5">
      <Link href={href} className="relative block">
        <Thumb src={imageUrl} alt={product.title} className="aspect-square rounded-lg" stripes="accent" />
        {!product.available && (
          <span className="absolute top-2.5 left-2.5 tag bg-ink text-paper">Nije dostupno</span>
        )}
      </Link>
      <Link href={href} className="text-base font-semibold text-ink leading-snug line-clamp-2">
        {product.title}
      </Link>
      {maker && vendor?.slug && (
        <Link href={`/marketplace/vendor/${vendor.slug}`} className="text-[13px] text-text-muted truncate">
          {maker}
        </Link>
      )}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <span className="font-serif text-xl font-semibold">
          {price}
          {unit && <span className="font-sans text-[13px] font-normal text-text-muted">{unit}</span>}
        </span>
        <Link href={href} className="btn-outline-accent px-3 py-2 text-[13px]">
          Pogledaj
        </Link>
      </div>
    </article>
  );
}
