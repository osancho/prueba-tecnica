import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogoIcon } from '@/components/icons';
import './Navbar.css';

interface NavbarProps {
  children?: ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  return (
    <header className="navbar">
      <nav className="navbar__nav" aria-label="Main">
        <Link href="/" className="navbar__home" aria-label="MBST home">
          <LogoIcon className="navbar__logo" />
        </Link>
        {children}
      </nav>
    </header>
  );
}
