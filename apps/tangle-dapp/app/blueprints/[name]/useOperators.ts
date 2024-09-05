'use client';

import { Operator } from '../../../types/blueprint';
import { LiquidStakingToken } from '../../../types/liquidStaking';

export default function useOperators(): Operator[] {
  return [
    {
      address: 'tgC2pxrFu34VuBNGsz3yes6PYnE8cf6VQ5JroY96NTUW5cmU2',
      identityName: 'PIKACHU.COM',
      restakersCount: 43,
      concentration: 50.123,
      liquidity: {
        amount: 1000,
        usdValue: 10000,
      },
      vaults: [
        LiquidStakingToken.ASTR,
        LiquidStakingToken.DOT,
        LiquidStakingToken.GLMR,
      ],
    },
    {
      address: 'tgCFwkpaXGNNfaFQ4dKDCrGkARQztJp82ekxwRJav9MhMiqD1',
      identityName: 'CHARIZARD.COM',
      restakersCount: 24,
      concentration: 60.89,
      liquidity: {
        amount: 50,
        usdValue: 500,
      },
      vaults: [
        LiquidStakingToken.MANTA,
        LiquidStakingToken.DOT,
        LiquidStakingToken.GLMR,
        LiquidStakingToken.ASTR,
      ],
    },
    {
      address: 'tgDRbUxr3dV3j5pCW7DrpmswiABCMTN2NxioeDfA9TXLw6X1u',
      identityName: 'BULBASAUR.COM',
      restakersCount: 16,
      concentration: 40,
      liquidity: {
        amount: 23.34,
        usdValue: 233.4,
      },
      vaults: [
        LiquidStakingToken.TNT,
        LiquidStakingToken.DOT,
        LiquidStakingToken.MANTA,
      ],
    },
    {
      address: 'tgCZuFEMk6yFqTzjSs9sZrdSHAWUXRuneA2e1TRxE8GcLQyfS',
      identityName: 'GENGAR.COM',
      restakersCount: 12,
      concentration: 55,
      liquidity: {
        amount: 12,
        usdValue: 120,
      },
      vaults: [LiquidStakingToken.TNT, LiquidStakingToken.GLMR],
    },
  ];
}
