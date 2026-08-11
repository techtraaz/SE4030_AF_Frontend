import { useEffect, useRef, useCallback } from 'react';

export const useAutoPolling = (callback, interval = 6000, enabled = true) => {
  const timeoutRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      await callback();
    } catch (error) {
      console.error('Polling error:', error);
    } finally {
      if (enabled) {
        timeoutRef.current = setTimeout(poll, interval);
      }
    }
  }, [callback, interval, enabled]);

  useEffect(() => {
    if (enabled) {
      poll();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [poll, enabled]);

  return { stopPolling: () => clearTimeout(timeoutRef.current) };
};