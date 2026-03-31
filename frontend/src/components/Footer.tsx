'use client';

import { useState } from 'react';
import Link from 'next/link';

const kategorije = [
  { name: 'Sve Vesti', href: '/vesti' },
  { name: 'Sport', href: '/vesti?kategorija=sport' },
  { name: 'Kultura', href: '/vesti?kategorija=kultura' },
  { name: 'Ekonomija', href: '/vesti?kategorija=ekonomija' },
  { name: 'Hronika', href: '/vesti?kategorija=hronika' },
];

const portal = [
  { name: 'O Gradu', href: '/o-gradu' },
  { name: 'Oglasi', href: '/oglasi' },
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'Kontakt', href: '/kontakt' },
];

const korisniLinkovi = [
  { name: 'Opština GM', href: 'https://www.gornjimilanovac.rs' },
  { name: 'Dom zdravlja', href: 'https://dz-gornjimilanovac.rs' },
  { name: 'MUP', href: 'https://www.mup.gov.rs' },
  { name: 'Turistička org.', href: 'https://www.togm.rs' },
];

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/gornjimilanovac',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/gornjimilanovac',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'Telegram',
    href: 'https://t.me/gornjimilanovac',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-primary-dark text-white">
      {/* Top green line */}
      <div className="h-1 bg-primary" />

      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Column 1: Logo & Description (wider) */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg">
                GM
              </div>
              <span className="text-xl font-serif font-bold text-white">
                Gornji Milanovac
              </span>
            </Link>

            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
              Gornji Milanovac Portal je nezavisni digitalni informativni portal posvećen lokalnim vestima, događajima i životu u Takovskom kraju. Pratimo sve što je važno za našu zajednicu.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-primary hover:text-white transition-all"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Kategorije */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
              Kategorije
            </h4>
            <ul className="space-y-2.5">
              {kategorije.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-accent-light transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Portal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
              Portal
            </h4>
            <ul className="space-y-2.5">
              {portal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-accent-light transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-white font-semibold mb-4 mt-6 text-sm uppercase tracking-wide">
              Korisni linkovi
            </h4>
            <ul className="space-y-2.5">
              {korisniLinkovi.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-accent-light transition-colors text-sm inline-flex items-center gap-1"
                  >
                    {link.name}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
              Newsletter
            </h4>
            <p className="text-white/70 text-sm mb-4">
              Prijavite se za najnovije vesti direktno u vaš inbox.
            </p>

            {subscribed ? (
              <div className="bg-primary/30 border border-primary/50 rounded-lg p-4">
                <p className="text-white/90 text-sm">
                  Hvala na prijavi! Uskoro ćete primati naše vesti.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Vaš email"
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:border-primary focus:bg-white/15 transition-all"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-primary text-white font-medium text-sm rounded-lg hover:bg-primary-light transition-colors"
                >
                  Prijavi se
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p className="text-white/60">
              &copy; 2026 Gornji Milanovac Portal. Sva prava zadržana.
            </p>
            <p className="text-white/40 flex items-center gap-1.5">
              Made with <span className="text-red-light">&#9829;</span> za Gornji Milanovac
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
