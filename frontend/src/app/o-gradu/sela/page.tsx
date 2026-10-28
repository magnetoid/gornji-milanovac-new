import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sela opštine',
  description:
    'Sela opštine Gornji Milanovac: Koštunići, Rudnik, Savinac i Leušići, planine, banje i seoski turizam Takovskog kraja.',
  openGraph: {
    title: 'Sela opštine | Gornji Milanovac',
    description: 'Koštunići, Rudnik, Savinac i Leušići: seoski turizam u opštini Gornji Milanovac.',
  },
};

const villages = [
  {
    id: 'kostunici',
    name: 'Koštunići',
    where: '25 km od Gornjeg Milanovca i isto toliko od Čačka',
    paragraphs: [
      'U Koštunićima se nalazi industrijski kompleks zdrave hrane „Etno-art” i turistički kompleks koji čine Etno kuća „Anđelije Mišić”, Etno muzej „Prodanovića magaza”, istorijski muzej i hotel „Milica i Panajota”.',
      'Smeštaj gostiju obezbeđen je u seoskim domaćinstvima i vajatima i živopisnim drvenim kućicama apartmanskog tipa.',
    ],
  },
  {
    id: 'rudnik',
    name: 'Rudnik',
    where: 'varošica na istoimenoj planini',
    paragraphs: [
      'Planina je prekrivena bujnom šumom i brojnim putevima i stazama koje vode do arheoloških lokaliteta, rudničkih vrhova i manastira Vraćevšnica, Voljavče i Nikolje.',
      'Pešačkim stazama lako se stiže i do vulkanske kupe Ostrvica, koja predstavlja izazov za planinare. Vrh Ostrvice se završava zidinama Jerininog grada.',
      'U centru varošice su hotel „Neda”, „Šumska kuća”, dečje odmaralište i brojni sportski tereni.',
    ],
  },
  {
    id: 'savinac',
    name: 'Savinac',
    where: 'zaseok sela Šarani, 4 km od Takova',
    paragraphs: [
      'Legenda kaže da je ovim putem prošao Sveti Sava i da se u kamenu može videti otisak kopita njegovog konja.',
      'Miloš Obrenović je ovde podigao svoju prvu zadužbinu, u spomen svoje supruge kneginje Ljubice. Ovde počivaju i kosti Vukove ćerke Mine, slikarke i pesnikinje. Sačuvan je i čardak iz Miloševog doba.',
      'Za smeštaj gostiju mogu se koristiti brojne vikendice i sobe u seoskim domaćinstvima.',
    ],
  },
  {
    id: 'leusici',
    name: 'Leušići',
    where: 'prvi put se pominju 1718. godine',
    paragraphs: [
      'Ime su dobili po svom osnivaču Leju. Po prirodnim lepotama, nepreglednim pašnjacima i livadama šarenim od livadskog cveća, Leušići se razlikuju od drugih sela, pa se po tome i pamte.',
      'Turistička manifestacija u Leušićima s pravom je nazvana „Cvet livada”: posvećena je prirodi i lepoti sela u kojem dominira livadsko cveće. Smeštaj je organizovan u kući za odmor „Cvet livada”.',
    ],
  },
];

export default function SelaPage() {
  return (
    <div className="bg-paper min-h-screen">
      <div className="container max-w-3xl py-12 md:py-20">
        <nav aria-label="Putanja" className="text-sm text-text-muted mb-8">
          <Link href="/o-gradu" className="hover:text-primary underline-offset-4 hover:underline">
            O gradu
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-text">Sela opštine</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-ink leading-tight mb-6">
            Sela opštine Gornji Milanovac
          </h1>
          <div className="space-y-5 text-lg text-text-secondary leading-relaxed">
            <p>
              Gornji Milanovac nalazi se u centralnom delu Srbije između planina Maljen, Suvobor, Rajac, Rudnik,
              Ješevac, Vujan i Kablar. Dominantan položaj ima masiv Rudnika, sa devet vrhova preko 1.000 metara
              nadmorske visine. U podnožju starih gromadnih planina nalaze se termomineralni izvori: Mlakovac,
              Svračkovci, Savinac i Brđani. Priroda je ovaj kraj obdarila pitomim šumovitim planinama i čistim rečicama
              i potocima, predelom privlačnim u sva četiri godišnja doba.
            </p>
            <p>
              U ovaj kraj istorija je smestila i brojne događaje i ljude iza kojih su sačuvani kulturno-istorijski
              spomenici. U Takovu je pod barjakom Miloša Obrenovića počelo stvaranje prve srpske države, o čemu svedoče
              muzej, crkva brvnara i spomenici Drugog srpskog ustanka. Iz najstarije zgrade suda u Srbiji legendarni
              vojvoda Mišić komandovao je Suvoborsko-kolubarskom bitkom.
            </p>
          </div>
        </header>

        {/* The number is the page's one big statement; the four villages follow from it */}
        <section className="border-y border-border py-10 mb-14 md:flex md:items-center md:gap-10">
          <div className="font-serif font-bold text-primary text-7xl md:text-8xl leading-none shrink-0">63</div>
          <p className="mt-4 md:mt-0 text-lg text-ink leading-relaxed">
            seoska naselja ima opština, i svako je asfaltnim putem povezano sa gradom i drugim selima. Za seoski turizam
            najznačajnija su četiri:{' '}
            {villages.map((v, i) => (
              <span key={v.id}>
                <a href={`#${v.id}`} className="text-primary underline underline-offset-4 decoration-primary-200 hover:decoration-primary">
                  {v.name}
                </a>
                {i < villages.length - 2 ? ', ' : i === villages.length - 2 ? ' i ' : '.'}
              </span>
            ))}
          </p>
        </section>

        <div className="space-y-16">
          {villages.map((village) => (
            <section key={village.id} id={village.id} className="scroll-mt-28">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink">{village.name}</h2>
              <p className="mt-2 text-primary font-medium">{village.where}</p>
              <div className="mt-5 space-y-4 text-text-secondary leading-relaxed">
                {village.paragraphs.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <Link href="/o-gradu" className="text-primary font-medium hover:underline underline-offset-4">
            Nazad na stranu O gradu
          </Link>
        </div>
      </div>
    </div>
  );
}
