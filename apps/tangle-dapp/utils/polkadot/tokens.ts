import { BN, formatBalance } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';

import { getPolkadotApiPromise } from './api';

export const formatTokenBalance = (
  balance: BN | bigint,
  tokenSymbol?: string,
  options: Parameters<typeof formatBalance>[1] = {}
): string => {
  return formatBalance(balance, {
    decimals: TANGLE_TOKEN_DECIMALS,
    withZero: false,
    forceUnit: '-',
    withUnit: tokenSymbol ?? false,
    ...options,
  });
};

export const getNativeTokenSymbol = async (rpcEndpoint: string) => {
  const api = await getPolkadotApiPromise(rpcEndpoint);

  const nativeTokenSymbol = (await api.rpc.system.properties()).tokenSymbol
    .unwrap()[0]
    .toString();

  return nativeTokenSymbol;
};
