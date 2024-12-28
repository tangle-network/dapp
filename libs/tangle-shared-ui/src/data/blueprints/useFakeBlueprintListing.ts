'use client';

import { randNumber } from '@ngneat/falso';
import { useEffect, useState } from 'react';
import { Blueprint } from '../../types/blueprint';
import randBlueprint from './utils/randBlueprint';

const generateBlueprints = () => {
  return Array.from({ length: randNumber({ min: 2, max: 10 }) }, (_, idx) =>
    randBlueprint(idx.toString()),
  );
};

export default function useFakeBlueprintListing(delayMs = 3000) {
  const [data, setData] = useState<Blueprint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setData([]);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setError(null);
      setData(generateBlueprints());
    }, delayMs);

    return () => {
      clearTimeout(timer);
      setIsLoading(false);
      setError(null);
      setData([]);
    };
  }, [delayMs]);

  return {
    blueprints: data,
    isLoading,
    error,
  };
}
