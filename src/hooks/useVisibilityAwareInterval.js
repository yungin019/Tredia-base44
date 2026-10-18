import { useEffect, useRef } from 'react';

/**
 * useVisibilityAwareInterval
 *
 * Like setInterval, but pauses when the tab is hidden and resumes (with an
 * immediate refresh) when the tab regains focus.
 *
 * @param {Function} callback - function to call on each tick
 * @param {number|null|undefined} delay - interval in ms; null/undefined = disabled
 */
export function useVisibilityAwareInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null || delay === undefined) return;

    let interval = null;

    const tick = () => savedCallback.current();

    const start = () => {
      if (!interval && !document.hidden) {
        interval = setInterval(tick, delay);
      }
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        tick();
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    start();

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [delay]);
}