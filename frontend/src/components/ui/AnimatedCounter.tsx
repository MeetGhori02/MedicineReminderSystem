import { useEffect, useState, useRef } from 'react';

// Smoothly counts up from 0 to target value
export const AnimatedCounter = ({
  value,
  suffix = '',
  duration = 800,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) => {
  const [display, setDisplay] = useState(0);
  const start = useRef<number | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const from = display;
    const to = value;
    start.current = null;

    const step = (ts: number) => {
      if (!start.current) start.current = ts;
      const elapsed = ts - start.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return <>{display}{suffix}</>;
};
