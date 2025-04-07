'use client';

import { randNumber } from '@ngneat/falso';
import { useEffect, useState } from 'react';
import { Blueprint } from '../../types/blueprint';
import randBlueprint from './utils/randBlueprint';

const generateBlueprints = () => {
  return Array.from({ length: randNumber({ min: 2, max: 10 }) }, (_, idx) =>
    randBlueprint(BigInt(idx)),
  ).reduce(
    (acc, blueprint) => {
      acc.set(blueprint.id, blueprint);

      return acc;
    },
    new Map<bigint, Blueprint>(),
  );
};

export default function useFakeBlueprintListing(delayMs = 3000) {
  const [data, setData] = useState<Map<bigint, Blueprint>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setData(new Map());

    const timer = setTimeout(() => {
      setIsLoading(false);
      setData(generateBlueprints());
    }, delayMs);

    return () => {
      clearTimeout(timer);
      setIsLoading(false);
      setData(new Map());
    };
  }, [delayMs]);

  return {
    blueprints: data,
    isLoading,
    error: null as Error | null,
  };
}
