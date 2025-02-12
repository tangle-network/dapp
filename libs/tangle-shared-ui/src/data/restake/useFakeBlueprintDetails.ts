'use client';

import { useEffect, useState } from 'react';
import { PREVIEW_BLUEPRINTS } from '../blueprints/useFakeBlueprintListing';
import randOperator from './utils/randOperator';

export default function useFakeBlueprintDetails(id: string, delayMs = 3000) {
  const [result, setResult] = useState<{
    details: typeof PREVIEW_BLUEPRINTS[keyof typeof PREVIEW_BLUEPRINTS];
    operators: ReturnType<typeof randOperator>[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setResult(null);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setResult({
        details: PREVIEW_BLUEPRINTS[id] ?? PREVIEW_BLUEPRINTS['1'], // Fallback to first blueprint if ID not found
        operators: Array(3).fill(null).map(randOperator), // Generate 3 random operators
      });
    }, delayMs);

    return () => {
      clearTimeout(timer);
      setIsLoading(false);
      setResult(null);
    };
  }, [delayMs, id]);

  return {
    result,
    isLoading,
    error: null as Error | null,
  };
}
