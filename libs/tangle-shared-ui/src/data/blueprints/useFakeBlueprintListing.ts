'use client';

import { randNumber } from '@ngneat/falso';
import { useEffect, useState } from 'react';
import { Blueprint } from '../../types/blueprint';
import randBlueprint from './utils/randBlueprint';

const generateBlueprints = () => {
  return Array.from({ length: randNumber({ min: 2, max: 10 }) }, (_, idx) =>
    randBlueprint(BigInt(idx)),
  ).reduce((acc, blueprint) => {
    acc.set(blueprint.id, blueprint);

    return acc;
  }, new Map<bigint, Blueprint>());
};

const EMPTY_BLUEPRINTS = new Map<bigint, Blueprint>();

const useFakeBlueprintListing = (delayMs = 3000) => {
  const [state, setState] = useState<{
    delayMs: number;
    data: Map<bigint, Blueprint>;
    isLoading: boolean;
  }>(() => ({
    delayMs,
    data: EMPTY_BLUEPRINTS,
    isLoading: true,
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setState({
        delayMs,
        data: generateBlueprints(),
        isLoading: false,
      });
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [delayMs]);

  const isCurrentRequest = state.delayMs === delayMs;

  return {
    blueprints: isCurrentRequest ? state.data : EMPTY_BLUEPRINTS,
    isLoading: !isCurrentRequest || state.isLoading,
    error: null satisfies Error | null,
  };
};

export default useFakeBlueprintListing;
