import { useEffect, useState } from 'react';

export function CountUp({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / 950);
      setDisplay(Math.round(value * (1 - (1 - progress) ** 3)));
      progress < 1 && (frame = requestAnimationFrame(tick));
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{display}</>;
}
