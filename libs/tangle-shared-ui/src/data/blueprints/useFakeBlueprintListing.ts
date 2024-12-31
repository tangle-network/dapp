'use client';

import { randNumber } from '@ngneat/falso';
import { useEffect, useState } from 'react';
import { Blueprint } from '../../types/blueprint';
import randBlueprint from './utils/randBlueprint';

const generateBlueprints = () => {
  return Array.from({ length: randNumber({ min: 2, max: 10 }) }, (_, idx) =>
    randBlueprint(idx.toString()),
  ).reduce(
    (acc, blueprint) => {
      acc[blueprint.id] = blueprint;
      return acc;
    },
    {} as Record<string, Blueprint>,
  );
};

export default function useFakeBlueprintListing(delayMs = 3000) {
  const [data, setData] = useState<Record<string, Blueprint>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setData({});

    const timer = setTimeout(() => {
      setIsLoading(false);
      setData(generateBlueprints());
    }, delayMs);

    return () => {
      clearTimeout(timer);
      setIsLoading(false);
      setData({});
    };
  }, [delayMs]);

  return {
    blueprints: data,
    isLoading,
    error: null as Error | null,
  };
}
