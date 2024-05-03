import { BN, formatBalance } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';

import { TANGLE_TOKEN_DECIMALS } from '../../constants';
import { getApiPromise } from './api';

export const formatTokenBalance = (
  balance: BN | bigint,
  tokenSymbol?: string
): string => {
  return formatBalance(balance, {
    decimals: TANGLE_TOKEN_DECIMALS,
    withZero: false,
    withUnit: tokenSymbol ?? false,
  });
};

export const getNativeTokenSymbol = async (rpcEndpoint: string) => {
  const api = await getApiPromise(rpcEndpoint);

  const nativeTokenSymbol = (await api.rpc.system.properties()).tokenSymbol
    .unwrap()[0]
    .toString();

  return nativeTokenSymbol;
};
