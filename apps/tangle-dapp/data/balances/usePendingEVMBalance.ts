import { isAddress } from '@polkadot/util-crypto';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { useCallback, useMemo } from 'react';

import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import usePromise from '../../hooks/usePromise';
import useSubstrateTx from '../../hooks/useSubstrateTx';
import useViemPublicClient from '../../hooks/useViemPublicClient';
import { toEvmAddress20 } from '../../utils/toEvmAddress20';

export default function usePendingEVMBalance() {
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

  const withdrawTx = useSubstrateTx(
    useCallback(
      (api) => {
        if (
          evmAddress20 === null ||
          balance === null ||
          balance === ZERO_BIG_INT
        ) {
          return null;
        }

        return api.tx.evm.withdraw(evmAddress20, balance);
      },
      [evmAddress20, balance]
    )
  );

  return {
    balance,
    ...withdrawTx,
  };
}
