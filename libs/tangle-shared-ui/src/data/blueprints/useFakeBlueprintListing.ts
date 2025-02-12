'use client';

import { useEffect, useState } from 'react';
import { Blueprint } from '../../types/blueprint';

// Preview blueprints data
const PREVIEW_BLUEPRINTS: Record<string, Blueprint> = {
  '1': {
    id: '1',
    name: 'Gaia AI Agent',
    author: 'metadata: author',
    imgUrl: '/static/assets/blueprints/gaia-ai.png',
    description: 'The Gaia AI Agent AVS Blueprint is a templated Autonomous Validation Service (AVS) Blueprint for managing and interacting with Gaia AI Nodes.',
    category: 'AI',
    restakersCount: 0,
    operatorsCount: 0,
    tvl: '-',
    isBoosted: false,
    registrationParams: [],
    githubUrl: null,
    websiteUrl: null,
    twitterUrl: null,
    email: null,
  },
  '2': {
    id: '2',
    name: 'LayerZero DVN',
    author: 'metadata: author',
    imgUrl: '/static/assets/blueprints/layerzero.png',
    description: 'This project provides a template for creating LayerZero Executor Blueprints on the Tangle Network. Executors are crucial components of the LayerZero protocol, responsible for committing and executing cross-chain messaging.',
    category: 'Bridge',
    restakersCount: 0,
    operatorsCount: 0,
    tvl: '-',
    isBoosted: false,
    registrationParams: [],
    githubUrl: null,
    websiteUrl: null,
    twitterUrl: null,
    email: null,
  },
  '3': {
    id: '3',
    name: 'Hyperlane Relayer',
    author: 'metadata: author',
    imgUrl: '/static/assets/blueprints/hyperlane.png',
    description: 'CGGMP21 is a state-of-art ECDSA TSS protocol that supports 1-round signing (requires preprocessing), identifiable abort, provides two signing protocols (3+1 and 5+1 rounds with different complexity of abort identification) and supports arbitrary threshold access structures.',
    category: 'Bridge',
    restakersCount: 0,
    operatorsCount: 0,
    tvl: '-',
    isBoosted: true,
    registrationParams: [],
    githubUrl: null,
    websiteUrl: null,
    twitterUrl: null,
    email: null,
  },
  // ... Add other blueprints following the same pattern
};

export default function useFakeBlueprintListing(delayMs = 3000) {
  const [data, setData] = useState<Record<string, Blueprint>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setData({});

    const timer = setTimeout(() => {
      setIsLoading(false);
      // Use PREVIEW_BLUEPRINTS instead of generating random data
      setData(PREVIEW_BLUEPRINTS);
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
