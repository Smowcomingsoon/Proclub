import { useEffect, useRef, useState } from 'react';

/** Scena 3D lazy (three.js): parte quando entra nel viewport e si può mettere in pausa. */
export function AdaniMini() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let started = false;
    let visible = false;
    let disposeScene;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (((visible = entry.isIntersecting), !(!visible || started))) {
        started = true;
        try {
          const { createAdaniScene } = await import('../vendor/adani-scene.js');
          if (disposed) return;
          if (
            ((disposeScene = await createAdaniScene(
              canvas,
              () => visible && !pausedRef.current && !document.hidden,
              () => disposed,
            )),
            disposed)
          ) {
            disposeScene();
            return;
          }
          setStatus('ready');
        } catch {
          disposed || setStatus('unavailable');
        }
      }
    });
    observer.observe(canvas);
    return () => {
      disposed = true;
      observer.disconnect();
      disposeScene?.();
    };
  }, []);
  return (
    <div className="adani-mini">
      <div
        ref={canvasRef}
        className="adani-canvas"
        role="img"
        aria-label="Il modello 3D allegato, animato mentre scrive una pagella sul taccuino"
      />
      {status === 'loading' && (
        <span className="adani-loading">Apre il taccuino…</span>
      )}
      {status === 'unavailable' && (
        <span className="adani-loading">La pagella resta qui sotto.</span>
      )}
      {status === 'ready' && (
        <button
          className="adani-motion"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
          aria-label={
            paused ? 'Riprendi la scrittura 3D' : 'Ferma la scrittura 3D'
          }
        >
          {paused ? 'Riprendi' : 'In redazione · pausa'}
        </button>
      )}
    </div>
  );
}
