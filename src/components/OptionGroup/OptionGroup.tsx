import type { ReactNode } from 'react';
import './OptionGroup.css';

interface OptionGroupProps {
  label: string;
  children: ReactNode;
}

export function OptionGroup({ label, children }: OptionGroupProps) {
  return (
    <fieldset className="option-group">
      <legend className="option-group__label">{label}</legend>
      <div className="option-group__content">{children}</div>
    </fieldset>
  );
}
