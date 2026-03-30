import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktirajte redakciju portala Gornji Milanovac. Pošaljite nam vesti, oglase ili pitanja.',
  openGraph: {
    title: 'Kontakt | Gornji Milanovac',
    description: 'Kontaktirajte redakciju portala Gornji Milanovac.',
  },
};

const contactInfo = [
  {
    title: 'Email',
    description: 'Za sve upite, vesti i saradnju.',
    value: 'redakcija@gornji-milanovac.com',
    href: 'mailto:redakcija@gornji-milanovac.com',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Telefon',
    description: 'Radnim danima od 9 do 17 časova.',
    value: '+381 32 712 600',
    href: 'tel:+38132712600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    title: 'Adresa',
    description: 'Sedište redakcije.',
    value: 'Rudnička 1, 32300 Gornji Milanovac',
    href: null,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/gornjimilanovac',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
      </svg>
    ),
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/gornjimilanovac',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90',
  },
  {
    name: 'Telegram',
    href: 'https://t.me/gornjimilanovac',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    color: 'bg-sky-500 hover:bg-sky-600',
  },
];

export default function KontaktPage() {
  return (
    <div className="bg-surface-alt min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            Kontaktirajte Nas
          </h1>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl">
            Imate vest, oglas ili pitanje? Javite nam se putem jednog od kanala ispod.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Contact Cards */}
            {contactInfo.map((info) => (
              <div
                key={info.title}
                className="bg-white rounded-xl border border-border p-6 flex items-start gap-4 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                  {info.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text mb-1">{info.title}</h3>
                  <p className="text-sm text-text-muted mb-2">{info.description}</p>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <span className="text-text font-medium">{info.value}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="text-lg font-bold text-text mb-4">Pratite nas</h3>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 flex items-center justify-center rounded-full text-white transition-all ${social.color}`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=20.435%2C43.975%2C20.475%2C44.015&layer=mapnik&marker=43.9939%2C20.4548"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                title="Mapa Gornjeg Milanovca"
              />
              <div className="p-4 border-t border-border">
                <a
                  href="https://www.openstreetmap.org/?mlat=43.9939&mlon=20.4548#map=14/43.9939/20.4548"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                >
                  Pogledaj veću mapu
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl border border-border p-6 md:p-8 h-fit">
            <h2 className="text-2xl font-serif font-bold text-text mb-6">Pošaljite Nam Poruku</h2>

            <form
              action={`mailto:redakcija@gornji-milanovac.com`}
              method="post"
              encType="text/plain"
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text mb-1.5">
                    Ime i prezime
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Vaše ime"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
                    Email adresa
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="vas@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text mb-1.5">
                  Tema
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="general">Opšti upit</option>
                  <option value="news">Pošalji vest</option>
                  <option value="ad">Postavi oglas</option>
                  <option value="feedback">Povratna informacija</option>
                  <option value="other">Drugo</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text mb-1.5">
                  Poruka
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  placeholder="Vaša poruka..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Pošalji Poruku
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
