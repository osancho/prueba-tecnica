import type { Metadata } from 'next';
import { CartLinkContainer } from '@/components/cart-link-container/cart-link-container';
import { Navbar } from '@/components/navbar/navbar';
import { PageLoadBar } from '@/components/page-load-bar/page-load-bar';
import { DEFAULT_TITLE, TITLE_TEMPLATE } from '@/lib/page-titles';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: DEFAULT_TITLE,
    template: TITLE_TEMPLATE,
  },
  description:
    'Browse the latest smartphones, compare models, choose storage and color and see the price update instantly.',
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
