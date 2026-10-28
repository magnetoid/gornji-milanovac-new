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

// Newest first
const timeline = [
  { year: 2000, event: 'Modernizacija i razvoj turizma' },
  { year: 1965, event: 'Osnivanje metaloprerađivačke industrije' },
  { year: 1920, event: 'Početak industrijske ere' },
  { year: 1880, event: 'Izgrađena Crkva Svetog Đorđa' },
  { year: 1853, event: 'Gornji Milanovac dobija status varošice' },
  { year: 1815, event: 'Podizanje Drugog srpskog ustanka na Takovu' },
];

// The space between two entries grows with the years between them
const PX_PER_YEAR = 3;

function yearsLabel(years: number): string {
  const lastTwo = years % 100;
  const last = years % 10;
  if (last === 1 && lastTwo !== 11) return `${years} godina ranije`;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${years} godine ranije`;
  return `${years} godina ranije`;
}

export default function VremenskaLinijaPage() {
  const oldest = timeline[timeline.length - 1].year;
  const newest = timeline[0].year;

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
            {newest - oldest} godina Gornjeg Milanovca u šest prelomnih trenutaka, od najnovijeg do Takovskog ustanka.
          </p>
        </header>

        <ol className="relative">
          {timeline.map((item, index) => {
            const next = timeline[index + 1];
            const gap = next ? item.year - next.year : 0;
            return (
              <li key={item.year} className="relative pl-10 md:pl-14">
                {/* Rail: runs down to the next entry */}
                {next && (
                  <span className="absolute left-[7px] md:left-[11px] top-9 md:top-12 bottom-0 w-0.5 bg-primary-200" aria-hidden="true" />
                )}
                <span
                  className={`absolute left-0 md:left-1 top-5 md:top-8 w-4 h-4 rounded-full border-[3px] ${
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
                  <p className="mt-3 md:mt-0 text-xl md:text-2xl font-serif text-ink leading-snug">{item.event}</p>
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

        <div className="mt-16 pt-8 border-t border-border">
          <Link href="/o-gradu" className="text-primary font-medium hover:underline underline-offset-4">
            Nazad na stranu O gradu
          </Link>
        </div>
      </div>
    </div>
  );
}
