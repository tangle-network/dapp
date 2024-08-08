'use client';

import { Operator } from '../../../types/blueprint';

export default function useOperators(): Operator[] {
  return [
    {
      address: 'tgDRbUxr3dV3j5pCW7DrpmswiABCMTN2NxioeDfA9TXLw6X1u',
      identityName: 'PIKACHU.COM',
      restakersCount: 43,
      concentration: 50.123,
      liquidity: {
        amount: 1000,
        usdValue: 10000,
      },
      vaults: ['astr', 'dot', 'link'],
    },
    {
      address: 'tgDRbUxr3dV3j5pCW7DrpmswiABCMTN2NxioeDfA9TXLw6X1u',
      identityName: 'CHARIZARD.COM',
      restakersCount: 24,
      concentration: 60.89,
      liquidity: {
        amount: 50,
        usdValue: 500,
      },
      vaults: ['manta', 'dot', 'link', 'astr'],
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
      vaults: ['tnt', 'dot', 'manta'],
    },
    {
      address: 'tgDRbUxr3dV3j5pCW7DrpmswiABCMTN2NxioeDfA9TXLw6X1u',
      identityName: 'GENGAR.COM',
      restakersCount: 12,
      concentration: 55,
      liquidity: {
        amount: 12,
        usdValue: 120,
      },
      vaults: ['tnt', 'link'],
    },
  ];
}
