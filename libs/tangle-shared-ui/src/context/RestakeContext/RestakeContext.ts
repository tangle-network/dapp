'use client';

import { createContext } from 'react';
import { of } from 'rxjs';
import { AssetBalanceMap, RestakeVaultMap } from '../../types/restake';
import { RestakeContextType } from './types';

const RestakeContext = createContext<RestakeContextType>({
  vaults: {},
  vaults$: of<RestakeVaultMap>({}),
  balances: {},
  balances$: of<AssetBalanceMap>({}),
  assetWithBalances: [],
  assetWithBalances$: of([]),
});

export default RestakeContext;
