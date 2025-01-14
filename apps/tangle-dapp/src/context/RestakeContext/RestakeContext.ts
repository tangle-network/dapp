import {
  AssetBalanceMap,
  RestakeVaultAssetMap,
} from '@webb-tools/tangle-shared-ui/types/restake';
import { createContext } from 'react';
import { of } from 'rxjs';
import { RestakeContextType } from './types';

const RestakeContext = createContext<RestakeContextType>({
  assetMap: {},
  assetMap$: of<RestakeVaultAssetMap>({}),
  balances: {},
  balances$: of<AssetBalanceMap>({}),
  assetWithBalances: [],
  assetWithBalances$: of([]),
});

export default RestakeContext;
