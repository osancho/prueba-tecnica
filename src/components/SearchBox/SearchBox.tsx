import { useId, useRef } from 'react';
import { CloseIcon } from '@/components/icons';
import { SEARCH_MAX_LENGTH } from '@/lib/searchTerm';
import './SearchBox.css';

interface SearchBoxProps {
  value: string;
  showClear: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export function SearchBox({
  value,
  showClear,
  onChange,
  onClear,
  onSubmit,
}: SearchBoxProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function clear() {
    onClear();
    inputRef.current?.focus();
  }

  return (
    <form
      className="search-box"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="visually-hidden" htmlFor={inputId}>
        Search for a smartphone
      </label>
      <input
        ref={inputRef}
        id={inputId}
        className="search-box__input"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        maxLength={SEARCH_MAX_LENGTH}
        placeholder="Search for a smartphone..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className={`search-box__clear${showClear ? '' : ' search-box__clear--hidden'}`}
        aria-label="Clear search"
        aria-hidden={!showClear}
        inert={!showClear}
        onClick={clear}
      >
        <CloseIcon className="search-box__clear-icon" />
      </button>
    </form>
  );
}
