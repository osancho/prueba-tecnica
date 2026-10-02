'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeftIcon } from '@/components/icons';
import { lastListUrl } from '@/lib/listUrl';
import './BackLink.css';

export function BackLink() {
  const [href, setHref] = useState('/');

  useEffect(() => setHref(lastListUrl()), []);

  return (
    <nav className="back-link" aria-label="Back to the list">
      <Link href={href} className="back-link__link">
        <ChevronLeftIcon className="back-link__icon" />
        Back
      </Link>
    </nav>
  );
}
