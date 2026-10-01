import type { Metadata } from 'next';
import { CartLinkContainer } from '@/components/CartLinkContainer/CartLinkContainer';
import { Navbar } from '@/components/Navbar/Navbar';
import { CartProvider } from '@/context/cart/CartContext';
import { DEFAULT_TITLE, TITLE_TEMPLATE } from '@/lib/pageTitles';
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
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
