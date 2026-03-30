import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'O Gradu',
  description: 'Sve o Gornjem Milanovcu - istorija, znamenitosti, kultura i tradicija Takovskog kraja.',
  openGraph: {
    title: 'O Gradu | Gornji Milanovac',
    description: 'Sve o Gornjem Milanovcu - istorija, znamenitosti, kultura i tradicija Takovskog kraja.',
  },
};

export default function OGraduPage() {
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
          <li className="text-gray-900 font-medium">O Gradu</li>
        </ol>
      </nav>

      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Gornji Milanovac
        </h1>

        <div className="prose max-w-none">
          <p className="text-xl text-gray-600 mb-8 text-center">
            Grad u srcu Šumadije, poznat po bogatoj istoriji, industriji i lepotama prirode Takovskog kraja.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Istorija</h2>
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
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Znamenitosti</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-primary mb-2">Takovski grm</h3>
                <p className="text-gray-600">
                  Istorijski hrast pod kojim je knez Miloš podigao Drugi srpski ustanak 1815. godine.
                  Jedno od najvažnijih istorijskih mesta u Srbiji.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-primary mb-2">Crkva Svetog Đorđa</h3>
                <p className="text-gray-600">
                  Pravoslavna crkva iz 19. veka, zadužbina kneza Miloša Obrenovića, predstavlja
                  značajan verski i kulturni spomenik grada.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-primary mb-2">Rudnička planina</h3>
                <p className="text-gray-600">
                  Planina bogata prirodnim lepotama, idealna za izlete, planinarenje i uživanje
                  u netaknutoj prirodi Šumadije.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-primary mb-2">Muzej Takovskog ustanka</h3>
                <p className="text-gray-600">
                  Muzej posvećen istoriji Drugog srpskog ustanka sa bogatom zbirkom eksponata
                  iz tog perioda.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Privreda</h2>
            <p>
              Gornji Milanovac je poznat kao industrijski centar, sa jakom metaloprerađivačkom,
              automobilskom i prehrambenom industrijom. Grad je dom nekih od vodećih srpskih
              kompanija i ima dugu tradiciju proizvodnje i preduzetništva.
            </p>
            <p>
              Pored industrije, značajnu ulogu ima i poljoprivreda, posebno voćarstvo i
              proizvodnja rakije od šljive, tradicionalnog srpskog pića.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kultura i manifestacije</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <strong>Takovsko proleće</strong> - tradicionalna manifestacija koja se održava
                  svake godine u aprilu, u čast Drugog srpskog ustanka.
                </div>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <strong>Gornjomilanovački letnji festival</strong> - kulturno-umetnička manifestacija
                  sa bogatim programom muzičkih i pozorišnih dešavanja.
                </div>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <strong>Vašar</strong> - tradicionalni godišnji vašar sa bogatom ponudom
                  domaćih proizvoda i zabavnim programom.
                </div>
              </li>
            </ul>
          </section>

          <section className="mb-12 bg-gray-100 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Osnovni podaci</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-700">Površina:</strong>
                <span className="ml-2">836 km²</span>
              </div>
              <div>
                <strong className="text-gray-700">Stanovništvo:</strong>
                <span className="ml-2">~44.000</span>
              </div>
              <div>
                <strong className="text-gray-700">Nadmorska visina:</strong>
                <span className="ml-2">335 m</span>
              </div>
              <div>
                <strong className="text-gray-700">Poštanski broj:</strong>
                <span className="ml-2">32300</span>
              </div>
              <div>
                <strong className="text-gray-700">Pozivni broj:</strong>
                <span className="ml-2">+381 32</span>
              </div>
              <div>
                <strong className="text-gray-700">Okrug:</strong>
                <span className="ml-2">Moravički</span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/kontakt"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-800"
          >
            Kontaktirajte nas
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </article>
    </div>
  );
}
