'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const footerLinks = [
  { name: 'Vesti', href: '/vesti' },
  { name: 'Događaji', href: '/dogadjaji' },
  { name: 'Oglasi', href: '/oglasi' },
  { name: 'Prodavnica', href: '/marketplace' },
  { name: 'Imenik', href: '/imenik' },
  { name: 'O gradu', href: '/o-gradu' },
  { name: 'Kontakt', href: '/kontakt' },
];

const korisniLinkovi = [
  { name: 'Opština GM', href: 'https://www.gornjimilanovac.rs' },
  { name: 'Dom zdravlja', href: 'https://dz-gornjimilanovac.rs' },
  { name: 'Turistička organizacija', href: 'https://www.togm.rs' },
];

export default function Footer() {
  const pathname = usePathname() || '';
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  // The admin panel has its own sidebar layout
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-ink text-paper">
      <div className="container grid gap-10 py-12 grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-2.5">
          <Link href="/" className="font-serif text-[26px] font-semibold text-paper hover:text-paper">
            Gornji Milanovac
          </Link>
          <p className="text-sm leading-[1.55] text-[#B9B3A6] max-w-[40ch]">
            Nezavisni portal za vesti, oglase i lokalnu kupovinu u Gornjem Milanovcu i okolini.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <ul className="flex flex-col gap-2">
            {footerLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="text-[#B9B3A6] hover:text-paper">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2">
            {korisniLinkovi.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B9B3A6] hover:text-paper"
                >
                  {link.name} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[15px] font-semibold">Nedeljnik iz Gornjeg Milanovca</span>
          {subscribed ? (
            <p className="text-sm text-[#B9B3A6]">Hvala na prijavi! Uskoro ćete primati naše vesti.</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-wrap gap-2">
              <label htmlFor="newsletter-email" className="sr-only">Email adresa</label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vaš@email.rs"
                required
                className="flex-1 min-w-[180px] px-3.5 py-[11px] rounded-full border border-[#4A463E] bg-transparent text-sm text-paper placeholder-[#8F897C] outline-none focus:border-paper"
              />
              <button
                type="submit"
                className="px-[18px] py-[11px] rounded-full bg-paper text-ink text-sm font-medium hover:bg-paper-deep"
              >
                Prijavi me
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-ink-soft">
        <div className="container flex flex-wrap gap-x-5 gap-y-2 py-4 text-[13px] text-[#8F897C]">
          <span>© {new Date().getFullYear()} Gornji Milanovac – Digitalni portal</span>
          <Link href="/kontakt" className="text-[#8F897C] hover:text-paper">Kontakt redakcije</Link>
        </div>
      </div>
    </footer>
  );
}
