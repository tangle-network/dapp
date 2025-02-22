'use client';

import { createContext } from 'react';
import noop from 'lodash/noop';
import {
  AssetBalanceMap,
  RestakeAssetMapWithBalances,
  RestakeAssetMap,
} from '../../types/restake';

type Context = {
  refetchErc20Balances: () => Promise<void>;
  balances: AssetBalanceMap;
  assetWithBalances: RestakeAssetMapWithBalances | null;
  assets: RestakeAssetMap | null;
};

const RestakeContext = createContext<Context>({
  assets: null,
  balances: {},
  assetWithBalances: null,
  refetchErc20Balances: noop as () => Promise<void>,
});

export default RestakeContext;
