import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListing, getListings, getAssetUrl, ListingCategory } from '@/lib/directus';
import ListingCard from '@/components/ListingCard';

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await getListing(params.slug);

  if (!listing) {
    return {
      title: 'Oglas nije pronađen',
    };
  }

  const firstImage = listing.images?.[0]?.directus_files_id;
  const ogImage = getAssetUrl(firstImage || null, { width: 1200, height: 630 });

  return {
    title: listing.title,
    description: listing.content?.replace(/<[^>]*>/g, '').slice(0, 160) || `Oglas: ${listing.title}`,
    openGraph: {
      title: listing.title,
      description: listing.content?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const listing = await getListing(params.slug);

  if (!listing) {
    notFound();
  }

  const category = listing.category as ListingCategory | null;
  const images = listing.images || [];

  const formatPrice = (price: number | null) => {
    if (!price) return 'Po dogovoru';
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  let relatedListings: any[] = [];
  if (category) {
    const related = await getListings({ limit: 4, category: category.slug });
    relatedListings = related.filter((l) => l.id !== listing.id).slice(0, 3);
  }

  return (
    <div className="container py-8">
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-primary">
              Početna
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <Link href="/oglasi" className="hover:text-primary">
              Oglasi
            </Link>
          </li>
          {category && (
            <>
              <li>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <Link href={`/oglasi?kategorija=${category.slug}`} className="hover:text-primary">
                  {category.name}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {images.length > 0 && (
            <div className="mb-8">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                <Image
                  src={getAssetUrl(images[0].directus_files_id, { width: 1200, height: 675 }) || ''}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
                {listing.status === 'sold' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-600 text-white text-2xl font-bold px-6 py-3 rounded">
                      PRODATO
                    </span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                      <Image
                        src={getAssetUrl(image.directus_files_id, { width: 200, height: 200 }) || ''}
                        alt={`${listing.title} - slika ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {listing.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-500">
            {category && (
              <Link
                href={`/oglasi?kategorija=${category.slug}`}
                className="inline-flex items-center px-3 py-1 bg-primary text-white text-sm font-semibold uppercase rounded"
              >
                {category.name}
              </Link>
            )}
            {listing.location && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {listing.location}
              </span>
            )}
          </div>

          <div
            className="prose max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: listing.content || '' }}
          />
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <p className="text-3xl font-bold text-secondary mb-6">
              {formatPrice(listing.price)}
            </p>

            <div className="space-y-4">
              {listing.contact_phone && (
                <a
                  href={`tel:${listing.contact_phone}`}
                  className="flex items-center justify-center w-full py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-800"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {listing.contact_phone}
                </a>
              )}

              {listing.contact_email && (
                <a
                  href={`mailto:${listing.contact_email}`}
                  className="flex items-center justify-center w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Pošalji email
                </a>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                ID oglasa: #{listing.id}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Sigurnosni saveti</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Nikada ne šaljite novac unapred</li>
              <li>• Proverite robu pre kupovine</li>
              <li>• Sastanite se na javnom mestu</li>
            </ul>
          </div>
        </aside>
      </div>

      {relatedListings.length > 0 && (
        <section className="mt-12 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Slični Oglasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedListings.map((relatedListing) => (
              <ListingCard key={relatedListing.id} listing={relatedListing} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
