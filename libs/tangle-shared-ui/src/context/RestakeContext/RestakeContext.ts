'use client';

import { createContext } from 'react';
import noop from 'lodash/noop';
import {
  AssetBalanceMap,
  AssetWithBalance,
  RestakeAssetMap,
} from '../../types/restake';

type Context = {
  refetchErc20Balances: () => Promise<void>;
  balances: AssetBalanceMap;
  assetWithBalances: AssetWithBalance;
  assets: RestakeAssetMap;
};

const RestakeContext = createContext<Context>({
  assets: {},
  balances: {},
  assetWithBalances: {},
  refetchErc20Balances: noop as () => Promise<void>,
});

export default RestakeContext;
