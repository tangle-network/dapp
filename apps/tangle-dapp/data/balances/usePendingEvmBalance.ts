import { useCallback, useMemo } from 'react';

import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import usePromise from '../../hooks/usePromise';
import useViemPublicClient from '../../hooks/useViemPublicClient';
import { toEvmAddress20 } from '../../utils';

/**
 * See more here:
 * https://docs.tangle.tools/docs/use/addresses/#case-2-sending-from-evm-to-substrate
 */
const usePendingEvmBalance = () => {
  const viemPublicClient = useViemPublicClient();
  const { substrateAddress, isEvm } = useAgnosticAccountInfo();

  // Only check the EVM balance if the active account address
  // is a Substrate address.
  const evmAddress20 = useMemo(() => {
    if (substrateAddress === null || isEvm) {
      return null;
    }

    return toEvmAddress20(substrateAddress);
  }, [isEvm, substrateAddress]);

  const { result: balance } = usePromise(
    useCallback(async () => {
      if (viemPublicClient === null || evmAddress20 === null) {
        return null;
      }

      return viemPublicClient.getBalance({ address: evmAddress20 });
    }, [evmAddress20, viemPublicClient]),
    null
  );

  return balance;
};

export default usePendingEvmBalance;
