'use client';

import { Vault } from '../../../types/blueprint';
import { LiquidStakingToken } from '../../../types/liquidStaking';

export default function useVaults(): Vault[] {
  return [
    {
      LSTTokenIcon: LiquidStakingToken.DOT,
      name: 'Tangle Liquid Polkadot',
      apy: 50.123,
      tokensCount: 5,
      liquidity: {
        amount: 1000,
        usdValue: 10000,
      },
    },
    {
      LSTTokenIcon: LiquidStakingToken.ASTR,
      name: 'Tangle Liquid Astar',
      apy: 48,
      tokensCount: 10,
      liquidity: {
        amount: 23.34,
        usdValue: 233.4,
      },
    },
    {
      LSTTokenIcon: LiquidStakingToken.PHA,
      name: 'Tangle Liquid Phala',
      apy: 60.13,
      tokensCount: 7,
      liquidity: {
        amount: 50,
        usdValue: 500,
      },
    },
    {
      LSTTokenIcon: LiquidStakingToken.GLMR,
      name: 'Tangle Liquid Glimmer',
      apy: 0,
      tokensCount: 0,
      liquidity: {
        amount: 0,
        usdValue: 0,
      },
    },
    {
      LSTTokenIcon: LiquidStakingToken.MANTA,
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
