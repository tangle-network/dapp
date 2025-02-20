'use client';

import { useEffect, useState } from 'react';
import randOperator from './utils/randOperator';

// Define sample blueprint data directly here since PREVIEW_BLUEPRINTS isn't available
const SAMPLE_BLUEPRINTS = {
  '1': {
    id: '1',
    name: 'Sample Blueprint 1',
    description: 'This is a sample blueprint for testing purposes',
    author: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    imgUrl: '/static/assets/blueprints/default.png',
    category: 'DeFi',
    restakersCount: 10,
    operatorsCount: 3,
    tvl: '$100,000',
    isBoosted: false,
    githubUrl: 'https://github.com/sample/blueprint',
    websiteUrl: 'https://example.com',
    twitterUrl: 'https://twitter.com/sample',
    email: 'contact@example.com',
    readme: `## Overview
This Tangle Blueprint provides an automated Discord channel summarization service.

## Features
- Automated 24-hour channel summarization
- On-chain result verification
- AI-powered content summarization
- Easy operator registration and management

## Prerequisites
- Rust
- Discord Bot Token
- Access to Tangle Network (testnet)`,
    jobs: [
      {
        id: '1',
        name: 'start_summarizer',
        description: 'Starts the Discord channel summarizer service',
        params: ['Optional<String>'],
        result: ['String']
      },
      {
        id: '2',
        name: 'stop_summarizer',
        description: 'Stops the Discord channel summarizer service',
        params: [],
        result: ['String']
      }
    ]
  },
  '2': {
    id: '2',
    name: 'Sample Blueprint 2',
    description: 'Another sample blueprint for testing',
    author: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
    imgUrl: '/static/assets/blueprints/default.png',
    category: 'Gaming',
    restakersCount: 5,
    operatorsCount: 2,
    tvl: '$50,000',
    isBoosted: true,
    githubUrl: 'https://github.com/sample/blueprint2',
    websiteUrl: 'https://example2.com',
    twitterUrl: 'https://twitter.com/sample2',
    email: 'contact@example2.com',
    readme: `# Gaming Blueprint 🎮

## Overview
This is another sample blueprint for testing purposes.

## Features
- Feature 1
- Feature 2
- Feature 3

## Prerequisites
- Requirement 1
- Requirement 2`,
    jobs: [
      {
        id: '1',
        name: 'start_game',
        description: 'Starts the gaming service',
        params: ['GameConfig'],
        result: ['GameInstance']
      }
    ]
  }
};

export default function useFakeBlueprintDetails(id: string, delayMs = 3000) {
  const [result, setResult] = useState<{
    details: typeof SAMPLE_BLUEPRINTS[keyof typeof SAMPLE_BLUEPRINTS];
    operators: ReturnType<typeof randOperator>[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setResult(null);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setResult({
        details: SAMPLE_BLUEPRINTS[id as keyof typeof SAMPLE_BLUEPRINTS] ?? SAMPLE_BLUEPRINTS['1'],
        operators: Array(3).fill(null).map(randOperator),
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
