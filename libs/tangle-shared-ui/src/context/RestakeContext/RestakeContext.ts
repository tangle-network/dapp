'use client';

import { createContext } from 'react';
import noop from 'lodash/noop';
import { RestakeAssetMap } from '../../types/restake';

type Context = {
  refetchErc20Balances: () => Promise<void>;
  assets: RestakeAssetMap | null;
};

const RestakeContext = createContext<Context>({
  assets: null,
  refetchErc20Balances: noop as () => Promise<void>,
});

export default RestakeContext;
