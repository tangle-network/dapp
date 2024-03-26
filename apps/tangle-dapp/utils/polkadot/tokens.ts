import { BN, formatBalance } from '@polkadot/util';

import { TANGLE_TOKEN_DECIMALS, TANGLE_TOKEN_UNIT } from '../../constants';
import { getPolkadotApiPromise } from './api';

export const formatTokenBalance = (balance: BN, includeUnit = true): string => {
  return formatBalance(balance, {
    decimals: TANGLE_TOKEN_DECIMALS,
    withUnit: includeUnit ? TANGLE_TOKEN_UNIT : false,
  });
};

export const getNativeTokenSymbol = async (rpcEndpoint: string) => {
  const api = await getPolkadotApiPromise(rpcEndpoint);

  const nativeTokenSymbol = (await api.rpc.system.properties()).tokenSymbol
    .unwrap()[0]
    .toString();

  return nativeTokenSymbol;
};
