'use client';

import { randNumber } from '@ngneat/falso';
import { useEffect, useState } from 'react';
import randBlueprint from '../blueprints/utils/randBlueprint';
import randOperator from './utils/randOperator';

const generateBlueprintDetails = (id: string) => {
  return {
    details: randBlueprint(id),
    operators: Array.from({ length: randNumber({ max: 5 }) }).map(randOperator),
  };
};

export default function useFakeBlueprintDetails(id: string, delayMs = 3000) {
  const [result, setResult] = useState<ReturnType<
    typeof generateBlueprintDetails
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setResult(null);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setResult(generateBlueprintDetails(id));
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
