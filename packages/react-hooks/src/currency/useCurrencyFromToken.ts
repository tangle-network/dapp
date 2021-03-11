import { Token, token2CurrencyId } from '@webb-tools/sdk-core';
import { useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';

export const useCurrencyFromToken = (api: ApiPromise, token: Token) => {
  return useMemo(() => token2CurrencyId(api, token), [api, token]);
};
