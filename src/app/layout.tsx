import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brave Pink Hero Green Indonesia — Konverter Duotone (#145527 → #F784C5)',
  description: 'Ubah foto menjadi duotone hijau–pink langsung di browser. Tanpa unggah ke server, cepat dan privat.',
  keywords: [
    'brave', 'pink', 'hero', 'green', 'duotone', 'konverter gambar', 'hijau', 'pink', 'efek foto', 'filter gambar', 'indonesia'
  ],
  authors: [{ name: 'Brave Pink Hero Green Indonesia' }],
  creator: 'Brave Pink Hero Green Indonesia',
  publisher: 'Brave Pink Hero Green Indonesia',
  robots: 'index, follow',
  metadataBase: new URL('https://brave-pink-hero-green.vercel.app'),

  openGraph: {
    title: 'Brave Pink Hero Green Indonesia — Duotone Hijau–Pink',
    description: 'Transformasikan fotomu ke gaya duotone hijau–pink langsung di browser.',
    url: 'https://brave-pink-hero-green.vercel.app',
    siteName: 'Brave Pink Hero Green Indonesia',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pratinjau Brave Pink Hero Green Indonesia' }],
    locale: 'id_ID',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Brave Pink Hero Green Indonesia — Duotone Hijau–Pink',
    description: 'Ubah foto jadi duotone hijau–pink langsung di browser.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Brave Pink Indonesia',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#145527' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>

      <body className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-pink-50 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Lewati ke konten utama
        </a>

        <div id="main-content" className="min-h-screen flex flex-col">
          {children}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Brave Pink Indonesia',
              description: 'Ubah foto menjadi duotone hijau–pink langsung di browser.',
              url: 'https://brave-pink-hero-green.vercel.app',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Any',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              author: { '@type': 'Organization', name: 'Brave Pink Indonesia' },
            }),
          }}
        />
      </body>
    </html>
  );
}
