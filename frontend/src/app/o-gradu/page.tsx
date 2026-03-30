import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'O Gradu',
  description: 'Sve o Gornjem Milanovcu - istorija, znamenitosti, kultura, privreda i turizam Takovskog kraja u srcu Šumadije.',
  openGraph: {
    title: 'O Gradu | Gornji Milanovac',
    description: 'Sve o Gornjem Milanovcu - istorija, znamenitosti, kultura i tradicija Takovskog kraja.',
  },
};

const quickFacts = [
  { label: 'Stanovništvo', value: '~31.000' },
  { label: 'Površina', value: '836 km²' },
  { label: 'Nadmorska visina', value: '335 m' },
  { label: 'Poštanski broj', value: '32300' },
  { label: 'Pozivni broj', value: '+381 32' },
  { label: 'Okrug', value: 'Moravički' },
];

const landmarks = [
  {
    title: 'Takovski grm',
    description: 'Istorijski hrast pod kojim je knez Miloš podigao Drugi srpski ustanak 1815. godine. Jedno od najvažnijih istorijskih mesta u Srbiji.',
    icon: '🌳',
  },
  {
    title: 'Crkva Svetog Đorđa',
    description: 'Pravoslavna crkva iz 19. veka, zadužbina kneza Miloša Obrenovića, predstavlja značajan verski i kulturni spomenik grada.',
    icon: '⛪',
  },
  {
    title: 'Rudnička planina',
    description: 'Planina bogata prirodnim lepotama, idealna za izlete, planinarenje i uživanje u netaknutoj prirodi Šumadije.',
    icon: '⛰️',
  },
  {
    title: 'Muzej Takovskog ustanka',
    description: 'Muzej posvećen istoriji Drugog srpskog ustanka sa bogatom zbirkom eksponata iz tog perioda.',
    icon: '🏛️',
  },
];

const events = [
  {
    title: 'Takovsko proleće',
    description: 'Tradicionalna manifestacija koja se održava svake godine u aprilu, u čast Drugog srpskog ustanka.',
  },
  {
    title: 'Gornjomilanovački letnji festival',
    description: 'Kulturno-umetnička manifestacija sa bogatim programom muzičkih i pozorišnih dešavanja.',
  },
  {
    title: 'Vašar',
    description: 'Tradicionalni godišnji vašar sa bogatom ponudom domaćih proizvoda i zabavnim programom.',
  },
];

export default function OGraduPage() {
  return (
    <div className="bg-surface-alt min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary-dark text-white">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Gornji Milanovac
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 leading-relaxed">
              Grad u srcu Šumadije, poznat po bogatoj istoriji, industriji i lepotama prirode Takovskog kraja.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Facts Bar */}
      <div className="bg-white border-b border-border">
        <div className="container py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">{fact.value}</div>
                <div className="text-xs md:text-sm text-text-muted">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* History Section */}
            <section className="bg-white rounded-xl border border-border p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text mb-6">Istorija</h2>
              <div className="prose max-w-none">
                <p>
                  Gornji Milanovac je grad u centralnoj Srbiji, smešten u Takovskom kraju, u srcu Šumadije.
                  Grad je dobio ime po knezu Milošu Obrenoviću, vođi Drugog srpskog ustanka koji je podignut
                  upravo na ovom području, na Takovu, 1815. godine.
                </p>
                <p>
                  Takovski ustanak predstavlja ključni trenutak u srpskoj istoriji, kada je knez Miloš
                  podigao ustanak protiv Osmanlija pod čuvenim hrastom na Takovu. Ovaj događaj se svake
                  godine obeležava manifestacijom "Takovsko proleće".
                </p>
              </div>
            </section>

            {/* Landmarks Section */}
            <section>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text mb-6">Znamenitosti</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {landmarks.map((landmark) => (
                  <div
                    key={landmark.title}
                    className="bg-white rounded-xl border border-border p-6 hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="text-3xl mb-3">{landmark.icon}</div>
                    <h3 className="text-lg font-bold text-text mb-2">{landmark.title}</h3>
                    <p className="text-sm text-text-muted">{landmark.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Economy Section */}
            <section className="bg-white rounded-xl border border-border p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text mb-6">Privreda</h2>
              <div className="prose max-w-none">
                <p>
                  Gornji Milanovac je poznat kao industrijski centar, sa jakom metaloprerađivačkom,
                  automobilskom i prehrambenom industrijom. Grad je dom nekih od vodećih srpskih
                  kompanija i ima dugu tradiciju proizvodnje i preduzetništva.
                </p>
                <p>
                  Pored industrije, značajnu ulogu ima i poljoprivreda, posebno voćarstvo i
                  proizvodnja rakije od šljive, tradicionalnog srpskog pića.
                </p>
              </div>
            </section>

            {/* Events Section */}
            <section className="bg-white rounded-xl border border-border p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text mb-6">Kultura i manifestacije</h2>
              <ul className="space-y-4">
                {events.map((event) => (
                  <li key={event.title} className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-text">{event.title}</h3>
                      <p className="text-text-muted">{event.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Facts Widget */}
            <div className="sidebar-widget bg-gradient-to-br from-primary to-primary-dark text-white">
              <h3 className="text-lg font-bold mb-4">Osnovni podaci</h3>
              <dl className="space-y-3">
                {quickFacts.map((fact) => (
                  <div key={fact.label} className="flex justify-between">
                    <dt className="text-primary-100">{fact.label}</dt>
                    <dd className="font-medium">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Links Widget */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Korisni linkovi</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.gornjimilanovac.rs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 py-2 px-3 rounded-md text-text-muted hover:bg-surface-alt hover:text-primary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Opština Gornji Milanovac
                    <svg className="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="https://dz-gornjimilanovac.rs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 py-2 px-3 rounded-md text-text-muted hover:bg-surface-alt hover:text-primary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Dom Zdravlja
                    <svg className="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>

            {/* Important Phones */}
            <div className="sidebar-widget" id="vazni-telefoni">
              <h3 className="sidebar-widget-title">Važni telefoni</h3>
              <ul className="space-y-2">
                <li className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-muted">Hitna pomoć</span>
                  <a href="tel:194" className="font-bold text-accent">194</a>
                </li>
                <li className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-muted">Policija</span>
                  <a href="tel:192" className="font-bold text-accent">192</a>
                </li>
                <li className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-muted">Vatrogasci</span>
                  <a href="tel:193" className="font-bold text-accent">193</a>
                </li>
                <li className="flex items-center justify-between py-2">
                  <span className="text-text-muted">Opština GM</span>
                  <a href="tel:+38132712600" className="font-bold text-primary">032/712-600</a>
                </li>
              </ul>
            </div>

            {/* Contact CTA */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Imate pitanja?</h3>
              <p className="text-sm text-text-muted mb-4">
                Kontaktirajte nas za više informacija o gradu.
              </p>
              <Link
                href="/kontakt"
                className="block w-full text-center py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                Kontaktirajte nas
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
