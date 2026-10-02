import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  BagFilledIcon,
  BagIcon,
  ChevronLeftIcon,
  CloseIcon,
  LogoIcon,
} from '../icons';

const icons = { LogoIcon, ChevronLeftIcon, CloseIcon, BagIcon, BagFilledIcon };

describe('icons', () => {
  it.each(Object.entries(icons))(
    '%s is decorative: hidden from screen readers and never focused',
    (_, Icon) => {
      const { container } = render(<Icon className="navbar__logo" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('focusable', 'false');
      expect(svg).toHaveClass('navbar__logo');
    },
  );
});
