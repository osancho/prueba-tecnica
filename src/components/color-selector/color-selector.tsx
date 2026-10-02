import { useId, useState } from 'react';
import { CrossFade } from '@/components/cross-fade/cross-fade';
import { OptionGroup } from '@/components/option-group/option-group';
import type { ColorOption } from '@/core/product/domain/product';
import './color-selector.css';

interface ColorSelectorProps {
  options: ColorOption[];
  value?: string;
  onChange: (colorName: string) => void;
}

export function ColorSelector({
  options,
  value,
  onChange,
}: ColorSelectorProps) {
  const name = useId();
  const [hovered, setHovered] = useState<string>();
  const shownName = hovered ?? value;

  return (
    <OptionGroup label="Color. Pick your favourite.">
      <div className="color-selector">
        {options.map((color) => (
          <label
            key={color.name}
            className="color-selector__option"
            onPointerEnter={() => setHovered(color.name)}
            onPointerLeave={() => setHovered(undefined)}
          >
            <input
              className="visually-hidden"
              type="radio"
              name={name}
              value={color.name}
              checked={value === color.name}
              onChange={() => onChange(color.name)}
            />
            <span className="visually-hidden">{color.name}</span>
            <span
              className="color-selector__swatch"
              style={{ backgroundColor: color.hexCode }}
            />
          </label>
        ))}
        {shownName && (
          <p className="color-selector__name">
            <CrossFade id={shownName}>{shownName}</CrossFade>
          </p>
        )}
      </div>
    </OptionGroup>
  );
}
