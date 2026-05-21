import { useState, useRef, useCallback } from 'react';

export function useStopwatch() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    setElapsedMs(Date.now() - startTimeRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsedMs;
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [elapsedMs, tick]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setElapsedMs(0);
    setIsRunning(false);
  }, []);

  const elapsedSeconds = elapsedMs / 1000;

  return { elapsedMs, elapsedSeconds, isRunning, start, stop, reset };
}
