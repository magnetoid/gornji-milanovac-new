'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatLongDate } from '@/lib/format';
import { weatherUrl } from '@/lib/site';

const mainNavigation = [
  { name: 'Vesti', href: '/vesti' },
  { name: 'Zajednica', href: '/#zajednica' },
  { name: 'Oglasi', href: '/oglasi' },
  { name: 'Prodavnica', href: '/marketplace' },
  { name: 'Imenik', href: '/o-gradu#vazni-telefoni' },
  { name: 'O gradu', href: '/o-gradu' },
];

const utilityLinks = [
  { name: 'Važni telefoni', href: '/o-gradu#vazni-telefoni' },
  { name: 'Kontakt', href: '/kontakt' },
  { name: 'Prijava', href: '/admin/login' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set on the client so the date never mismatches the server render
    setCurrentDate(formatLongDate(new Date()));
  }, []);

  return (
    <>
      {/* Utility bar */}
      <div className="border-b border-border text-[13px] text-text-muted">
        <div className="container flex flex-wrap items-center gap-x-5 gap-y-1 py-2">
          <span className="min-h-[1.25em]">{currentDate}</span>
          <a
            href={weatherUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-text-muted"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Vremenska prognoza
          </a>
          <span className="flex-1" />
          {utilityLinks.map((link) => (
            <Link key={link.name} href={link.href} className="hidden sm:inline text-text-muted">
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Masthead */}
      <header className="sticky top-0 z-50 bg-paper border-b border-ink">
        <div className="container flex items-center gap-8 py-[18px]">
          <Link href="/" className="flex flex-col leading-none text-ink">
            <span className="font-serif text-[26px] sm:text-[30px] font-semibold tracking-[-0.02em]">
              Gornji Milanovac
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mt-1">
              Grad · Zajednica · Pijaca
            </span>
          </Link>

          <nav className="hidden lg:flex flex-1 flex-wrap gap-[22px] text-[15px] font-medium">
            {mainNavigation.map((item) => (
              <Link key={item.name} href={item.href} className="text-ink">
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 ml-auto lg:ml-0">
            <Link href="/oglasi/novi" className="btn-primary hidden sm:inline-flex">
              Postavi oglas
            </Link>
            <button
              type="button"
              className="lg:hidden p-2 -mr-2 text-ink"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Zatvori meni' : 'Otvori meni'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-paper">
            <nav className="container py-3 flex flex-col">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="py-3 border-b border-border text-[17px] font-medium text-ink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-4 pb-2 text-sm text-text-muted">
                {utilityLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-text-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/oglasi/novi"
                className="btn-primary mt-2 sm:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                Postavi oglas
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
