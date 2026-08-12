import { useEffect, useState } from 'react';

export function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const processedValue = typeof value === 'string' ? value.trim() : value;

    if (!processedValue && processedValue !== 0) {
      setDebounced(processedValue);
      return undefined;
    }

    const timer = window.setTimeout(() => setDebounced(processedValue), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}