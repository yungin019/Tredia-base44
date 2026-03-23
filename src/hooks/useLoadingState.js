import { useState, useEffect, useRef } from 'react';

/**
 * Progressive Loading State Management
 * <1s: skeleton only
 * 1-3s: "Fetching live data..."
 * >3s: "Live data unavailable"
 */
export function useLoadingState(isLoading, timeout = 5000) {
  const [state, setState] = useState('skeleton'); // 'skeleton' | 'fetching' | 'unavailable'
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isLoading) {
      setState('skeleton');
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Start with skeleton
    setState('skeleton');
    
    // After 1s, show "Fetching"
    const fetchingTimer = setTimeout(() => {
      setState('fetching');
    }, 1000);

    // After timeout (default 5s), show "Unavailable"
    const unavailableTimer = setTimeout(() => {
      setState('unavailable');
    }, timeout);

    timerRef.current = { fetchingTimer, unavailableTimer };

    return () => {
      clearTimeout(fetchingTimer);
      clearTimeout(unavailableTimer);
    };
  }, [isLoading, timeout]);

  return state;
}

/**
 * Progressive Data Reveal
 * Load data in stages with smooth transitions
 */
export function useProgressiveData(dataObject, priorities = []) {
  const [revealedData, setRevealedData] = useState({});
  const revealTimerRef = useRef(null);

  useEffect(() => {
    if (!dataObject) {
      setRevealedData({});
      return;
    }

    setRevealedData({});
    const reveals = priorities.length > 0 ? priorities : Object.keys(dataObject);

    reveals.forEach((key, index) => {
      const delay = index * 100; // Stagger reveals by 100ms
      const timer = setTimeout(() => {
        setRevealedData(prev => ({
          ...prev,
          [key]: dataObject[key]
        }));
      }, delay);

      if (!revealTimerRef.current) revealTimerRef.current = [];
      revealTimerRef.current.push(timer);
    });

    return () => {
      if (revealTimerRef.current) {
        revealTimerRef.current.forEach(timer => clearTimeout(timer));
        revealTimerRef.current = [];
      }
    };
  }, [dataObject, priorities]);

  return revealedData;
}

/**
 * Last Known Value Cache
 * Show cached value while refreshing, with "updating..." indicator
 */
export function useLastKnownValue(currentValue, cacheKey) {
  const [cachedValue, setCachedValue] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // On mount, load from localStorage
    if (!cachedValue) {
      const stored = localStorage.getItem(`cache_${cacheKey}`);
      if (stored) {
        try {
          setCachedValue(JSON.parse(stored));
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [cacheKey, cachedValue]);

  useEffect(() => {
    if (currentValue && currentValue !== cachedValue) {
      setIsUpdating(true);
      // Save to cache
      localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(currentValue));
      setCachedValue(currentValue);
      
      // Clear "updating" indicator after 500ms
      const timer = setTimeout(() => setIsUpdating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentValue, cachedValue, cacheKey]);

  return {
    displayValue: currentValue || cachedValue,
    isStale: !currentValue && !!cachedValue,
    isUpdating
  };
}