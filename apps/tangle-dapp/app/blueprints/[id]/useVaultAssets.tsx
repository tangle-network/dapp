'use client';

export default function useVaultAssets(_: string) {
  return [
    {
      id: '31234',
      symbol: 'tgDOT_A',
      decimals: 18,
      tvl: 5588.23,
      selfStake: BigInt('1012000000000000000000'),
    },
    {
      id: '31235',
      symbol: 'tgDOT_B',
      decimals: 18,
      tvl: 2044.12,
      selfStake: BigInt(0),
    },
    {
      id: '31236',
      symbol: 'tgDOT_C',
      decimals: 18,
      tvl: 123.12,
      selfStake: BigInt('16000000000000000000'),
    },
    {
      id: '31237',
      symbol: 'tgDOT_D',
      decimals: 18,
      tvl: 6938.87,
      selfStake: BigInt('100000000000000000000'),
    },
    {
      id: '31238',
      symbol: 'tgDOT_E',
      decimals: 18,
      tvl: 0,
      selfStake: BigInt(0),
    },
  ];
}
