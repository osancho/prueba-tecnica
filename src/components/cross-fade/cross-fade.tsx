import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { FIGMA_SPRING, springTiming, type SpringTokens } from '@/lib/motion';
import './cross-fade.css';

interface Layer {
  id: string;
  content: ReactNode;
}

interface CrossFadeProps {
  /** A new id fades the new content in over the previous one, as a Figma dissolve. */
  id: string;
  children: ReactNode;
  className?: string;
  spring?: SpringTokens;
}

export function CrossFade({
  id,
  children,
  className,
  spring = FIGMA_SPRING,
}: CrossFadeProps) {
  const [current, setCurrent] = useState<Layer>({ id, content: children });
  const [leaving, setLeaving] = useState<Layer | null>(null);
  const enteringRef = useRef<HTMLSpanElement>(null);
  const leavingRef = useRef<HTMLSpanElement>(null);

  if (current.id !== id) {
    setLeaving(springTiming(spring) ? current : null);
    setCurrent({ id, content: children });
  }

  useLayoutEffect(() => {
    const timing = springTiming(spring);
    if (!leaving || !timing) return;

    enteringRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], timing);
    const fadeOut = leavingRef.current?.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      timing,
    );
    fadeOut?.finished.then(
      () => setLeaving(null),
      () => {},
    );
    return () => fadeOut?.cancel();
  }, [leaving, spring]);

  return (
    <span className={className ? `cross-fade ${className}` : 'cross-fade'}>
      {leaving && (
        <span
          key={leaving.id}
          ref={leavingRef}
          className="cross-fade__layer"
          aria-hidden="true"
          inert
        >
          {leaving.content}
        </span>
      )}
      <span key={id} ref={enteringRef} className="cross-fade__layer">
        {children}
      </span>
    </span>
  );
}
