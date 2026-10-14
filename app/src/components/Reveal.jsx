import { useEffect, useRef } from 'react';

/** Contenitore che compare (classe `visible`) quando entra nel viewport. */
export function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        entry.isIntersecting &&
          (element.classList.add('visible'), observer.unobserve(element));
      },
      {
        threshold: 0.08,
      },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
