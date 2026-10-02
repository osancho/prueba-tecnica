import type { Metadata } from 'next';
import { CartLinkContainer } from '@/components/cart_link_container/cart_link_container';
import { Navbar } from '@/components/navbar/navbar';
import { PageLoadBar } from '@/components/page_load_bar/page_load_bar';
import { CartProvider } from '@/context/cart/cart_context';
import { DEFAULT_TITLE, TITLE_TEMPLATE } from '@/lib/page_titles';
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
        <CartProvider>
          <Navbar>
            <CartLinkContainer />
          </Navbar>
          <PageLoadBar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
