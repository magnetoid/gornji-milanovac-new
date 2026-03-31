import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Gornji Milanovac - Digitalni Portal Šumadije',
    template: '%s | Gornji Milanovac',
  },
  description: 'Najnovije vesti iz Gornjeg Milanovca i Takovskog kraja. Sport, kultura, ekonomija, hronika, mali oglasi i sve iz Šumadije.',
  keywords: ['Gornji Milanovac', 'vesti', 'portal', 'Srbija', 'Šumadija', 'Takovo', 'lokalne vesti', 'sport', 'kultura', 'ekonomija'],
  authors: [{ name: 'Gornji Milanovac Portal' }],
  creator: 'Gornji Milanovac Portal',
  metadataBase: new URL('https://new.gornji-milanovac.com'),
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: 'https://new.gornji-milanovac.com',
    siteName: 'Gornji Milanovac Portal',
    title: 'Gornji Milanovac - Digitalni Portal Šumadije',
    description: 'Najnovije vesti iz Gornjeg Milanovca i Takovskog kraja.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gornji Milanovac Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gornji Milanovac - Digitalni Portal Šumadije',
    description: 'Najnovije vesti iz Gornjeg Milanovca i Takovskog kraja.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1B5E20" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-surface-warm">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
