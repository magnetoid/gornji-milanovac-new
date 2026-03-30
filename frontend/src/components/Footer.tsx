import Link from 'next/link';

const footerLinks = {
  vesti: [
    { name: 'Najnovije', href: '/vesti' },
    { name: 'Sport', href: '/vesti?kategorija=sport' },
    { name: 'Kultura', href: '/vesti?kategorija=kultura' },
    { name: 'Ekonomija', href: '/vesti?kategorija=ekonomija' },
  ],
  portal: [
    { name: 'O Gradu', href: '/o-gradu' },
    { name: 'Oglasi', href: '/oglasi' },
    { name: 'Kontakt', href: '/kontakt' },
  ],
  korisno: [
    { name: 'Opština', href: 'https://www.gornjimilanovac.rs', external: true },
    { name: 'Dom Zdravlja', href: 'https://dz-gornjimilanovac.rs', external: true },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Gornji Milanovac</h3>
            <p className="text-gray-400 text-sm mb-4">
              Portal sa najnovijim vestima iz Gornjeg Milanovca i okoline.
              Informacije o lokalnim dešavanjima, kulturi, sportu i privredi.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Vesti</h4>
            <ul className="space-y-2">
              {footerLinks.vesti.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-secondary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Portal</h4>
            <ul className="space-y-2">
              {footerLinks.portal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-secondary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Korisni Linkovi</h4>
            <ul className="space-y-2">
              {footerLinks.korisno.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-secondary transition-colors duration-200 flex items-center"
                  >
                    {link.name}
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} Gornji Milanovac Portal. Sva prava zadržana.</p>
        </div>
      </div>
    </footer>
  );
}
