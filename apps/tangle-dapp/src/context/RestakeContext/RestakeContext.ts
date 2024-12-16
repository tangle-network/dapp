import { createContext } from 'react';
import { RestakeContextType } from './types';
import { AssetMap } from '@webb-tools/tangle-shared-ui/types/restake';
import { of } from 'rxjs';
import { AssetBalanceMap } from '../../types/restake';

const RestakeContext = createContext<RestakeContextType>({
  assetMap: {},
  assetMap$: of<AssetMap>({}),
  balances: {},
  balances$: of<AssetBalanceMap>({}),
  assetWithBalances: [],
  assetWithBalances$: of([]),
});

export default RestakeContext;
