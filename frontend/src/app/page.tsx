import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  getPosts,
  getListings,
  getProducts,
  getUpcomingEvents,
  getSettings,
  Post,
  Listing,
  Product,
  CommunityEvent,
} from '@/lib/api';
import { formatRelativeTime, formatEventDate } from '@/lib/format';
import { importantPhones, cityStats, telHref, safeHref } from '@/lib/site';
import HomeNews from '@/components/HomeNews';
import HomeListings from '@/components/HomeListings';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function ensureNoCache() { try { noStore(); } catch {} }

export const metadata: Metadata = {
  title: 'Gornji Milanovac - Digitalni Portal Šumadije',
  description: 'Najnovije vesti iz Gornjeg Milanovca i Takovskog kraja, događaji, mali oglasi i proizvodi lokalnih domaćinstava.',
  openGraph: {
    title: 'Gornji Milanovac - Digitalni Portal Šumadije',
    description: 'Najnovije vesti iz Gornjeg Milanovca i Takovskog kraja.',
    type: 'website',
  },
};

// Each section loads on its own so one failing query only empties that section
async function orEmpty<T>(label: string, promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error(`Error fetching home ${label}:`, error);
    return fallback;
  }
}

async function getHomeData() {
  ensureNoCache();
  const [posts, listings, products, events, settings] = await Promise.all([
    orEmpty<Post[]>('posts', getPosts({ limit: 18 }), []),
    orEmpty<Listing[]>('listings', getListings({ limit: 16 }), []),
    orEmpty<Product[]>('products', getProducts({ limit: 4 }), []),
    orEmpty<CommunityEvent[]>('events', getUpcomingEvents(4), []),
    orEmpty<Record<string, string>>('settings', getSettings(), {}),
  ]);

  const now = new Date();
  const newsItems = posts.map((post) => ({
    post,
    timeLabel: formatRelativeTime(post.published_at || post.created_at, now),
  }));

  return {
    newsItems,
    listings,
    products,
    events,
    alert: settings.site_alert?.trim() || '',
    alertLink: safeHref(settings.site_alert_link || ''),
  };
}

export default async function HomePage() {
  const { newsItems, listings, products, events, alert, alertLink } = await getHomeData();

  return (
    <>
      {/* Notice bar - shown while the "site_alert" setting has text */}
      {alert && (
        <div className="bg-ink text-paper text-sm">
          <div className="container flex flex-wrap items-center gap-x-3.5 gap-y-1.5 py-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] bg-accent px-2 py-[3px] rounded">
              Obaveštenje
            </span>
            <span>{alert}</span>
            {alertLink && (
              <a href={alertLink} className="text-paper underline underline-offset-[3px] hover:text-paper">
                Više informacija
              </a>
            )}
          </div>
        </div>
      )}

      <div className="container">
        {/* VESTI */}
        <section id="vesti" className="pt-12 pb-14 border-b border-border scroll-mt-24">
          <HomeNews items={newsItems} />
        </section>

        {/* ZAJEDNICA */}
        <section
          id="zajednica"
          className="py-14 border-b border-border grid gap-12 grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] scroll-mt-24"
        >
          <div>
            <div className="eyebrow mb-2">Zajednica</div>
            <h2 className="display-lg mb-6">Ove nedelje</h2>
            {events.length > 0 ? (
              <ul className="flex flex-col">
                {events.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </ul>
            ) : (
              <p className="py-4 border-t border-border text-[15px] text-text-muted">
                Trenutno nema najavljenih događaja.
              </p>
            )}
            <Link href="/kontakt" className="section-link mt-3.5">
              Najavite događaj →
            </Link>
          </div>

          <div className="self-start flex flex-col gap-[18px] bg-primary-50 rounded-[10px] p-6 sm:p-8">
            <span className="eyebrow">Inicijative građana</span>
            <h3 className="font-serif text-[26px] sm:text-[28px] leading-[1.15] font-medium text-pretty">
              Organizujete akciju u svom kraju? Objavićemo je i pomoći da okupite komšije.
            </h3>
            <p className="text-sm text-[#3E4A40]">
              Čišćenje, sadnja, humanitarna akcija ili tribina - javite redakciji šta, gde i kada.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/kontakt" className="btn-primary">Predloži akciju</Link>
            </div>
          </div>
        </section>

        {/* OGLASI */}
        <section id="oglasi" className="py-14 border-b border-border scroll-mt-24">
          <HomeListings listings={listings} />
        </section>

        {/* PRODAVNICA */}
        <section id="prodavnica" className="py-14 border-b border-border scroll-mt-24">
          <div className="grid gap-10 items-end mb-7 grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]">
            <div>
              <div className="eyebrow-accent mb-2">Prodavnica zajednice</div>
              <h2 className="display-lg">Sa Rudnika, Takova i Suvobora</h2>
            </div>
            <p className="text-base leading-[1.55] text-text-secondary max-w-[52ch]">
              Proizvodi lokalnih domaćinstava i zanatlija. Dogovor o preuzimanju i dostavi direktno sa proizvođačem.
            </p>
          </div>
          {products.length > 0 ? (
            <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))]">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-text-muted">Uskoro prvi proizvodi lokalnih proizvođača.</p>
          )}
          <Link href="/marketplace" className="section-link mt-6">
            Cela prodavnica →
          </Link>
        </section>

        {/* O GRADU */}
        <section
          id="grad"
          className="pt-14 pb-16 grid gap-12 grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] scroll-mt-24"
        >
          <div className="flex flex-col gap-[18px]">
            <div className="eyebrow">O gradu</div>
            <p className="font-serif text-[22px] sm:text-[26px] leading-[1.3] text-pretty">
              Gornji Milanovac je grad u centralnoj Srbiji, smešten u dolini Despotovice, okružen planinama Rudnik i Suvobor.
            </p>
            <div className="flex flex-wrap gap-9 pt-2">
              {cityStats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-serif text-[34px] font-medium">{stat.value}</span>
                  <span className="text-[13px] text-text-muted">{stat.label}</span>
                </div>
              ))}
            </div>
            <Link href="/o-gradu" className="section-link">
              Istorija i znamenitosti →
            </Link>
          </div>

          <div id="imenik" className="flex flex-col">
            <div className="eyebrow mb-2.5">Važni telefoni</div>
            {importantPhones.map((phone) => (
              <div key={phone.name} className="flex justify-between gap-3 py-3 border-t border-border text-[15px]">
                <span>{phone.name}</span>
                <a href={telHref(phone.number)} className="font-mono text-ink">
                  {phone.number}
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function EventRow({ event }: { event: CommunityEvent }) {
  const { day, date, time } = formatEventDate(event.starts_at);
  const href = event.url ? safeHref(event.url) : null;
  const title = href ? (
    <a href={href} className="text-base font-semibold text-ink">{event.title}</a>
  ) : (
    <span className="text-base font-semibold">{event.title}</span>
  );

  return (
    <li className="grid grid-cols-[64px_minmax(0,1fr)] gap-[18px] items-start py-3.5 border-t border-border">
      <div className="flex flex-col items-center py-1.5 border border-ink rounded-md">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em]">{day}</span>
        <span className="font-serif text-[26px] leading-none font-medium">{date}</span>
      </div>
      <div className="flex flex-col gap-1">
        {title}
        <span className="text-sm text-text-muted">
          {[event.location, time].filter(Boolean).join(' · ')}
        </span>
      </div>
    </li>
  );
}
