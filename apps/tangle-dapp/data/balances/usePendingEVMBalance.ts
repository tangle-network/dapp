import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import isSubstrateAddress from '@webb-tools/dapp-types/utils/isSubstrateAddress';
import { useCallback, useMemo } from 'react';

import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import usePromise from '../../hooks/usePromise';
import useSubstrateTx from '../../hooks/useSubstrateTx';
import useViemPublicClient from '../../hooks/useViemPublicClient';
import { substrateToEvmAddress } from '../../utils/substrateToEvmAddress';

export default function usePendingEVMBalance() {
  const activeAccountAddress = useActiveAccountAddress();

  // Only check the evm balance if the active account address is Substrate address.
  const address = useMemo(() => {
    if (!isValidAddress(activeAccountAddress)) {
      return null;
    }

    return substrateToEvmAddress(activeAccountAddress);
  }, [activeAccountAddress]);

  const evmClient = useViemPublicClient();

  const { result: balance } = usePromise(
    useCallback(async () => {
      if (!evmClient || address === null) {
        return null;
      }

      return evmClient.getBalance({
        address,
      });
    }, [address, evmClient]),
    null
  );

  const withdrawTx = useSubstrateTx(
    useCallback(
      (api) => {
        if (address === null || balance === null || balance === ZERO_BIG_INT) {
          return null;
        }

        return api.tx.evm.withdraw(address, balance);
      },
      [address, balance]
    )
  );

  return {
    balance,
    ...withdrawTx,
  };
}

/** @internal */
const isValidAddress = (address: string | null): address is string =>
  address !== null && isSubstrateAddress(address);
