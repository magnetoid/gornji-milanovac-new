import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'O Gradu',
  description: 'Sve o Gornjem Milanovcu - istorija, znamenitosti, kultura, privreda i turizam Takovskog kraja u srcu Šumadije.',
  openGraph: {
    title: 'O Gradu | Gornji Milanovac',
    description: 'Sve o Gornjem Milanovcu - istorija, znamenitosti, kultura i tradicija Takovskog kraja.',
  },
};

const quickFacts = [
  { label: 'Stanovništvo', value: '~31.000', icon: '👥' },
  { label: 'Površina', value: '836 km²', icon: '📐' },
  { label: 'Nadmorska visina', value: '335 m', icon: '⛰️' },
  { label: 'Poštanski broj', value: '32300', icon: '📮' },
  { label: 'Pozivni broj', value: '+381 32', icon: '📞' },
  { label: 'Okrug', value: 'Moravički', icon: '🗺️' },
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

const timeline = [
  { year: '1815', event: 'Podizanje Drugog srpskog ustanka na Takovu' },
  { year: '1853', event: 'Gornji Milanovac dobija status varošice' },
  { year: '1880', event: 'Izgrađena Crkva Svetog Đorđa' },
  { year: '1920', event: 'Početak industrijske ere' },
  { year: '1965', event: 'Osnivanje metaloprerađivačke industrije' },
  { year: '2000', event: 'Modernizacija i razvoj turizma' },
];

const events = [
  {
    title: 'Takovsko proleće',
    date: 'April',
    description: 'Tradicionalna manifestacija koja se održava svake godine u aprilu, u čast Drugog srpskog ustanka.',
  },
  {
    title: 'Gornjomilanovački letnji festival',
    date: 'Jul/Avgust',
    description: 'Kulturno-umetnička manifestacija sa bogatim programom muzičkih i pozorišnih dešavanja.',
  },
  {
    title: 'Vašar',
    date: 'Septembar',
    description: 'Tradicionalni godišnji vašar sa bogatom ponudom domaćih proizvoda i zabavnim programom.',
  },
];

const famousPeople = [
  { name: 'Knez Miloš Obrenović', role: 'Vođa Drugog srpskog ustanka' },
  { name: 'Desanka Maksimović', role: 'Pesnikinja (poreklom iz okoline)' },
  { name: 'Dragoslav Šekularac', role: 'Legendarni fudbaler' },
];

export default function OGraduPage() {
  return (
    <div className="bg-surface-warm min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark" />
        <div className="container py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/90 text-sm mb-6">
              Dobrodošli
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Gornji Milanovac
            </h1>
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
              Grad u srcu Šumadije, poznat po bogatoj istoriji, industriji i lepotama prirode Takovskog kraja.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Facts Bar */}
      <section className="bg-white border-b border-border">
        <div className="container py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="text-center">
                <span className="text-2xl mb-1 block">{fact.icon}</span>
                <div className="text-xl md:text-2xl font-serif font-bold text-primary">{fact.value}</div>
                <div className="text-xs text-text-muted mt-0.5">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* History Section */}
            <section className="bg-white rounded-xl border border-border p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">📜</span>
                Istorija
              </h2>
              <div className="prose max-w-none">
                <p className="text-text-secondary leading-relaxed">
                  Gornji Milanovac je grad u centralnoj Srbiji, smešten u Takovskom kraju, u srcu Šumadije.
                  Grad je dobio ime po knezu Milošu Obrenoviću, vođi Drugog srpskog ustanka koji je podignut
                  upravo na ovom području, na Takovu, 1815. godine.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  Takovski ustanak predstavlja ključni trenutak u srpskoj istoriji, kada je knez Miloš
                  podigao ustanak protiv Osmanlija pod čuvenim hrastom na Takovu. Ovaj događaj se svake
                  godine obeležava manifestacijom "Takovsko proleće".
                </p>
              </div>
            </section>

            {/* Timeline */}
            <section>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">🕐</span>
                Vremenska linija
              </h2>
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/20" />
                  <div className="space-y-6">
                    {timeline.map((item, index) => (
                      <div key={index} className="flex gap-6 relative">
                        <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center relative z-10">
                          {item.year.slice(-2)}
                        </div>
                        <div className="flex-1 pb-6">
                          <span className="text-sm font-bold text-primary">{item.year}</span>
                          <p className="text-text-secondary mt-1">{item.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Landmarks Section */}
            <section>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">🏛️</span>
                Znamenitosti
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {landmarks.map((landmark) => (
                  <div
                    key={landmark.title}
                    className="bg-white rounded-xl border border-border p-6 hover:border-primary hover:shadow-lg transition-all group"
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{landmark.icon}</div>
                    <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors">{landmark.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{landmark.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Economy Section */}
            <section className="bg-white rounded-xl border border-border p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">🏭</span>
                Privreda
              </h2>
              <div className="prose max-w-none">
                <p className="text-text-secondary leading-relaxed">
                  Gornji Milanovac je poznat kao industrijski centar, sa jakom metaloprerađivačkom,
                  automobilskom i prehrambenom industrijom. Grad je dom nekih od vodećih srpskih
                  kompanija i ima dugu tradiciju proizvodnje i preduzetništva.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  Pored industrije, značajnu ulogu ima i poljoprivreda, posebno voćarstvo i
                  proizvodnja rakije od šljive, tradicionalnog srpskog pića.
                </p>
              </div>
            </section>

            {/* Events Section */}
            <section className="bg-white rounded-xl border border-border p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">🎭</span>
                Manifestacije
              </h2>
              <div className="space-y-6">
                {events.map((event) => (
                  <div key={event.title} className="flex items-start gap-4 pb-6 border-b border-border last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-accent font-bold text-sm text-center">{event.date}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-text mb-1">{event.title}</h3>
                      <p className="text-text-muted text-sm">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Facts Widget */}
            <div className="sidebar-widget bg-gradient-to-br from-primary to-primary-dark text-white border-none">
              <h3 className="text-lg font-bold mb-5">Osnovni podaci</h3>
              <dl className="space-y-3">
                {quickFacts.map((fact) => (
                  <div key={fact.label} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                    <dt className="text-white/70 text-sm">{fact.label}</dt>
                    <dd className="font-semibold">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Famous People Widget */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Poznate ličnosti</h3>
              <ul className="space-y-3">
                {famousPeople.map((person) => (
                  <li key={person.name} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-muted rounded-full flex items-center justify-center text-primary font-bold">
                      {person.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-text text-sm">{person.name}</p>
                      <p className="text-xs text-text-muted">{person.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links Widget */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Korisni linkovi</h3>
              <ul className="space-y-2">
                {[
                  { name: 'Opština Gornji Milanovac', href: 'https://www.gornjimilanovac.rs' },
                  { name: 'Dom Zdravlja', href: 'https://dz-gornjimilanovac.rs' },
                  { name: 'Turistička organizacija', href: 'https://www.togm.rs' },
                ].map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-text-secondary hover:bg-surface-muted hover:text-primary transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Phones */}
            <div className="sidebar-widget" id="vazni-telefoni">
              <h3 className="sidebar-widget-title">Važni telefoni</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Hitna pomoć', number: '194', color: 'red' },
                  { name: 'Policija', number: '192', color: 'blue' },
                  { name: 'Vatrogasci', number: '193', color: 'orange' },
                  { name: 'Opština GM', number: '032/712-600', color: 'primary' },
                ].map((phone) => (
                  <li key={phone.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-text-secondary text-sm">{phone.name}</span>
                    <a href={`tel:${phone.number.replace(/[^0-9+]/g, '')}`} className="font-bold text-primary hover:text-primary-dark transition-colors">
                      {phone.number}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact CTA */}
            <div className="sidebar-widget bg-surface-muted border-none">
              <h3 className="text-lg font-bold text-text mb-2">Imate pitanja?</h3>
              <p className="text-sm text-text-muted mb-4">
                Kontaktirajte nas za više informacija o gradu.
              </p>
              <Link
                href="/kontakt"
                className="block w-full text-center py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-light transition-colors"
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
