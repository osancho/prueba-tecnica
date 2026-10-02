'use client';

import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { Button } from '@/components/button/button';
import './error.css';

interface ErrorPageProps {
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  const router = useRouter();

  // reset() alone re-renders with the failed server data; refresh fetches it again.
  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <main className="page-error">
      <h1 className="page-error__title">Something went wrong</h1>
      <p className="page-error__message">
        We couldn’t load this page. Please try again in a moment.
      </p>
      <Button onClick={retry}>Try again</Button>
    </main>
  );
}
