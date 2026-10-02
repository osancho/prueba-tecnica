import type { ButtonHTMLAttributes } from 'react';
import './button.css';

export function Button({
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={className ? `button ${className}` : 'button'}
      {...props}
    />
  );
}
