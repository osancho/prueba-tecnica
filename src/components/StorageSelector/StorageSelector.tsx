import { useId } from 'react';
import { OptionGroup } from '@/components/OptionGroup/OptionGroup';
import type { StorageOption } from '@/types/product';
import './StorageSelector.css';

interface StorageSelectorProps {
  options: StorageOption[];
  value?: string;
  onChange: (capacity: string) => void;
}

export function StorageSelector({
  options,
  value,
  onChange,
}: StorageSelectorProps) {
  const name = useId();

  return (
    <OptionGroup label="Storage ¿how much space do you need?">
      <div className="storage-selector">
        {options.map(({ capacity }) => (
          <label key={capacity} className="storage-selector__option">
            <input
              className="visually-hidden"
              type="radio"
              name={name}
              value={capacity}
              checked={value === capacity}
              onChange={() => onChange(capacity)}
            />
            {capacity}
          </label>
        ))}
      </div>
    </OptionGroup>
  );
}
