import type { Metadata } from 'next';
import { CartLink } from '@/components/CartLink/CartLink';
import { Navbar } from '@/components/Navbar/Navbar';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Smartphones | MBST',
    template: '%s | MBST',
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
        <Navbar>
          <CartLink count={0} />
        </Navbar>
        {children}
      </body>
    </html>
  );
}
