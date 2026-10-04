import type { Metadata } from 'next';
import { CartLinkContainer } from '@/components/cart-link-container/cart-link-container';
import { Navbar } from '@/components/navbar/navbar';
import { PageLoadBar } from '@/components/page-load-bar/page-load-bar';
import { DEFAULT_TITLE, SITE_NAME, TITLE_TEMPLATE } from '@/lib/page-titles';
import { siteUrl } from '@/services/server-config';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  // Without a public address, the same fallback Next would pick, minus its build warning.
  metadataBase: siteUrl() ?? new URL('http://localhost:3000'),
  title: {
    default: DEFAULT_TITLE,
    template: TITLE_TEMPLATE,
  },
  description:
    'Browse the latest smartphones, compare models, choose storage and color and see the price update instantly.',
  // Title and description of each page are filled in by Next from the fields above.
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en' },
  twitter: { card: 'summary' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar>
            <CartLinkContainer />
          </Navbar>
          <PageLoadBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
