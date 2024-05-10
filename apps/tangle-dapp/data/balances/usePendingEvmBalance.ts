import { isAddress } from '@polkadot/util-crypto';
import { useCallback, useMemo } from 'react';

import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import usePromise from '../../hooks/usePromise';
import useViemPublicClient from '../../hooks/useViemPublicClient';
import { toEvmAddress20 } from '../../utils/toEvmAddress20';

export default function usePendingEvmBalance() {
  const activeAccountAddress = useActiveAccountAddress();

  // Only check the EVM balance if the active account address
  // is a Substrate address.
  const evmAddress20 = useMemo(() => {
    if (activeAccountAddress === null || !isAddress(activeAccountAddress)) {
      return null;
    }

    return toEvmAddress20(activeAccountAddress);
  }, [activeAccountAddress]);

  const evmClient = useViemPublicClient();

  const { result: balance } = usePromise(
    useCallback(async () => {
      if (!evmClient || evmAddress20 === null) {
        return null;
      }

      return evmClient.getBalance({
        address: evmAddress20,
      });
    }, [evmAddress20, evmClient]),
    null
  );

  return balance;
}
