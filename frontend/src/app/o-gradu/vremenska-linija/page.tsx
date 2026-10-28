import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vremenska linija',
  description: 'Prelomne godine u istoriji Gornjeg Milanovca, od Takovskog ustanka 1815. do danas.',
  openGraph: {
    title: 'Vremenska linija | Gornji Milanovac',
    description: 'Prelomne godine u istoriji Gornjeg Milanovca, od Takovskog ustanka 1815. do danas.',
  },
};

interface Entry {
  year: number;
  title: string;
  text: string;
}

interface Era {
  name: string;
  entries: Entry[];
}

// Newest first. Sources: sr.wikipedia.org and en.wikipedia.org, "Gornji Milanovac";
// the 2016 motorway section from en.wikipedia.org, "A2 motorway (Serbia)"
const eras: Era[] = [
  {
    name: 'Novije doba',
    entries: [
      {
        year: 2024,
        title: 'Zatvoreni bazen',
        text: 'Gradski bazeni dobili su novi zatvoreni bazen.',
      },
      {
        year: 2023,
        title: 'Kulturni centar „Mija Aleksić”',
        text: 'Kulturni centar nosi ime glumca Mije Aleksića.',
      },
      {
        year: 2016,
        title: 'Autoput i novi Dom kulture',
        text: 'U novembru je otvorena deonica autoputa Miloš Veliki od Ljiga do Preljine, koja prolazi pored grada. Iste godine otvoren je novi Dom kulture.',
      },
      {
        year: 1999,
        title: 'NATO bombardovanje',
        text: 'Grad je bombardovan jednom i oštećen je samo televizijski repetitor.',
      },
    ],
  },
  {
    name: 'Grad posle rata',
    entries: [
      {
        year: 1989,
        title: 'Prvi Bijenale umetnosti minijature',
        text: 'Pokrenuta je međunarodna izložba minijature koja se od tada održava svake druge godine.',
      },
      {
        year: 1965,
        title: 'Opština dobija današnje granice',
        text: 'Opštine Pranjani i Rudnik pripojene su opštini Gornji Milanovac.',
      },
      {
        year: 1961,
        title: 'FK Metalac i Tehnička škola',
        text: 'Osnovani su fudbalski klub Metalac i Tehnička škola „Jovan Žujović”.',
      },
      {
        year: 1959,
        title: 'Osnovan Metalac',
        text: 'Iste godine osnovan je i Graditelj. Metalac je postao najpoznatija firma grada.',
      },
      {
        year: 1947,
        title: 'Osnovan Takovo',
        text: 'Poljoprivredno-industrijski kombinat Takovo, kasnije deo Swisslion grupe.',
      },
    ],
  },
  {
    name: 'Drugi svetski rat',
    entries: [
      {
        year: 1944,
        title: 'Oslobođenje',
        text: 'Grad je oslobođen 17. septembra, posle borbe koja je trajala dvanaest sati.',
      },
      {
        year: 1941,
        title: 'Grad spaljen',
        text: 'Nemačke snage su 15. oktobra spalile oko 90% kuća. Od 40 uzetih talaca, 32 su streljana u Kragujevcu.',
      },
    ],
  },
  {
    name: 'Pruga, rat i fabrike',
    entries: [
      {
        year: 1937,
        title: 'Fabrika Šumadija',
        text: 'Otvorena je druga fabrika bombona u gradu.',
      },
      {
        year: 1933,
        title: 'Prva mešovita osnovna škola',
        text: 'Otvorio ju je kralj Aleksandar I.',
      },
      {
        year: 1922,
        title: 'Fabrika Rudnik i ponovo pruga',
        text: 'Otvorena je fabrika bombona i čokolade Rudnik, a uskotračna pruga ponovo je proradila.',
      },
      {
        year: 1921,
        title: 'Električno osvetljenje',
        text: 'Grad dobija struju i javnu rasvetu. Dve godine kasnije proradila je termoelektrana na ugalj.',
      },
      {
        year: 1914,
        title: 'Štab Prve armije',
        text: 'U Kolubarskoj bitki u gradu je bio štab vojvode Živojina Mišića. Plan bitke rađen je u zgradi okružnog načelstva.',
      },
      {
        year: 1912,
        title: 'Počinje gradnja pruge',
        text: 'Uskotračna pruga Čačak – Gornji Milanovac – Lajkovac. Ukinuta je 1969.',
      },
    ],
  },
  {
    name: 'Varoš raste',
    entries: [
      {
        year: 1892,
        title: 'Okružna bolnica',
        text: 'Dve godine ranije otvorena je i prva štamparija.',
      },
      {
        year: 1879,
        title: 'Otvorena gimnazija',
        text: 'Današnja gimnazija „Takovski ustanak”.',
      },
      {
        year: 1862,
        title: 'Završena crkva Svete Trojice',
        text: 'Gradila se uporedo sa varošicom. Varoš je tada imala 775 stanovnika.',
      },
    ],
  },
  {
    name: 'Postanak grada',
    entries: [
      {
        year: 1859,
        title: 'Ime Gornji Milanovac',
        text: 'Ukazom od 3. aprila Despotovica je preimenovana po Milanu Obrenoviću, bratu kneza Miloša.',
      },
      {
        year: 1857,
        title: 'Prva škola i čitalište',
        text: 'Osnovna škola prelazi iz Brusnice, a osniva se i Čitalište varoši Despotovica, preteča današnje biblioteke.',
      },
      {
        year: 1853,
        title: 'Osnovana Despotovica',
        text: 'Ukazom kneza Aleksandra Karađorđevića od 19. januara počinje gradnja varoši na Divljem polju, nazvane po reci Despotovici.',
      },
      {
        year: 1852,
        title: 'Varoš dobija plan',
        text: 'Komisija iz Beograda stigla je 22. aprila na Divlje polje. Prema planu inženjera Kamnika, ovo je prvi grad u Srbiji koji je imao plan pre gradnje.',
      },
      {
        year: 1815,
        title: 'Drugi srpski ustanak',
        text: 'Na Cveti, 23. aprila, na Takovu je Miloš Obrenović izabran za vođu ustanka.',
      },
    ],
  },
];

const entries = eras.flatMap((era) => era.entries.map((entry, i) => ({ ...entry, era: i === 0 ? era.name : null })));

// The space between two entries grows with the years between them
const PX_PER_YEAR = 3;

function yearsLabel(years: number): string {
  const lastTwo = years % 100;
  const last = years % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${years} godine ranije`;
  return `${years} godina ranije`;
}

export default function VremenskaLinijaPage() {
  const oldest = entries[entries.length - 1].year;

  return (
    <div className="bg-paper min-h-screen">
      <div className="container max-w-3xl py-12 md:py-20">
        <nav aria-label="Putanja" className="text-sm text-text-muted mb-8">
          <Link href="/o-gradu" className="hover:text-primary underline-offset-4 hover:underline">
            O gradu
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-text">Vremenska linija</span>
        </nav>

        <header className="mb-14 md:mb-20">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-ink leading-tight mb-4">
            Vremenska linija
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl">
            Kako je Despotovica postala Gornji Milanovac i šta ga je oblikovalo, od Takovskog ustanka {oldest}. godine.
            Najnovije je na vrhu.
          </p>
        </header>

        <h2 className="pl-10 md:pl-14 font-serif text-2xl md:text-3xl text-text-muted mb-10">{entries[0].era}</h2>
        <ol>
          {entries.map((item, index) => {
            const next = entries[index + 1];
            const gap = next ? item.year - next.year : 0;
            return (
              <li key={item.year} className="relative pl-10 md:pl-14">
                {item.era && index > 0 && (
                  <h2 className="font-serif text-2xl md:text-3xl text-text-muted pt-4 mb-10">{item.era}</h2>
                )}
                {/* Rail: one continuous line from the first dot to the last */}
                <span
                  className={`absolute left-[7px] md:left-[11px] w-0.5 bg-primary-200 ${index ? 'top-0' : 'top-9 md:top-12'} ${
                    next ? 'bottom-0' : 'h-5 md:h-8'
                  }`}
                  aria-hidden="true"
                />
                <div className="relative">
                  <span
                    className={`absolute -left-10 md:-left-[52px] top-5 md:top-8 w-4 h-4 rounded-full border-[3px] ${
                      next ? 'border-primary bg-paper' : 'border-accent bg-accent'
                    }`}
                    aria-hidden="true"
                  />

                  <div className="md:flex md:items-baseline md:gap-10">
                    <time
                      dateTime={String(item.year)}
                      className="block font-serif font-bold text-primary text-6xl md:text-8xl leading-none tracking-tight md:w-64 md:shrink-0"
                    >
                      {item.year}
                    </time>
                    <div className="mt-3 md:mt-0">
                      <h3 className="text-xl md:text-2xl font-serif text-ink leading-snug">{item.title}</h3>
                      <p className="mt-2 text-text-secondary leading-relaxed max-w-prose">{item.text}</p>
                    </div>
                  </div>
                </div>

                {next && (
                  <div
                    className="flex items-center text-sm text-text-muted"
                    style={{ minHeight: Math.max(72, gap * PX_PER_YEAR) }}
                  >
                    {yearsLabel(gap)}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-16 pt-8 border-t border-border text-sm text-text-muted space-y-4">
          <p>
            Izvor: članci o Gornjem Milanovcu i autoputu Miloš Veliki na Vikipediji. Ako znate datum koji nedostaje ili treba ispraviti,{' '}
            <Link href="/kontakt" className="text-primary hover:underline underline-offset-4">
              pišite redakciji
            </Link>
            .
          </p>
          <Link href="/o-gradu" className="inline-block text-base text-primary font-medium hover:underline underline-offset-4">
            Nazad na stranu O gradu
          </Link>
        </div>
      </div>
    </div>
  );
}
