'use client';

import { LiquidStakingToken } from '../../types/liquidStaking';
import { Vault } from '../../types/liquidStaking';

export default function useVaults(): Vault[] {
  return [
    {
      lstToken: LiquidStakingToken.DOT,
      name: 'Tangle Liquid Polkadot',
      tvl: {
        value: 2000,
        valueInUSD: 20000,
      },
      derivativeTokens: 5,
      myStake: {
        value: 1000,
        valueInUSD: 10000,
      },
      assets: [
        {
          id: '31234',
          token: 'tgDOT_A',
          tvl: 5588.23,
          apy: 10.12,
          myStake: 10.12,
        },
        {
          id: '31235',
          token: 'tgDOT_B',
          tvl: 2044.12,
          apy: 0,
          myStake: 0,
        },
        {
          id: '31236',
          token: 'tgDOT_C',
          tvl: 123.12,
          apy: 16,
          myStake: 16,
        },
        {
          id: '31237',
          token: 'tgDOT_D',
          tvl: 6938.87,
          apy: 100,
          myStake: 100,
        },
        {
          id: '31238',
          token: 'tgDOT_E',
          tvl: 0,
          apy: 0,
          myStake: 0,
        },
      ],
    },
    {
      lstToken: LiquidStakingToken.ASTR,
      name: 'Tangle Liquid Astar',
      tvl: {
        value: 48,
        valueInUSD: 480,
      },
      derivativeTokens: 10,
      myStake: {
        value: 23.34,
        valueInUSD: 233.4,
      },
      assets: [
        {
          id: '31234',
          token: 'tgDOT_A',
          tvl: 5588.23,
          apy: 10.12,
          myStake: 10.12,
        },
        {
          id: '31235',
          token: 'tgDOT_B',
          tvl: 2044.12,
          apy: 0,
          myStake: 0,
        },
        {
          id: '31236',
          token: 'tgDOT_C',
          tvl: 123.12,
          apy: 16,
          myStake: 16,
        },
        {
          id: '31237',
          token: 'tgDOT_D',
          tvl: 6938.87,
          apy: 100,
          myStake: 100,
        },
        {
          id: '31238',
          token: 'tgDOT_E',
          tvl: 0,
          apy: 0,
          myStake: 0,
        },
      ],
    },
    {
      lstToken: LiquidStakingToken.PHA,
      name: 'Tangle Liquid Phala',
      tvl: {
        value: 60.13,
        valueInUSD: 601.3,
      },
      derivativeTokens: 7,
      myStake: {
        value: 50,
        valueInUSD: 500,
      },
      assets: [
        {
          id: '31234',
          token: 'tgDOT_A',
          tvl: 5588.23,
          apy: 10.12,
          myStake: 10.12,
        },
        {
          id: '31235',
          token: 'tgDOT_B',
          tvl: 2044.12,
          apy: 0,
          myStake: 0,
        },
        {
          id: '31236',
          token: 'tgDOT_C',
          tvl: 123.12,
          apy: 16,
          myStake: 16,
        },
        {
          id: '31237',
          token: 'tgDOT_D',
          tvl: 6938.87,
          apy: 100,
          myStake: 100,
        },
        {
          id: '31238',
          token: 'tgDOT_E',
          tvl: 0,
          apy: 0,
          myStake: 0,
        },
      ],
    },
    {
      lstToken: LiquidStakingToken.GLMR,
      name: 'Tangle Liquid Glimmer',
      tvl: {
        value: 0,
        valueInUSD: 0,
      },
      derivativeTokens: 0,
      myStake: {
        value: 0,
        valueInUSD: 0,
      },
      assets: [
        {
          id: '31234',
          token: 'tgDOT_A',
          tvl: 5588.23,
          apy: 10.12,
          myStake: 10.12,
        },
        {
          id: '31235',
          token: 'tgDOT_B',
          tvl: 2044.12,
          apy: 0,
          myStake: 0,
        },
        {
          id: '31236',
          token: 'tgDOT_C',
          tvl: 123.12,
          apy: 16,
          myStake: 16,
        },
        {
          id: '31237',
          token: 'tgDOT_D',
          tvl: 6938.87,
          apy: 100,
          myStake: 100,
        },
        {
          id: '31238',
          token: 'tgDOT_E',
          tvl: 0,
          apy: 0,
          myStake: 0,
        },
      ],
    },
    {
      lstToken: LiquidStakingToken.MANTA,
      name: 'Tangle Liquid Manta',
      tvl: {
        value: 0,
        valueInUSD: 0,
      },
      derivativeTokens: 0,
      myStake: {
        value: 0,
        valueInUSD: 0,
      },
      assets: [
        {
          id: '31234',
          token: 'tgDOT_A',
          tvl: 5588.23,
          apy: 10.12,
          myStake: 10.12,
        },
        {
          id: '31235',
          token: 'tgDOT_B',
          tvl: 2044.12,
          apy: 0,
          myStake: 0,
        },
        {
          id: '31236',
          token: 'tgDOT_C',
          tvl: 123.12,
          apy: 16,
          myStake: 16,
        },
        {
          id: '31237',
          token: 'tgDOT_D',
          tvl: 6938.87,
          apy: 100,
          myStake: 100,
        },
        {
          id: '31238',
          token: 'tgDOT_E',
          tvl: 0,
          apy: 0,
          myStake: 0,
        },
      ],
    },
  ];
}
