'use client';

import { Blueprint } from '../../../types/blueprint';

export default function useBlueprintDetails(_: string): Blueprint {
  //   TODO: implement logic (get from local storage first if available)

  return {
    id: '0',
    name: 'Groth16 ZK-SaaS',
    author: 'Webb Technologies Inc.',
    category: 'Category 1',
    imgUrl:
      'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'A ZK-SaaS service utilizing the Groth16 proving system for efficient and secure zero-knowledge proofs. Ideal for applications requiring fast verification times. This blueprint is boosted. Deploy now to start earning rewards. Random text to test the line-clamp-3. Random text to test the line-clamp-3. Random text to test the line-clamp-3.',
    restakersCount: 10,
    operatorsCount: 2,
    tvl: '$100',
    isBoosted: true,
    githubUrl: 'https://github.com/webb-tools/tangle',
    websiteUrl: 'https://tangle.tools/',
    twitterUrl: 'https://x.com/tangle_network',
    email: 'drew@webb.tools',
  };
}
