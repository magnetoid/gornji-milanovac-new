import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: {
    default: 'Gornji Milanovac - Portal',
    template: '%s | Gornji Milanovac',
  },
  description: 'Portal sa najnovijim vestima iz Gornjeg Milanovca i okoline. Informacije o lokalnim dešavanjima, kulturi, sportu i privredi.',
  keywords: ['Gornji Milanovac', 'vesti', 'portal', 'Srbija', 'lokalne vesti', 'Takovo'],
  authors: [{ name: 'Gornji Milanovac Portal' }],
  creator: 'Gornji Milanovac Portal',
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: 'https://new.gornji-milanovac.com',
    siteName: 'Gornji Milanovac Portal',
    title: 'Gornji Milanovac - Portal',
    description: 'Portal sa najnovijim vestima iz Gornjeg Milanovca i okoline.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gornji Milanovac - Portal',
    description: 'Portal sa najnovijim vestima iz Gornjeg Milanovca i okoline.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
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
