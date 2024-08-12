'use client';

import { Vault } from '../../../types/blueprint';
import { LiquidStakingToken } from '../../../types/liquidStaking';

export default function useVaults(): Vault[] {
  return [
    {
      lstToken: LiquidStakingToken.DOT,
      name: 'Tangle Liquid Polkadot',
      apy: 50.123,
      tokensCount: 5,
      liquidity: {
        amount: 1000,
        usdValue: 10000,
      },
    },
    {
      lstToken: LiquidStakingToken.ASTR,
      name: 'Tangle Liquid Astar',
      apy: 48,
      tokensCount: 10,
      liquidity: {
        amount: 23.34,
        usdValue: 233.4,
      },
    },
    {
      lstToken: LiquidStakingToken.PHA,
      name: 'Tangle Liquid Phala',
      apy: 60.13,
      tokensCount: 7,
      liquidity: {
        amount: 50,
        usdValue: 500,
      },
    },
    {
      lstToken: LiquidStakingToken.GLMR,
      name: 'Tangle Liquid Glimmer',
      apy: 0,
      tokensCount: 0,
      liquidity: {
        amount: 0,
        usdValue: 0,
      },
    },
    {
      lstToken: LiquidStakingToken.MANTA,
      name: 'Tangle Liquid Manta',
      apy: 0,
      tokensCount: 0,
      liquidity: {
        amount: 0,
        usdValue: 0,
      },
    },
  ];
}
