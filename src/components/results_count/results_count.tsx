import './results_count.css';

interface ResultsCountProps {
  count: number;
  hidden: boolean;
}

export function ResultsCount({ count, hidden }: ResultsCountProps) {
  return (
    <p
      className={`results-count${hidden ? ' results-count--hidden' : ''}`}
      aria-live="polite"
    >
      {count} {count === 1 ? 'result' : 'results'}
    </p>
  );
}
