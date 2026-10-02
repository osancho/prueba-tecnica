import Link from 'next/link';
import { BagFilledIcon, BagIcon } from '@/components/icons/icons';
import './cart_link.css';

interface CartLinkProps {
  count: number;
}

function cartCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'product' : 'products'} in the cart`;
}

export function CartLink({ count }: CartLinkProps) {
  const Icon = count > 0 ? BagFilledIcon : BagIcon;

  return (
    // Prefetching /cart preloads its CSS on every page, and Chrome warns that it goes unused.
    <Link
      href="/cart"
      prefetch={false}
      className="cart-link"
      aria-label={cartCountLabel(count)}
    >
      <span className="cart-link__icon">
        <Icon className="cart-link__bag" />
      </span>
      <span className="cart-link__count">{count}</span>
    </Link>
  );
}
