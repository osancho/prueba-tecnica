import type { Metadata } from 'next';
import Link from 'next/link';
import '@/components/button/button.css';
import './error.css';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main className="page-error">
      <h1 className="page-error__title">Page not found</h1>
      <p className="page-error__message">
        The smartphone you are looking for does not exist or is no longer
        available.
      </p>
      <Link href="/" className="button">
        Back to smartphones
      </Link>
    </main>
  );
}
